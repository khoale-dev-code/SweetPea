"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Gauge,
  ImageUp,
  Leaf,
  Loader2,
  LockKeyhole,
  LogOut,
  Newspaper,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Search,
  ShoppingBag,
  Store,
  Trash2,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type { MenuCategory, MenuItem, ShopSettings, StoreData } from "@/lib/types";

const NEWS_CATEGORY_SLUG = "ban-tin";

type AdminData = StoreData & { latencyMs: number };
type ItemDraft = Omit<MenuItem, "id"> & { id?: string };
type NewsDraft = {
  id?: string;
  title: string;
  content: string;
  image_url: string;
  is_featured: boolean;
  is_published: boolean;
  sort_order: number;
};

const emptyItem = (categoryId = ""): ItemDraft => ({
  name: "",
  category_id: categoryId,
  description: "",
  price: 0,
  image_url: "",
  is_featured: false,
  is_available: true,
  sort_order: 0,
});

const emptyNews = (): NewsDraft => ({
  title: "",
  content: "",
  image_url: "",
  is_featured: false,
  is_published: true,
  sort_order: 0,
});

function menuCategories(data: Pick<StoreData, "categories">) {
  return data.categories.filter((category) => category.slug !== NEWS_CATEGORY_SLUG);
}

function money(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value) + "đ";
}

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
  });
  const body = (await response.json().catch(() => ({}))) as T & { error?: string };
  if (!response.ok) throw new Error(body.error || "Không thể xử lý yêu cầu.");
  return body;
}

async function uploadToCloudinary(file: File) {
  if (!file.type.startsWith("image/") || file.size > 8 * 1024 * 1024) {
    throw new Error("Ảnh phải đúng định dạng và nhỏ hơn 8MB.");
  }
  const signed = await api<{
    cloudName: string;
    apiKey: string;
    folder: string;
    timestamp: number;
    signature: string;
  }>("/api/admin/upload-signature", { method: "POST" });
  const form = new FormData();
  form.append("file", file);
  form.append("api_key", signed.apiKey);
  form.append("folder", signed.folder);
  form.append("timestamp", String(signed.timestamp));
  form.append("signature", signed.signature);
  const response = await fetch(`https://api.cloudinary.com/v1_1/${signed.cloudName}/image/upload`, { method: "POST", body: form });
  const result = (await response.json()) as { secure_url?: string; error?: { message?: string } };
  if (!response.ok || !result.secure_url) throw new Error(result.error?.message || "Tải ảnh thất bại.");
  return result.secure_url;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-[#40594c]">
      {label}
      {children}
    </label>
  );
}

function DeleteConfirm({ label, onConfirm, disabled }: { label: string; onConfirm: () => void; disabled?: boolean }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button type="button" variant="outline" size="icon" disabled={disabled} className="rounded-full border-red-200 text-red-700 hover:bg-red-50">
          <Trash2 size={16} />
          <span className="sr-only">Xóa {label}</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="border-[#ddd5c5] bg-[#fffdf8]">
        <AlertDialogHeader>
          <AlertDialogTitle>Xóa {label}?</AlertDialogTitle>
          <AlertDialogDescription>Thao tác này không thể hoàn tác. Dữ liệu sẽ bị xóa khỏi menu ngay lập tức.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Giữ lại</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-red-700 text-white hover:bg-red-800">Xóa</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function AdminConsole() {
  const [status, setStatus] = useState<"checking" | "login" | "ready">("checking");
  const [key, setKey] = useState("");
  const [data, setData] = useState<AdminData | null>(null);
  const [itemDraft, setItemDraft] = useState<ItemDraft>(() => emptyItem());
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    try {
      setError("");
      const result = await api<AdminData>("/api/admin/menu", { cache: "no-store" });
      setData(result);
      setStatus("ready");
      setItemDraft((current) =>
        current.category_id ? current : { ...current, category_id: menuCategories(result)[0]?.id || "" },
      );
    } catch (requestError) {
      const text = requestError instanceof Error ? requestError.message : "Không thể tải dữ liệu.";
      if (text.includes("hết hạn")) setStatus("login");
      else setError(text);
    }
  }, []);

  useEffect(() => {
    api<{ authenticated: boolean }>("/api/admin/session", { cache: "no-store" })
      .then((result) => (result.authenticated ? loadData() : setStatus("login")))
      .catch(() => setStatus("login"));
  }, [loadData]);

  async function login(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api("/api/admin/session", { method: "POST", body: JSON.stringify({ key }) });
      setKey("");
      await loadData();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Không thể đăng nhập.");
    } finally {
      setSaving(false);
    }
  }

  async function logout() {
    await api("/api/admin/session", { method: "DELETE" }).catch(() => null);
    setData(null);
    setStatus("login");
  }

  async function mutate(url: string, init: RequestInit, success: string) {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await api(url, init);
      await loadData();
      setMessage(success);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Không thể lưu dữ liệu.");
    } finally {
      setSaving(false);
    }
  }

  async function saveItem(event: React.FormEvent) {
    event.preventDefault();
    const editing = Boolean(itemDraft.id);
    await mutate(
      "/api/admin/menu",
      {
        method: editing ? "PATCH" : "POST",
        body: JSON.stringify({ entity: "item", id: itemDraft.id, data: itemDraft }),
      },
      editing ? "Đã cập nhật món." : "Đã thêm món mới.",
    );
    setItemDraft(emptyItem(data ? menuCategories(data)[0]?.id || "" : ""));
  }

  async function uploadImage(file?: File) {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const imageUrl = await uploadToCloudinary(file);
      setItemDraft((current) => ({ ...current, image_url: imageUrl }));
      setMessage("Đã tải ảnh lên. Bấm Lưu món để hoàn tất.");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Tải ảnh thất bại.");
    } finally {
      setUploading(false);
    }
  }

  if (status === "checking") {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f8f2e6]">
        <div className="text-center text-[#245943]"><Loader2 className="mx-auto animate-spin" size={34} /><p className="mt-4 text-sm font-semibold">Đang kiểm tra phiên quản trị…</p></div>
      </main>
    );
  }

  if (status === "login") {
    return (
      <main className="paper-texture grid min-h-screen place-items-center px-4 py-10">
        <form onSubmit={login} className="leaf-shadow w-full max-w-md rounded-[2.5rem] border border-[#d8d1c1] bg-[#fffdf8] p-6 sm:p-9">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-[#607166] hover:text-[#245943]"><ArrowLeft size={17} /> Về trang chủ</Link>
          <span className="mt-10 grid h-14 w-14 place-items-center rounded-2xl bg-[#e5ebca] text-[#245943]"><LockKeyhole size={24} /></span>
          <h1 className="font-display mt-6 text-4xl font-semibold tracking-[-0.04em] text-[#214e3d]">Sweet Pea Admin</h1>
          <p className="mt-3 text-sm leading-6 text-[#68766e]">Nhập mã quản trị để cập nhật menu và thông tin quán.</p>
          <Field label="Mã quản trị">
            <Input type="password" value={key} onChange={(event) => setKey(event.target.value)} autoComplete="current-password" required className="h-12 rounded-2xl border-[#d7d1bf] bg-white" />
          </Field>
          {error && <p className="mt-4 rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
          <Button disabled={saving} className="mt-6 h-12 w-full rounded-full bg-[#245943] text-white hover:bg-[#183f30]">
            {saving ? <Loader2 className="animate-spin" /> : <LockKeyhole />} Đăng nhập
          </Button>
        </form>
      </main>
    );
  }

  if (!data) {
    return <main className="grid min-h-screen place-items-center bg-[#f8f2e6] text-red-700">{error || "Không có dữ liệu."}</main>;
  }

  const categories = menuCategories(data);
  const newsCategory = data.categories.find((category) => category.slug === NEWS_CATEGORY_SLUG);
  const newsItems = newsCategory ? data.items.filter((item) => item.category_id === newsCategory.id) : [];
  const menuItems = data.items.filter((item) => item.category_id !== newsCategory?.id);
  const filteredMenuItems = menuItems.filter((item) =>
    `${item.name} ${item.description}`.toLocaleLowerCase("vi").includes(search.trim().toLocaleLowerCase("vi")),
  );
  const categoryById = new Map(categories.map((category) => [category.id, category.name]));

  return (
    <main className="min-h-screen bg-[#f3eee3] text-[#18382c]">
      <header className="sticky top-0 z-30 border-b border-[#d7d1bf] bg-[#fffdf8]/94 backdrop-blur-xl">
        <div className="mx-auto flex min-h-[72px] max-w-[88rem] items-center justify-between gap-4 px-4 sm:px-7">
          <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#245943] text-white"><Leaf size={19} /></span><div><p className="font-display text-xl font-semibold">Sweet Pea</p><p className="text-xs text-[#75837a]">Trang quản trị</p></div></div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" className="rounded-full border-[#d7d1bf]"><Link href="/">Xem website</Link></Button>
            <Button onClick={logout} variant="outline" size="icon" className="rounded-full border-[#d7d1bf]" aria-label="Đăng xuất"><LogOut size={17} /></Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[88rem] px-4 py-7 sm:px-7 sm:py-9">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div><p className="text-sm font-bold uppercase tracking-[0.16em] text-[#78906f]">Tổng quan</p><h1 className="font-display mt-2 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Quản lý tiệm thật nhẹ nhàng.</h1></div>
          <Button onClick={loadData} variant="outline" className="w-fit rounded-full border-[#d7d1bf] bg-white"><RefreshCw size={16} /> Làm mới</Button>
        </div>

        <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Metric icon={<ShoppingBag />} label="Món trong menu" value={String(menuItems.length)} />
          <Metric icon={<Store />} label="Danh mục" value={String(categories.length)} />
          <Metric icon={<Newspaper />} label="Bản tin" value={String(newsItems.length)} />
          <Metric icon={<Gauge />} label="Độ trễ dữ liệu" value={`${data.latencyMs} ms`} />
        </div>

        {(message || error) && (
          <div className={`mt-6 flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold ${error ? "border-red-200 bg-red-50 text-red-700" : "border-[#cad6aa] bg-[#eef3da] text-[#315b47]"}`}>
            {error ? null : <CheckCircle2 size={17} />}{error || message}
          </div>
        )}

        <Tabs defaultValue="items" className="mt-8">
          <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto rounded-2xl border border-[#ddd6c7] bg-[#fffdf8] p-1.5 sm:w-fit">
            <TabsTrigger value="items" className="min-h-10 rounded-xl px-5">Món</TabsTrigger>
            <TabsTrigger value="categories" className="min-h-10 rounded-xl px-5">Danh mục</TabsTrigger>
            <TabsTrigger value="news" className="min-h-10 rounded-xl px-5">Bản tin</TabsTrigger>
            <TabsTrigger value="shop" className="min-h-10 rounded-xl px-5">Thông tin quán</TabsTrigger>
          </TabsList>

          <TabsContent value="items" className="mt-6">
            <div className="grid gap-6 xl:grid-cols-[1fr_25rem]">
              <section className="rounded-[2rem] border border-[#ddd6c7] bg-[#fffdf8] p-4 sm:p-6">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><h2 className="font-display text-2xl font-semibold">Danh sách món</h2><Button onClick={() => setItemDraft(emptyItem(categories[0]?.id || ""))} className="w-fit rounded-full bg-[#245943]"><Plus /> Thêm món</Button></div>
                <label className="relative mt-5 block"><Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#849187]" size={18} /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm nhanh tên món…" className="h-12 rounded-2xl border-[#ddd6c7] bg-[#faf8f1] pl-11" /><span className="sr-only">Tìm món</span></label>
                <div className="mt-5 grid gap-3">
                  {filteredMenuItems.map((item) => (
                    <article key={item.id} className="flex flex-col gap-4 rounded-2xl border border-[#e4ded2] bg-white p-4 sm:flex-row sm:items-center">
                      <div className="h-20 w-full shrink-0 overflow-hidden rounded-xl bg-[#e7edcf] sm:w-24">
                        {item.image_url ? (
                          // Admin thumbnails intentionally preview the exact saved URL.
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.image_url} alt="" loading="lazy" className="h-full w-full object-cover" />
                        ) : <div className="grid h-full place-items-center text-[#719069]"><Leaf /></div>}
                      </div>
                      <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold">{item.name}</h3>{!item.is_available && <span className="rounded-full bg-[#eee8dc] px-2 py-1 text-xs">Tạm ẩn</span>}</div><p className="mt-1 truncate text-sm text-[#718077]">{categoryById.get(item.category_id) || "Chưa phân loại"}</p><p className="mt-2 font-bold text-[#245943]">{money(item.price)}</p></div>
                      <div className="flex gap-2"><Button type="button" variant="outline" size="icon" className="rounded-full border-[#d7d1bf]" onClick={() => setItemDraft(item)} aria-label={`Sửa ${item.name}`}><Pencil size={16} /></Button><DeleteConfirm label={item.name} disabled={saving} onConfirm={() => mutate(`/api/admin/menu?entity=item&id=${encodeURIComponent(item.id)}`, { method: "DELETE" }, "Đã xóa món.")} /></div>
                    </article>
                  ))}
                </div>
              </section>

              <form onSubmit={saveItem} className="h-fit rounded-[2rem] border border-[#ced7b2] bg-[#eef2da] p-5 xl:sticky xl:top-24">
                <h2 className="font-display text-2xl font-semibold">{itemDraft.id ? "Chỉnh sửa món" : "Thêm món mới"}</h2>
                <div className="mt-5 grid gap-4">
                  <Field label="Tên món"><Input value={itemDraft.name} onChange={(e) => setItemDraft({ ...itemDraft, name: e.target.value })} className="h-11 rounded-xl bg-white" required /></Field>
                  <Field label="Danh mục"><select value={itemDraft.category_id} onChange={(e) => setItemDraft({ ...itemDraft, category_id: e.target.value })} className="h-11 rounded-xl border border-input bg-white px-3" required>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></Field>
                  <Field label="Giá (đồng)"><Input type="number" min="0" step="1000" value={itemDraft.price} onChange={(e) => setItemDraft({ ...itemDraft, price: Number(e.target.value) })} className="h-11 rounded-xl bg-white" required /></Field>
                  <Field label="Mô tả"><Textarea value={itemDraft.description} onChange={(e) => setItemDraft({ ...itemDraft, description: e.target.value })} className="min-h-24 rounded-xl bg-white" /></Field>
                  <Field label="Ảnh món">
                    <div className="grid gap-2"><Input value={itemDraft.image_url} onChange={(e) => setItemDraft({ ...itemDraft, image_url: e.target.value })} placeholder="https://..." className="h-11 rounded-xl bg-white" /><label className="flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#bac69d] bg-white text-sm font-semibold text-[#315b47]"><input type="file" accept="image/*" className="sr-only" onChange={(e) => uploadImage(e.target.files?.[0])} disabled={uploading} />{uploading ? <Loader2 className="animate-spin" size={17} /> : <ImageUp size={17} />}{uploading ? "Đang tải…" : "Tải ảnh lên"}</label></div>
                  </Field>
                  <div className="grid grid-cols-2 gap-3"><Toggle label="Đang bán" checked={itemDraft.is_available} onChange={(value) => setItemDraft({ ...itemDraft, is_available: value })} /><Toggle label="Món nổi bật" checked={itemDraft.is_featured} onChange={(value) => setItemDraft({ ...itemDraft, is_featured: value })} /></div>
                </div>
                <div className="mt-6 flex gap-2"><Button disabled={saving || uploading} className="flex-1 rounded-full bg-[#245943]"><Save /> {saving ? "Đang lưu…" : "Lưu món"}</Button>{itemDraft.id && <Button type="button" variant="outline" className="rounded-full bg-white" onClick={() => setItemDraft(emptyItem(categories[0]?.id || ""))}>Hủy</Button>}</div>
              </form>
            </div>
          </TabsContent>

          <TabsContent value="categories" className="mt-6"><CategoriesPanel categories={categories} saving={saving} mutate={mutate} /></TabsContent>
          <TabsContent value="news" className="mt-6"><NewsPanel items={newsItems} saving={saving} mutate={mutate} /></TabsContent>
          <TabsContent value="shop" className="mt-6"><ShopPanel shop={data.shop} saving={saving} mutate={mutate} /></TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="rounded-[1.6rem] border border-[#ddd6c7] bg-[#fffdf8] p-5"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#e5ebca] text-[#245943]">{icon}</span><div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#7a897f]">{label}</p><p className="mt-1 text-2xl font-bold text-[#214e3d]">{value}</p></div></div></div>;
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <label className="flex items-center justify-between gap-2 rounded-xl border border-[#ccd5b2] bg-white p-3 text-sm font-semibold"><span>{label}</span><Switch checked={checked} onCheckedChange={onChange} /></label>;
}

function NewsPanel({ items, saving, mutate }: { items: MenuItem[]; saving: boolean; mutate: (url: string, init: RequestInit, success: string) => Promise<void> }) {
  const [draft, setDraft] = useState<NewsDraft>(() => emptyNews());
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const editing = Boolean(draft.id);
    await mutate(
      "/api/admin/menu",
      {
        method: editing ? "PATCH" : "POST",
        body: JSON.stringify({ entity: "news", id: draft.id, data: draft }),
      },
      editing ? "Đã cập nhật bản tin." : "Đã đăng bản tin mới.",
    );
    setDraft(emptyNews());
  }

  async function upload(file?: File) {
    if (!file) return;
    setUploading(true);
    setUploadError("");
    try {
      const imageUrl = await uploadToCloudinary(file);
      setDraft((current) => ({ ...current, image_url: imageUrl }));
    } catch (requestError) {
      setUploadError(requestError instanceof Error ? requestError.message : "Tải ảnh thất bại.");
    } finally {
      setUploading(false);
    }
  }

  function edit(item: MenuItem) {
    setDraft({
      id: item.id,
      title: item.name,
      content: item.description,
      image_url: item.image_url,
      is_featured: item.is_featured,
      is_published: item.is_available,
      sort_order: item.sort_order,
    });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_27rem]">
      <section className="rounded-[2rem] border border-[#ddd6c7] bg-[#fffdf8] p-4 sm:p-6">
        <div className="flex items-center justify-between gap-3"><div><h2 className="font-display text-2xl font-semibold">Bản tin đã tạo</h2><p className="mt-1 text-sm text-[#738078]">Bài đã bật hiển thị sẽ xuất hiện ở trang Bản tin.</p></div><Button onClick={() => setDraft(emptyNews())} className="shrink-0 rounded-full bg-[#245943]"><Plus /> Viết bài</Button></div>
        <div className="mt-5 grid gap-3">
          {items.length ? items.map((item) => (
            <article key={item.id} className="flex flex-col gap-4 rounded-2xl border border-[#e4ded2] bg-white p-4 sm:flex-row sm:items-center">
              <div className="h-24 w-full shrink-0 overflow-hidden rounded-xl bg-[#e7edcf] sm:w-32">{item.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.image_url} alt="" loading="lazy" className="h-full w-full object-cover" />
              ) : <div className="grid h-full place-items-center text-[#719069]"><Newspaper /></div>}</div>
              <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold">{item.name}</h3><span className={`rounded-full px-2 py-1 text-xs ${item.is_available ? "bg-[#e7edcf] text-[#315b47]" : "bg-[#eee8dc] text-[#746f66]"}`}>{item.is_available ? "Đang hiển thị" : "Bản nháp"}</span></div><p className="mt-2 line-clamp-2 text-sm leading-6 text-[#718077]">{item.description}</p></div>
              <div className="flex gap-2"><Button type="button" variant="outline" size="icon" className="rounded-full border-[#d7d1bf]" onClick={() => edit(item)} aria-label={`Sửa ${item.name}`}><Pencil size={16} /></Button><DeleteConfirm label={item.name} disabled={saving} onConfirm={() => mutate(`/api/admin/menu?entity=news&id=${encodeURIComponent(item.id)}`, { method: "DELETE" }, "Đã xóa bản tin.")} /></div>
            </article>
          )) : <div className="rounded-2xl border border-dashed border-[#ccd4b5] p-10 text-center text-sm text-[#6c7a71]">Chưa có bản tin trong Supabase. Bấm “Viết bài” để tạo bài đầu tiên.</div>}
        </div>
      </section>

      <form onSubmit={submit} className="h-fit rounded-[2rem] border border-[#ced7b2] bg-[#eef2da] p-5 xl:sticky xl:top-24">
        <h2 className="font-display text-2xl font-semibold">{draft.id ? "Chỉnh sửa bản tin" : "Bản tin mới"}</h2>
        <div className="mt-5 grid gap-4">
          <Field label="Tiêu đề"><Input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} className="h-11 rounded-xl bg-white" required /></Field>
          <Field label="Nội dung"><Textarea value={draft.content} onChange={(event) => setDraft({ ...draft, content: event.target.value })} className="min-h-48 rounded-xl bg-white" placeholder="Viết nội dung bài ở đây…" required /></Field>
          <Field label="Ảnh đại diện"><div className="grid gap-2"><Input value={draft.image_url} onChange={(event) => setDraft({ ...draft, image_url: event.target.value })} placeholder="https://..." className="h-11 rounded-xl bg-white" /><label className="flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#bac69d] bg-white text-sm font-semibold text-[#315b47]"><input type="file" accept="image/*" className="sr-only" onChange={(event) => upload(event.target.files?.[0])} disabled={uploading} />{uploading ? <Loader2 className="animate-spin" size={17} /> : <ImageUp size={17} />}{uploading ? "Đang tải…" : "Tải ảnh lên"}</label></div></Field>
          {uploadError && <p className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{uploadError}</p>}
          <div className="grid grid-cols-2 gap-3"><Toggle label="Hiển thị" checked={draft.is_published} onChange={(value) => setDraft({ ...draft, is_published: value })} /><Toggle label="Nổi bật" checked={draft.is_featured} onChange={(value) => setDraft({ ...draft, is_featured: value })} /></div>
        </div>
        <div className="mt-6 flex gap-2"><Button disabled={saving || uploading} className="flex-1 rounded-full bg-[#245943]"><Save /> {saving ? "Đang lưu…" : "Lưu bản tin"}</Button>{draft.id && <Button type="button" variant="outline" className="rounded-full bg-white" onClick={() => setDraft(emptyNews())}>Hủy</Button>}</div>
      </form>
    </div>
  );
}

function CategoriesPanel({ categories, saving, mutate }: { categories: MenuCategory[]; saving: boolean; mutate: (url: string, init: RequestInit, success: string) => Promise<void> }) {
  const [draft, setDraft] = useState({ name: "", description: "", sort_order: categories.length + 1, is_visible: true });

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    await mutate("/api/admin/menu", { method: "POST", body: JSON.stringify({ entity: "category", data: draft }) }, "Đã thêm danh mục.");
    setDraft({ name: "", description: "", sort_order: categories.length + 2, is_visible: true });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_23rem]">
      <section className="rounded-[2rem] border border-[#ddd6c7] bg-[#fffdf8] p-5 sm:p-6"><h2 className="font-display text-2xl font-semibold">Danh mục menu</h2><div className="mt-5 grid gap-3">{categories.map((category) => <article key={category.id} className="flex items-center gap-4 rounded-2xl border border-[#e4ded2] bg-white p-4"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#e5ebca] font-bold text-[#245943]">{category.sort_order}</span><div className="min-w-0 flex-1"><h3 className="font-semibold">{category.name}</h3><p className="mt-1 truncate text-sm text-[#718077]">{category.description || "Chưa có mô tả"}</p></div><Switch checked={category.is_visible !== false} onCheckedChange={(value) => mutate("/api/admin/menu", { method: "PATCH", body: JSON.stringify({ entity: "category", id: category.id, data: { ...category, is_visible: value } }) }, value ? "Đã hiện danh mục." : "Đã ẩn danh mục.")} /></article>)}</div></section>
      <form onSubmit={submit} className="h-fit rounded-[2rem] border border-[#ced7b2] bg-[#eef2da] p-5"><h2 className="font-display text-2xl font-semibold">Danh mục mới</h2><div className="mt-5 grid gap-4"><Field label="Tên danh mục"><Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className="h-11 rounded-xl bg-white" required /></Field><Field label="Mô tả"><Textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} className="rounded-xl bg-white" /></Field></div><Button disabled={saving} className="mt-6 w-full rounded-full bg-[#245943]"><Plus /> Thêm danh mục</Button></form>
    </div>
  );
}

function ShopPanel({ shop, saving, mutate }: { shop: ShopSettings; saving: boolean; mutate: (url: string, init: RequestInit, success: string) => Promise<void> }) {
  const [draft, setDraft] = useState(shop);
  const fields = useMemo(() => [
    ["name", "Tên quán"], ["tagline", "Dòng giới thiệu ngắn"], ["phone", "Số điện thoại"], ["email", "Email"], ["address", "Địa chỉ"], ["map_url", "Liên kết Google Maps"], ["zalo_url", "Liên kết Zalo"], ["opening_text", "Giờ/ghi chú mở cửa"],
  ] as const, []);

  return (
    <form onSubmit={(event) => { event.preventDefault(); mutate("/api/admin/menu", { method: "PATCH", body: JSON.stringify({ entity: "shop", id: "1", data: draft }) }, "Đã cập nhật thông tin quán."); }} className="max-w-4xl rounded-[2rem] border border-[#ddd6c7] bg-[#fffdf8] p-5 sm:p-7">
      <h2 className="font-display text-2xl font-semibold">Thông tin hiển thị trên website</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">{fields.map(([name, label]) => <Field key={name} label={label}><Input value={String(draft[name])} onChange={(e) => setDraft({ ...draft, [name]: e.target.value })} className="h-11 rounded-xl bg-white" required /></Field>)}</div>
      <div className="mt-4"><Field label="Mô tả quán"><Textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} className="min-h-28 rounded-xl bg-white" required /></Field></div>
      <Button disabled={saving} className="mt-6 rounded-full bg-[#245943]"><Save /> Lưu thông tin quán</Button>
    </form>
  );
}
