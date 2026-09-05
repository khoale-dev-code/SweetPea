"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  ImageUp,
  Leaf,
  ListFilter,
  Loader2,
  LockKeyhole,
  LogOut,
  Newspaper,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Search,
  Settings,
  ShoppingBag,
  Sparkles,
  Store,
  Tags,
  Trash2,
  X,
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
import { Textarea } from "@/components/ui/textarea";
import type { MenuCategory, MenuItem, ShopSettings, StoreData } from "@/lib/types";

const NEWS_CATEGORY_SLUG = "ban-tin";
const PAGE_SIZE = 12;

type AdminData = StoreData & { latencyMs: number };
type AdminSection = "items" | "categories" | "news" | "shop";
type ItemFilter = "all" | "available" | "hidden" | "featured";
type NewsFilter = "all" | "published" | "draft" | "featured";
type ItemDraft = Omit<MenuItem, "id"> & { id?: string };
type MutateFn = (url: string, init: RequestInit, success: string) => Promise<boolean>;
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
  return new Intl.NumberFormat("vi-VN").format(Number(value || 0)) + "đ";
}

function itemPayload(item: ItemDraft | MenuItem) {
  return {
    name: item.name,
    category_id: item.category_id,
    description: item.description || "",
    price: Number(item.price || 0),
    image_url: item.image_url || "",
    is_featured: Boolean(item.is_featured),
    is_available: Boolean(item.is_available),
    sort_order: Number(item.sort_order || 0),
  };
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
  const response = await fetch(`https://api.cloudinary.com/v1_1/${signed.cloudName}/image/upload`, {
    method: "POST",
    body: form,
  });
  const result = (await response.json()) as { secure_url?: string; error?: { message?: string } };
  if (!response.ok || !result.secure_url) throw new Error(result.error?.message || "Tải ảnh thất bại.");
  return result.secure_url;
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-[#385044]">
      <span className="flex items-center justify-between gap-3">
        <span>{label}</span>
        {hint ? <span className="text-[11px] font-medium text-[#8a958e]">{hint}</span> : null}
      </span>
      {children}
    </label>
  );
}

function DeleteConfirm({
  label,
  onConfirm,
  disabled,
  compact = false,
}: {
  label: string;
  onConfirm: () => void;
  disabled?: boolean;
  compact?: boolean;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={disabled}
          className={`${compact ? "h-9 w-9" : "h-10 w-10"} rounded-xl border-[#ead7d1] bg-white text-[#a64538] shadow-none hover:border-[#dca99e] hover:bg-[#fff5f2] hover:text-[#8f3025]`}
        >
          <Trash2 size={15} />
          <span className="sr-only">Xóa {label}</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="border-[#ddd5c5] bg-[#fffced]">
        <AlertDialogHeader>
          <AlertDialogTitle>Xóa {label}?</AlertDialogTitle>
          <AlertDialogDescription>
            Dữ liệu sẽ bị xóa khỏi menu ngay lập tức. Thao tác này không thể hoàn tác trong Admin.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Giữ lại</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-[#a63f32] text-white hover:bg-[#8f3025]">
            Xóa
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function AdminConsole() {
  const [status, setStatus] = useState<"checking" | "login" | "ready">("checking");
  const [key, setKey] = useState("");
  const [data, setData] = useState<AdminData | null>(null);
  const [section, setSection] = useState<AdminSection>("items");
  const [itemDraft, setItemDraft] = useState<ItemDraft>(() => emptyItem());
  const [itemEditorOpen, setItemEditorOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [itemFilter, setItemFilter] = useState<ItemFilter>("all");
  const [menuPage, setMenuPage] = useState(1);
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

  useEffect(() => {
    setMenuPage(1);
  }, [search, categoryFilter, itemFilter]);

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

  async function mutate(url: string, init: RequestInit, success: string): Promise<boolean> {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await api(url, init);
      await loadData();
      setMessage(success);
      return true;
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Không thể lưu dữ liệu.");
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function saveItem(event: React.FormEvent) {
    event.preventDefault();
    const editing = Boolean(itemDraft.id);
    const saved = await mutate(
      "/api/admin/menu",
      {
        method: editing ? "PATCH" : "POST",
        body: JSON.stringify({ entity: "item", id: itemDraft.id, data: itemPayload(itemDraft) }),
      },
      editing ? "Đã cập nhật món." : "Đã thêm món mới.",
    );
    if (saved) {
      setItemDraft(emptyItem(data ? menuCategories(data)[0]?.id || "" : ""));
      setItemEditorOpen(false);
    }
  }

  async function quickUpdateItem(item: MenuItem, patch: Partial<ItemDraft>, success: string) {
    await mutate(
      "/api/admin/menu",
      {
        method: "PATCH",
        body: JSON.stringify({ entity: "item", id: item.id, data: itemPayload({ ...item, ...patch }) }),
      },
      success,
    );
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

  function openCreateItem(categoryId?: string) {
    setItemDraft(emptyItem(categoryId || (data ? menuCategories(data)[0]?.id || "" : "")));
    setItemEditorOpen(true);
  }

  function openEditItem(item: MenuItem) {
    setItemDraft({ ...item });
    setItemEditorOpen(true);
  }

  if (status === "checking") {
    return (
      <main className="grid min-h-screen place-items-center bg-[#fffced]">
        <div className="text-center text-[#184d39]">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-[#d7ddc1] bg-white shadow-[0_14px_40px_rgba(32,70,51,0.08)]">
            <Loader2 className="animate-spin" size={25} />
          </span>
          <p className="mt-4 text-sm font-semibold">Đang mở trang quản trị…</p>
        </div>
      </main>
    );
  }

  if (status === "login") {
    return (
      <main className="paper-texture grid min-h-screen place-items-center px-4 py-10">
        <form
          onSubmit={login}
          className="leaf-shadow w-full max-w-[28rem] overflow-hidden rounded-[2.2rem] border border-[#d8d1c1] bg-[#fffced]"
        >
          <div className="border-b border-[#ebe4d6] bg-[#f5f0df] px-6 py-5 sm:px-8">
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-[#607166] hover:text-[#184d39]">
              <ArrowLeft size={17} /> Về website
            </Link>
          </div>
          <div className="p-6 sm:p-8">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#184d39] text-white shadow-[0_12px_30px_rgba(36,89,67,0.2)]">
              <Leaf size={24} />
            </span>
            <p className="mt-7 text-xs font-extrabold uppercase tracking-[0.18em] text-[#7d9274]">Sweet Pea Workspace</p>
            <h1 className="font-display mt-2 text-4xl font-semibold leading-none text-[#184d39]">Đăng nhập Admin</h1>
            <p className="mt-4 text-sm leading-6 text-[#68766e]">Quản lý thực đơn, bản tin và thông tin quán trong một nơi.</p>
            <div className="mt-7">
              <Field label="Mã quản trị">
                <Input
                  type="password"
                  value={key}
                  onChange={(event) => setKey(event.target.value)}
                  autoComplete="current-password"
                  required
                  placeholder="Nhập mã quản trị"
                  className="h-12 rounded-xl border-[#d7d1bf] bg-white px-4"
                />
              </Field>
            </div>
            {error ? <p className="mt-4 rounded-xl border border-red-100 bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p> : null}
            <Button disabled={saving} className="mt-6 h-12 w-full rounded-xl bg-[#184d39] text-white hover:bg-[#184d39]">
              {saving ? <Loader2 className="animate-spin" /> : <LockKeyhole />} Đăng nhập
            </Button>
          </div>
        </form>
      </main>
    );
  }

  if (!data) {
    return <main className="grid min-h-screen place-items-center bg-[#fffced] text-red-700">{error || "Không có dữ liệu."}</main>;
  }

  const categories = menuCategories(data);
  const newsCategory = data.categories.find((category) => category.slug === NEWS_CATEGORY_SLUG);
  const newsItems = newsCategory ? data.items.filter((item) => item.category_id === newsCategory.id) : [];
  const menuItems = data.items.filter((item) => item.category_id !== newsCategory?.id);
  const categoryById = new Map(categories.map((category) => [category.id, category.name]));
  const categoryCount = new Map<string, number>();
  menuItems.forEach((item) => categoryCount.set(item.category_id, (categoryCount.get(item.category_id) || 0) + 1));

  const normalizedSearch = search.trim().toLocaleLowerCase("vi");
  const filteredMenuItems = menuItems
    .filter((item) => {
      if (normalizedSearch && !`${item.name} ${item.description}`.toLocaleLowerCase("vi").includes(normalizedSearch)) return false;
      if (categoryFilter !== "all" && item.category_id !== categoryFilter) return false;
      if (itemFilter === "available" && !item.is_available) return false;
      if (itemFilter === "hidden" && item.is_available) return false;
      if (itemFilter === "featured" && !item.is_featured) return false;
      return true;
    })
    .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0));

  const totalPages = Math.max(1, Math.ceil(filteredMenuItems.length / PAGE_SIZE));
  const safePage = Math.min(menuPage, totalPages);
  const visibleMenuItems = filteredMenuItems.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const availableCount = menuItems.filter((item) => item.is_available).length;
  const featuredCount = menuItems.filter((item) => item.is_featured).length;
  const newsPublishedCount = newsItems.filter((item) => item.is_available).length;
  const newsFeaturedCount = newsItems.filter((item) => item.is_available && item.is_featured).length;
  const newsDraftCount = newsItems.filter((item) => !item.is_available).length;

  const navItems: Array<{ id: AdminSection; label: string; note: string; icon: React.ReactNode; count?: number }> = [
    { id: "items", label: "Thực đơn", note: "Món & giá bán", icon: <ShoppingBag size={18} />, count: menuItems.length },
    { id: "categories", label: "Danh mục", note: "Nhóm món", icon: <Tags size={18} />, count: categories.length },
    { id: "news", label: "Bản tin", note: "Bài viết", icon: <Newspaper size={18} />, count: newsItems.length },
    { id: "shop", label: "Thông tin quán", note: "Liên hệ & bản đồ", icon: <Settings size={18} /> },
  ];

  const sectionTitle = navItems.find((item) => item.id === section)?.label || "Admin";

  return (
    <main className="min-h-screen bg-[#fffced] text-[#184d39]">
      <div className="lg:grid lg:min-h-screen lg:grid-cols-[15.5rem_minmax(0,1fr)]">
        <aside className="hidden border-r border-[#ddd7c9] bg-[#184d39] text-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col">
          <div className="border-b border-white/10 px-5 py-6">
            <Link href="/" className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#c7db95] text-[#184d39]">
                <Leaf size={20} />
              </span>
              <span>
                <strong className="font-display block text-xl font-semibold leading-none">Sweet Pea</strong>
                <small className="mt-1 block text-[10px] font-bold uppercase tracking-[0.16em] text-white/50">Admin workspace</small>
              </span>
            </Link>
          </div>

          <nav className="flex-1 px-3 py-5" aria-label="Quản trị Sweet Pea">
            <p className="px-3 text-[10px] font-extrabold uppercase tracking-[0.18em] text-white/35">Quản lý</p>
            <div className="mt-3 grid gap-1.5">
              {navItems.map((item) => {
                const active = section === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSection(item.id)}
                    className={`group flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${
                      active ? "bg-[#c7db95] text-[#184d39]" : "text-white/72 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${active ? "bg-white text-[#184d39]" : "bg-white/10"}`}>
                      {item.icon}
                    </span>
                    <span className="min-w-0 flex-1">
                      <strong className="block truncate text-sm font-bold">{item.label}</strong>
                      <small className={`mt-0.5 block truncate text-[11px] ${active ? "text-[#6f8176]" : "text-white/38"}`}>{item.note}</small>
                    </span>
                    {item.count !== undefined ? (
                      <span className={`rounded-full px-2 py-1 text-[10px] font-extrabold ${active ? "bg-[#c7db95] text-[#184d39]" : "bg-white/10 text-white/60"}`}>
                        {item.count}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </nav>

          <div className="border-t border-white/10 p-3">
            <Link href="/" className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-white/70 transition hover:bg-white/10 hover:text-white">
              <Eye size={17} /> Xem website
            </Link>
            <button type="button" onClick={logout} className="mt-1 flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-semibold text-white/70 transition hover:bg-white/10 hover:text-white">
              <LogOut size={17} /> Đăng xuất
            </button>
          </div>
        </aside>

        <div className="min-w-0">
          <header className="sticky top-0 z-30 border-b border-[#ddd7c9] bg-[#fffced]/94 backdrop-blur-xl">
            <div className="flex min-h-[68px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#184d39] text-white lg:hidden"><Leaf size={18} /></span>
                <div className="min-w-0">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#819078]">Sweet Pea Admin</p>
                  <h1 className="truncate text-lg font-bold text-[#184d39]">{sectionTitle}</h1>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={loadData} variant="outline" size="icon" className="h-10 w-10 rounded-xl border-[#d7d1bf] bg-white" aria-label="Làm mới dữ liệu">
                  <RefreshCw size={16} className={saving ? "animate-spin" : ""} />
                </Button>
                <Button asChild variant="outline" className="hidden h-10 rounded-xl border-[#d7d1bf] bg-white sm:inline-flex lg:hidden">
                  <Link href="/"><Eye size={16} /> Website</Link>
                </Button>
                <Button onClick={logout} variant="outline" size="icon" className="h-10 w-10 rounded-xl border-[#d7d1bf] bg-white lg:hidden" aria-label="Đăng xuất">
                  <LogOut size={16} />
                </Button>
              </div>
            </div>
            <div className="admin-scrollbar flex gap-1.5 overflow-x-auto border-t border-[#eee8dc] px-4 py-2 lg:hidden">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSection(item.id)}
                  className={`flex min-h-10 shrink-0 items-center gap-2 rounded-xl px-3 text-xs font-bold transition ${
                    section === item.id ? "bg-[#184d39] text-white" : "bg-[#fffced] text-[#5b6c62]"
                  }`}
                >
                  {item.icon}{item.label}{item.count !== undefined ? <span className="opacity-60">{item.count}</span> : null}
                </button>
              ))}
            </div>
          </header>

          <div className="mx-auto w-full max-w-[96rem] px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-8">
            <section className="overflow-hidden rounded-[1.8rem] border border-[#ddd7c9] bg-[#fffced] shadow-[0_16px_50px_rgba(39,65,51,0.045)]">
              <div className="grid gap-5 px-5 py-5 sm:px-6 lg:grid-cols-[1fr_auto] lg:items-end lg:px-7">
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.17em] text-[#829478]">{section === "news" ? "Trung tâm nội dung" : "Tổng quan hôm nay"}</p>
                  <h2 className="font-display mt-1 text-3xl font-semibold leading-tight text-[#184d39] sm:text-4xl">{section === "news" ? "Bản tin gọn, lên bài nhanh." : "Menu gọn, thao tác nhanh."}</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-[#718077]">{section === "news" ? "Thêm, sửa, ẩn/hiện hoặc đưa bài lên Nổi bật ngay tại danh sách. Bài nổi bật sẽ tự xuất hiện trên trang chủ sau khi lưu." : "Dữ liệu được lấy trực tiếp từ Supabase. Các thay đổi sẽ cập nhật lên website sau khi lưu."}</p>
                </div>
                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#c7db95] bg-[#c7db95] px-3 py-2 text-xs font-bold text-[#52705d]">
                  <span className="h-2 w-2 rounded-full bg-[#5b936c]" /> Supabase · {data.latencyMs} ms
                </div>
              </div>
              <div className="grid border-t border-[#eee8dc] sm:grid-cols-2 xl:grid-cols-4">
                {section === "news" ? (
                  <>
                    <Metric icon={<Newspaper size={18} />} label="Tổng bài" value={String(newsItems.length)} note="Trong hệ thống" />
                    <Metric icon={<Eye size={18} />} label="Đang hiển thị" value={String(newsPublishedCount)} note="Khách đang xem được" />
                    <Metric icon={<Sparkles size={18} />} label="Nổi bật" value={String(newsFeaturedCount)} note="Tự hiện ở trang chủ" />
                    <Metric icon={<Pencil size={18} />} label="Bản nháp" value={String(newsDraftCount)} note="Chưa công khai" />
                  </>
                ) : (
                  <>
                    <Metric icon={<ShoppingBag size={18} />} label="Tổng món" value={String(menuItems.length)} note={`${availableCount} đang bán`} />
                    <Metric icon={<Store size={18} />} label="Danh mục" value={String(categories.length)} note="Theo menu thực tế" />
                    <Metric icon={<Sparkles size={18} />} label="Nổi bật" value={String(featuredCount)} note="Món được gợi ý" />
                    <Metric icon={<Newspaper size={18} />} label="Bản tin" value={String(newsItems.length)} note="Bài viết trên web" />
                  </>
                )}
              </div>
            </section>

            {(message || error) ? (
              <div className={`mt-4 flex items-start gap-2 rounded-xl border px-4 py-3 text-sm font-semibold ${error ? "border-red-200 bg-red-50 text-red-700" : "border-[#cbd7ae] bg-[#c7db95] text-[#184d39]"}`}>
                {error ? null : <CheckCircle2 className="mt-0.5 shrink-0" size={16} />}{error || message}
              </div>
            ) : null}

            {section === "items" ? (
              <section className="mt-5 overflow-hidden rounded-[1.8rem] border border-[#ddd7c9] bg-[#fffced] shadow-[0_16px_50px_rgba(39,65,51,0.045)]">
                <div className="flex flex-col gap-4 border-b border-[#eee8dc] p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between lg:p-6">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-[#184d39]">Danh sách món</h2>
                      <span className="rounded-full bg-[#c7db95] px-2.5 py-1 text-xs font-extrabold text-[#55705f]">{filteredMenuItems.length}</span>
                    </div>
                    <p className="mt-1 text-sm text-[#77857d]">Chỉ hiển thị tối đa {PAGE_SIZE} món mỗi trang để dễ quản lý.</p>
                  </div>
                  <Button onClick={() => openCreateItem()} className="h-11 w-full rounded-xl bg-[#184d39] px-5 text-white hover:bg-[#193f30] sm:w-fit">
                    <Plus size={17} /> Thêm món
                  </Button>
                </div>

                <div className="grid gap-3 border-b border-[#eee8dc] bg-[#fffced] p-4 sm:grid-cols-2 lg:grid-cols-[minmax(16rem,1fr)_13rem_minmax(20rem,auto)] lg:p-5">
                  <label className="relative block">
                    <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#89958e]" size={17} />
                    <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm tên món…" className="h-11 rounded-xl border-[#ddd6c7] bg-white pl-10" />
                    <span className="sr-only">Tìm món</span>
                  </label>
                  <label>
                    <span className="sr-only">Lọc danh mục</span>
                    <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="h-11 w-full rounded-xl border border-[#ddd6c7] bg-white px-3 text-sm font-semibold text-[#4e6257] outline-none focus:border-[#8aa07e]">
                      <option value="all">Tất cả danh mục</option>
                      {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                    </select>
                  </label>
                  <div className="admin-scrollbar flex gap-1.5 overflow-x-auto sm:col-span-2 lg:col-span-1">
                    {([
                      ["all", "Tất cả"],
                      ["available", "Đang bán"],
                      ["hidden", "Tạm ẩn"],
                      ["featured", "Nổi bật"],
                    ] as Array<[ItemFilter, string]>).map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setItemFilter(value)}
                        className={`min-h-11 shrink-0 rounded-xl border px-3.5 text-xs font-extrabold transition ${
                          itemFilter === value ? "border-[#184d39] bg-[#184d39] text-white" : "border-[#ddd6c7] bg-white text-[#617169] hover:border-[#aebba6]"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {visibleMenuItems.length ? (
                  <>
                    <div className="hidden overflow-x-auto md:block">
                      <table className="w-full min-w-[860px] border-collapse text-left">
                        <thead>
                          <tr className="border-b border-[#eee8dc] bg-[#fffced] text-[10px] font-extrabold uppercase tracking-[0.13em] text-[#849087]">
                            <th className="px-5 py-3.5">Món</th>
                            <th className="px-4 py-3.5">Danh mục</th>
                            <th className="px-4 py-3.5">Giá</th>
                            <th className="px-4 py-3.5">Đang bán</th>
                            <th className="px-4 py-3.5">Nổi bật</th>
                            <th className="px-5 py-3.5 text-right">Thao tác</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#fffced]">
                          {visibleMenuItems.map((item) => (
                            <tr key={item.id} className="group transition hover:bg-[#fffced]">
                              <td className="px-5 py-3">
                                <div className="flex min-w-0 items-center gap-3">
                                  <ItemThumb item={item} />
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                      <strong className="block max-w-[18rem] truncate text-sm text-[#184d39]">{item.name}</strong>
                                      {!item.is_available ? <span className="rounded-full bg-[#fffced] px-2 py-0.5 text-[9px] font-extrabold uppercase text-[#81786c]">Ẩn</span> : null}
                                    </div>
                                    <p className="mt-1 max-w-[22rem] truncate text-xs text-[#8a958e]">{item.description || "Không có mô tả"}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3"><span className="inline-flex rounded-lg bg-[#c7db95] px-2.5 py-1.5 text-xs font-bold text-[#5d735f]">{categoryById.get(item.category_id) || "Chưa phân loại"}</span></td>
                              <td className="px-4 py-3 text-sm font-extrabold tabular-nums text-[#184d39]">{money(item.price)}</td>
                              <td className="px-4 py-3">
                                <Switch
                                  checked={item.is_available}
                                  disabled={saving}
                                  onCheckedChange={(value) => quickUpdateItem(item, { is_available: value }, value ? "Đã bật bán món." : "Đã tạm ẩn món.")}
                                  aria-label={`${item.is_available ? "Ẩn" : "Hiện"} ${item.name}`}
                                />
                              </td>
                              <td className="px-4 py-3">
                                <button
                                  type="button"
                                  disabled={saving}
                                  onClick={() => quickUpdateItem(item, { is_featured: !item.is_featured }, item.is_featured ? "Đã bỏ món nổi bật." : "Đã đánh dấu món nổi bật.")}
                                  className={`grid h-9 w-9 place-items-center rounded-xl border transition ${item.is_featured ? "border-[#d6c389] bg-[#fff8dc] text-[#9a741f]" : "border-[#e1ddd4] bg-white text-[#a3aaa5] hover:text-[#75906e]"}`}
                                  aria-label={`${item.is_featured ? "Bỏ nổi bật" : "Đánh dấu nổi bật"} ${item.name}`}
                                >
                                  <Sparkles size={15} />
                                </button>
                              </td>
                              <td className="px-5 py-3">
                                <div className="flex justify-end gap-2">
                                  <Button type="button" variant="outline" size="icon" className="h-9 w-9 rounded-xl border-[#d7d1bf] bg-white" onClick={() => openEditItem(item)} aria-label={`Sửa ${item.name}`}><Pencil size={15} /></Button>
                                  <DeleteConfirm compact label={item.name} disabled={saving} onConfirm={() => mutate(`/api/admin/menu?entity=item&id=${encodeURIComponent(item.id)}`, { method: "DELETE" }, "Đã xóa món.")} />
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="grid gap-2.5 p-3 md:hidden">
                      {visibleMenuItems.map((item) => (
                        <article key={item.id} className="rounded-2xl border border-[#e5dfd3] bg-white p-3.5">
                          <div className="flex gap-3">
                            <ItemThumb item={item} mobile />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0"><h3 className="truncate text-sm font-bold">{item.name}</h3><p className="mt-1 truncate text-xs text-[#7d8a82]">{categoryById.get(item.category_id) || "Chưa phân loại"}</p></div>
                                <strong className="shrink-0 text-sm text-[#184d39]">{money(item.price)}</strong>
                              </div>
                              <div className="mt-3 flex items-center justify-between gap-2 border-t border-[#fffced] pt-3">
                                <div className="flex items-center gap-3 text-[11px] font-bold text-[#68776e]">
                                  <label className="flex items-center gap-1.5"><Switch checked={item.is_available} disabled={saving} onCheckedChange={(value) => quickUpdateItem(item, { is_available: value }, value ? "Đã bật bán món." : "Đã tạm ẩn món.")} /><span>{item.is_available ? "Đang bán" : "Tạm ẩn"}</span></label>
                                </div>
                                <div className="flex gap-2"><Button type="button" variant="outline" size="icon" className="h-9 w-9 rounded-xl border-[#d7d1bf]" onClick={() => openEditItem(item)}><Pencil size={15} /></Button><DeleteConfirm compact label={item.name} disabled={saving} onConfirm={() => mutate(`/api/admin/menu?entity=item&id=${encodeURIComponent(item.id)}`, { method: "DELETE" }, "Đã xóa món.")} /></div>
                              </div>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="grid min-h-64 place-items-center p-8 text-center">
                    <div><span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#c7db95] text-[#66805e]"><ListFilter size={20} /></span><h3 className="mt-4 font-bold">Không tìm thấy món phù hợp</h3><p className="mt-1 text-sm text-[#7e8a83]">Thử đổi từ khóa hoặc bộ lọc.</p></div>
                  </div>
                )}

                <div className="flex flex-col gap-3 border-t border-[#eee8dc] bg-[#fffced] px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                  <p className="text-xs font-semibold text-[#7b8981]">
                    Hiển thị {filteredMenuItems.length ? (safePage - 1) * PAGE_SIZE + 1 : 0}–{Math.min(safePage * PAGE_SIZE, filteredMenuItems.length)} / {filteredMenuItems.length} món
                  </p>
                  <div className="flex items-center gap-2">
                    <Button type="button" variant="outline" size="icon" className="h-9 w-9 rounded-xl border-[#d7d1bf] bg-white" disabled={safePage <= 1} onClick={() => setMenuPage((page) => Math.max(1, page - 1))}><ChevronLeft size={16} /></Button>
                    <span className="min-w-20 text-center text-xs font-extrabold text-[#52665a]">Trang {safePage}/{totalPages}</span>
                    <Button type="button" variant="outline" size="icon" className="h-9 w-9 rounded-xl border-[#d7d1bf] bg-white" disabled={safePage >= totalPages} onClick={() => setMenuPage((page) => Math.min(totalPages, page + 1))}><ChevronRight size={16} /></Button>
                  </div>
                </div>
              </section>
            ) : null}

            {section === "categories" ? <CategoriesPanel categories={categories} itemCounts={categoryCount} saving={saving} mutate={mutate} /> : null}
            {section === "news" ? <NewsPanel items={newsItems} saving={saving} mutate={mutate} /> : null}
            {section === "shop" ? <ShopPanel shop={data.shop} saving={saving} mutate={mutate} /> : null}
          </div>
        </div>
      </div>

      {itemEditorOpen ? (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={itemDraft.id ? "Chỉnh sửa món" : "Thêm món mới"}>
          <button type="button" aria-label="Đóng form" className="absolute inset-0 bg-[#184d39]/45 backdrop-blur-[2px]" onClick={() => setItemEditorOpen(false)} />
          <div className="absolute inset-y-0 right-0 flex w-full max-w-[36rem] flex-col bg-[#fffced] shadow-[-24px_0_70px_rgba(20,48,36,0.18)]">
            <div className="flex items-center justify-between gap-3 border-b border-[#e9e3d8] px-5 py-4 sm:px-6">
              <div><p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#839478]">Thực đơn</p><h2 className="mt-1 text-xl font-bold">{itemDraft.id ? "Chỉnh sửa món" : "Thêm món mới"}</h2></div>
              <Button type="button" variant="outline" size="icon" onClick={() => setItemEditorOpen(false)} className="h-10 w-10 rounded-xl border-[#d7d1bf] bg-white"><X size={17} /></Button>
            </div>
            <form onSubmit={saveItem} className="flex min-h-0 flex-1 flex-col">
              <div className="admin-scrollbar flex-1 overflow-y-auto px-5 py-5 sm:px-6">
                <div className="overflow-hidden rounded-2xl border border-[#e1dbcf] bg-[#c7db95]">
                  <div className="aspect-[16/7]">
                    {itemDraft.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={itemDraft.image_url} alt="Xem trước ảnh món" className="h-full w-full object-cover" />
                    ) : (
                      <div className="grid h-full place-items-center text-[#76906d]"><div className="text-center"><ImageUp className="mx-auto" size={25} /><p className="mt-2 text-xs font-bold">Chưa có ảnh món</p></div></div>
                    )}
                  </div>
                </div>

                <div className="mt-5 grid gap-4">
                  <Field label="Tên món"><Input value={itemDraft.name} onChange={(event) => setItemDraft({ ...itemDraft, name: event.target.value })} className="h-11 rounded-xl border-[#d7d1bf] bg-white" required /></Field>
                  <Field label="Danh mục"><select value={itemDraft.category_id} onChange={(event) => setItemDraft({ ...itemDraft, category_id: event.target.value })} className="h-11 rounded-xl border border-[#d7d1bf] bg-white px-3 text-sm outline-none focus:border-[#8aa07e]" required>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></Field>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Giá bán" hint="VNĐ"><Input type="number" min="0" step="1000" value={itemDraft.price} onChange={(event) => setItemDraft({ ...itemDraft, price: Number(event.target.value) })} className="h-11 rounded-xl border-[#d7d1bf] bg-white" required /></Field>
                    <Field label="Thứ tự"><Input type="number" min="0" max="9999" value={itemDraft.sort_order} onChange={(event) => setItemDraft({ ...itemDraft, sort_order: Number(event.target.value) })} className="h-11 rounded-xl border-[#d7d1bf] bg-white" /></Field>
                  </div>
                  <Field label="Mô tả" hint="Không bắt buộc"><Textarea value={itemDraft.description} onChange={(event) => setItemDraft({ ...itemDraft, description: event.target.value })} className="min-h-24 rounded-xl border-[#d7d1bf] bg-white" placeholder="Ví dụ: best seller, sữa yến mạch…" /></Field>
                  <Field label="Ảnh món" hint="Tối đa 8MB">
                    <div className="grid gap-2">
                      <Input value={itemDraft.image_url} onChange={(event) => setItemDraft({ ...itemDraft, image_url: event.target.value })} placeholder="https://..." className="h-11 rounded-xl border-[#d7d1bf] bg-white" />
                      <label className="flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-[#aebe9f] bg-[#f5f7ea] text-sm font-bold text-[#42644f] transition hover:bg-[#c7db95]">
                        <input type="file" accept="image/*" className="sr-only" onChange={(event) => uploadImage(event.target.files?.[0])} disabled={uploading} />
                        {uploading ? <Loader2 className="animate-spin" size={17} /> : <ImageUp size={17} />}{uploading ? "Đang tải ảnh…" : "Chọn ảnh từ máy"}
                      </label>
                    </div>
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Toggle label="Đang bán" checked={itemDraft.is_available} onChange={(value) => setItemDraft({ ...itemDraft, is_available: value })} />
                    <Toggle label="Nổi bật" checked={itemDraft.is_featured} onChange={(value) => setItemDraft({ ...itemDraft, is_featured: value })} />
                  </div>
                </div>
              </div>
              <div className="flex gap-2 border-t border-[#e9e3d8] bg-[#fffced] px-5 py-4 sm:px-6">
                <Button type="button" variant="outline" className="h-11 rounded-xl border-[#d7d1bf] bg-white px-5" onClick={() => setItemEditorOpen(false)}>Hủy</Button>
                <Button disabled={saving || uploading} className="h-11 flex-1 rounded-xl bg-[#184d39] text-white hover:bg-[#193f30]"><Save size={17} /> {saving ? "Đang lưu…" : itemDraft.id ? "Lưu thay đổi" : "Thêm món"}</Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </main>
  );
}

function ItemThumb({ item, mobile = false }: { item: MenuItem; mobile?: boolean }) {
  return (
    <div className={`${mobile ? "h-16 w-16" : "h-11 w-11"} shrink-0 overflow-hidden rounded-xl border border-[#e4dfd4] bg-[#c7db95]`}>
      {item.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.image_url} alt="" loading="lazy" className="h-full w-full object-cover" />
      ) : (
        <div className="grid h-full place-items-center text-[#78906f]"><Leaf size={mobile ? 18 : 15} /></div>
      )}
    </div>
  );
}

function Metric({ icon, label, value, note }: { icon: React.ReactNode; label: string; value: string; note: string }) {
  return (
    <div className="border-b border-[#eee8dc] px-5 py-4 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0 lg:px-6">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#c7db95] text-[#55745d]">{icon}</span>
        <div><p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#88948d]">{label}</p><div className="mt-0.5 flex items-baseline gap-2"><strong className="text-xl text-[#184d39]">{value}</strong><span className="text-[11px] font-semibold text-[#8c978f]">{note}</span></div></div>
      </div>
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <label className="flex min-h-12 items-center justify-between gap-2 rounded-xl border border-[#c7db95] bg-[#f5f7ea] px-3 text-sm font-semibold text-[#4b6255]"><span>{label}</span><Switch checked={checked} onCheckedChange={onChange} /></label>;
}

function CategoriesPanel({
  categories,
  itemCounts,
  saving,
  mutate,
}: {
  categories: MenuCategory[];
  itemCounts: Map<string, number>;
  saving: boolean;
  mutate: MutateFn;
}) {
  const [draft, setDraft] = useState({ name: "", description: "", sort_order: categories.length + 1, is_visible: true });

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const saved = await mutate("/api/admin/menu", { method: "POST", body: JSON.stringify({ entity: "category", data: draft }) }, "Đã thêm danh mục.");
    if (saved) setDraft({ name: "", description: "", sort_order: categories.length + 2, is_visible: true });
  }

  return (
    <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <section className="overflow-hidden rounded-[1.8rem] border border-[#ddd7c9] bg-[#fffced] shadow-[0_16px_50px_rgba(39,65,51,0.045)]">
        <div className="border-b border-[#eee8dc] px-5 py-5 sm:px-6"><h2 className="text-xl font-bold">Danh mục menu</h2><p className="mt-1 text-sm text-[#77857d]">Sắp xếp các nhóm món đúng theo menu tại quán.</p></div>
        <div className="divide-y divide-[#f0ebe2]">
          {categories.map((category) => (
            <article key={category.id} className="flex items-center gap-3 px-4 py-3.5 transition hover:bg-[#fffced] sm:px-6">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#c7db95] text-sm font-extrabold text-[#54705c]">{category.sort_order}</span>
              <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="text-sm font-bold">{category.name}</h3><span className="rounded-full bg-[#f1eee6] px-2 py-0.5 text-[10px] font-extrabold text-[#807970]">{itemCounts.get(category.id) || 0} món</span></div><p className="mt-1 truncate text-xs text-[#849087]">{category.description || "Chưa có mô tả"}</p></div>
              <div className="flex items-center gap-2"><span className="hidden text-xs font-semibold text-[#78857d] sm:block">{category.is_visible !== false ? "Đang hiện" : "Đang ẩn"}</span><Switch checked={category.is_visible !== false} disabled={saving} onCheckedChange={(value) => mutate("/api/admin/menu", { method: "PATCH", body: JSON.stringify({ entity: "category", id: category.id, data: { name: category.name, description: category.description || "", sort_order: category.sort_order, is_visible: value } }) }, value ? "Đã hiện danh mục." : "Đã ẩn danh mục.")} /></div>
            </article>
          ))}
        </div>
      </section>

      <form onSubmit={submit} className="h-fit rounded-[1.8rem] border border-[#c7db95] bg-[#c7db95] p-5 shadow-[0_16px_50px_rgba(39,65,51,0.04)] xl:sticky xl:top-24">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-[#55725c]"><Plus size={18} /></span>
        <h2 className="mt-4 text-lg font-bold">Thêm danh mục</h2>
        <p className="mt-1 text-sm leading-6 text-[#718077]">Chỉ nên thêm khi menu thực tế có thêm một nhóm món mới.</p>
        <div className="mt-5 grid gap-4"><Field label="Tên danh mục"><Input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} className="h-11 rounded-xl bg-white" required /></Field><Field label="Mô tả"><Textarea value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} className="min-h-24 rounded-xl bg-white" /></Field><Field label="Thứ tự"><Input type="number" min="0" value={draft.sort_order} onChange={(event) => setDraft({ ...draft, sort_order: Number(event.target.value) })} className="h-11 rounded-xl bg-white" /></Field></div>
        <Button disabled={saving} className="mt-5 h-11 w-full rounded-xl bg-[#184d39] text-white"><Plus size={17} /> Thêm danh mục</Button>
      </form>
    </div>
  );
}

function NewsPanel({ items, saving, mutate }: { items: MenuItem[]; saving: boolean; mutate: MutateFn }) {
  const [draft, setDraft] = useState<NewsDraft>(() => emptyNews());
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<NewsFilter>("all");
  const [editorOpen, setEditorOpen] = useState(false);

  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("vi");
    return [...items]
      .filter((item) => {
        if (needle && !`${item.name} ${item.description}`.toLocaleLowerCase("vi").includes(needle)) return false;
        if (filter === "published" && !item.is_available) return false;
        if (filter === "draft" && item.is_available) return false;
        if (filter === "featured" && !item.is_featured) return false;
        return true;
      })
      .sort((a, b) => {
        if (a.is_featured !== b.is_featured) return Number(b.is_featured) - Number(a.is_featured);
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      });
  }, [filter, items, query]);

  const publishedCount = items.filter((item) => item.is_available).length;
  const featuredCount = items.filter((item) => item.is_available && item.is_featured).length;
  const draftCount = items.filter((item) => !item.is_available).length;

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const editing = Boolean(draft.id);
    const saved = await mutate(
      "/api/admin/menu",
      { method: editing ? "PATCH" : "POST", body: JSON.stringify({ entity: "news", id: draft.id, data: draft }) },
      editing ? "Đã cập nhật bản tin." : "Đã đăng bản tin mới.",
    );
    if (saved) {
      setDraft(emptyNews());
      setEditorOpen(false);
    }
  }

  async function quickUpdate(item: MenuItem, patch: Partial<Pick<NewsDraft, "is_featured" | "is_published" | "sort_order">>, success: string) {
    await mutate(
      "/api/admin/menu",
      { method: "PATCH", body: JSON.stringify({ entity: "news", id: item.id, data: patch }) },
      success,
    );
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

  function openCreate() {
    setDraft(emptyNews());
    setUploadError("");
    setEditorOpen(true);
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
    setUploadError("");
    setEditorOpen(true);
  }

  function closeEditor() {
    if (saving || uploading) return;
    setEditorOpen(false);
    setDraft(emptyNews());
    setUploadError("");
  }

  function adminDate(value?: string) {
    if (!value) return "Chưa có ngày";
    return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(value));
  }

  return (
    <div className="mt-5">
      <section className="overflow-hidden rounded-[1.8rem] border border-[#ddd7c9] bg-[#fffced] shadow-[0_16px_50px_rgba(39,65,51,0.045)]">
        <div className="flex flex-col gap-4 border-b border-[#eee8dc] p-5 sm:p-6 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold">Quản lý bản tin</h2>
              <span className="rounded-full bg-[#c7db95] px-2.5 py-1 text-xs font-extrabold text-[#55705f]">{items.length} bài</span>
            </div>
            <p className="mt-1 text-sm text-[#77857d]">Bật Nổi bật để bài tự xuất hiện ở khu vực Bản tin trên trang chủ.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/news" target="_blank" className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#d7d1bf] bg-white px-4 text-sm font-bold text-[#184d39] transition hover:bg-[#fffced]">
              <Eye size={16} /> Xem trang Bản tin
            </Link>
            <Button type="button" onClick={openCreate} className="h-10 rounded-xl bg-[#184d39] px-4 text-white hover:bg-[#184d39]">
              <Plus size={16} /> Viết bài mới
            </Button>
          </div>
        </div>

        <div className="grid gap-3 border-b border-[#eee8dc] bg-[#fffced] p-4 sm:grid-cols-3 sm:p-5">
          <div className="rounded-2xl border border-[#e4dfd3] bg-white px-4 py-3">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#87938b]">Đang hiển thị</p>
            <p className="mt-1 text-2xl font-extrabold text-[#184d39]">{publishedCount}</p>
          </div>
          <div className="rounded-2xl border border-[#c7db95] bg-[#c7db95] px-4 py-3">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#7b8f72]">Nổi bật trang chủ</p>
            <p className="mt-1 text-2xl font-extrabold text-[#55705b]">{featuredCount}</p>
          </div>
          <div className="rounded-2xl border border-[#e4dfd3] bg-white px-4 py-3">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#87938b]">Bản nháp</p>
            <p className="mt-1 text-2xl font-extrabold text-[#6f796f]">{draftCount}</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-b border-[#eee8dc] p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#87938b]" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm theo tiêu đề hoặc nội dung..."
              className="h-11 rounded-xl border-[#d7d1bf] bg-white pl-10"
            />
          </div>
          <div className="admin-scrollbar flex gap-2 overflow-x-auto pb-1 lg:pb-0">
            {([
              ["all", "Tất cả"],
              ["published", "Đang hiện"],
              ["featured", "Nổi bật"],
              ["draft", "Bản nháp"],
            ] as Array<[NewsFilter, string]>).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                className={`h-10 shrink-0 rounded-xl px-3.5 text-xs font-extrabold transition ${filter === value ? "bg-[#184d39] text-white" : "border border-[#ded8cb] bg-[#fffced] text-[#607067] hover:bg-white"}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-[#eee8dc]">
          {filtered.length ? filtered.map((item) => (
            <article key={item.id} className="grid gap-4 p-4 transition hover:bg-[#fffced] sm:p-5 md:grid-cols-[9rem_minmax(0,1fr)] xl:grid-cols-[10rem_minmax(0,1fr)_auto] xl:items-center">
              <button type="button" onClick={() => edit(item)} className="group h-28 overflow-hidden rounded-2xl border border-[#e2dccf] bg-[#c7db95] text-left md:h-24 xl:h-24">
                {item.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.image_url} alt={item.name} loading="lazy" className="h-full w-full object-contain transition duration-300 group-hover:scale-[1.02]" />
                ) : (
                  <div className="soft-grid grid h-full place-items-center text-[#78906f]"><Newspaper size={22} /></div>
                )}
              </button>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.08em] ${item.is_available ? "bg-[#c7db95] text-[#50705a]" : "bg-[#fffced] text-[#807970]"}`}>
                    {item.is_available ? "Đang hiển thị" : "Bản nháp"}
                  </span>
                  {item.is_featured ? <span className="inline-flex items-center gap-1 rounded-full bg-[#fff3c8] px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.08em] text-[#87671e]"><Sparkles size={11} /> Nổi bật</span> : null}
                  <span className="text-[10px] font-semibold text-[#96a098]">{adminDate(item.created_at)}</span>
                </div>
                <h3 className="mt-2 line-clamp-1 text-base font-extrabold text-[#184d39] sm:text-lg">{item.name}</h3>
                <p className="mt-1 line-clamp-2 text-sm leading-6 text-[#758279]">{item.description || "Chưa có nội dung."}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2 xl:hidden">
                  {item.is_available ? <Link href={`/news/${item.id}`} target="_blank" className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-[#d7d1bf] bg-white px-3 text-xs font-bold text-[#184d39]"><Eye size={14} /> Xem bài</Link> : null}
                  <Button type="button" variant="outline" className="h-9 rounded-xl border-[#d7d1bf] bg-white px-3 text-xs" onClick={() => edit(item)}><Pencil size={14} /> Sửa</Button>
                </div>
              </div>

              <div className="col-span-full flex flex-wrap items-center gap-2 border-t border-dashed border-[#e2dcd0] pt-3 md:col-start-2 xl:col-auto xl:border-0 xl:pt-0">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => quickUpdate(item, { is_featured: !item.is_featured }, item.is_featured ? "Đã bỏ bài khỏi mục nổi bật trang chủ." : "Đã đưa bài lên mục nổi bật trang chủ.")}
                  className={`inline-flex h-10 items-center gap-2 rounded-xl border px-3 text-xs font-extrabold transition ${item.is_featured ? "border-[#d8c77f] bg-[#fff5cf] text-[#7d611d]" : "border-[#d8d3c7] bg-white text-[#68766e] hover:border-[#cbd7ae] hover:text-[#184d39]"}`}
                  title="Bài nổi bật sẽ tự hiển thị trên trang chủ"
                >
                  <Sparkles size={14} /> {item.is_featured ? "Đang nổi bật" : "Đưa lên nổi bật"}
                </button>
                <label className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#d8d3c7] bg-white px-3 text-xs font-bold text-[#68766e]">
                  <Switch
                    checked={item.is_available}
                    disabled={saving}
                    onCheckedChange={(value) => quickUpdate(item, { is_published: value }, value ? "Đã hiển thị bản tin." : "Đã chuyển bản tin thành bản nháp.")}
                  />
                  {item.is_available ? "Đang hiện" : "Đang ẩn"}
                </label>
                <Button type="button" variant="outline" size="icon" className="hidden h-10 w-10 rounded-xl border-[#d7d1bf] bg-white xl:inline-flex" onClick={() => edit(item)} aria-label={`Sửa ${item.name}`}><Pencil size={15} /></Button>
                <DeleteConfirm compact label={item.name} disabled={saving} onConfirm={() => mutate(`/api/admin/menu?entity=news&id=${encodeURIComponent(item.id)}`, { method: "DELETE" }, "Đã xóa bản tin.")} />
              </div>
            </article>
          )) : (
            <div className="grid min-h-72 place-items-center p-8 text-center">
              <div>
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#c7db95] text-[#75906e]"><Newspaper size={23} /></span>
                <p className="mt-4 font-bold text-[#184d39]">Không tìm thấy bản tin phù hợp</p>
                <p className="mt-1 text-sm text-[#829087]">Thử đổi bộ lọc hoặc tạo một bài viết mới.</p>
                <Button type="button" onClick={openCreate} className="mt-4 h-10 rounded-xl bg-[#184d39]"><Plus size={15} /> Viết bài mới</Button>
              </div>
            </div>
          )}
        </div>
      </section>

      {editorOpen ? (
        <div className="fixed inset-0 z-[120]">
          <button type="button" aria-label="Đóng trình biên tập" className="absolute inset-0 bg-[#184d39]/45 backdrop-blur-[2px]" onClick={closeEditor} />
          <aside className="absolute inset-y-0 right-0 flex w-full max-w-[38rem] flex-col border-l border-[#d9d2c3] bg-[#fffced] shadow-[-24px_0_70px_rgba(24,56,44,0.18)]">
            <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
              <header className="flex shrink-0 items-center justify-between gap-4 border-b border-[#e4ded2] bg-[#fffced] px-4 py-4 sm:px-6">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#7d9274]">Biên tập Bản tin</p>
                  <h2 className="mt-1 text-xl font-bold text-[#184d39]">{draft.id ? "Chỉnh sửa bài viết" : "Viết bài mới"}</h2>
                </div>
                <Button type="button" variant="outline" size="icon" onClick={closeEditor} disabled={saving || uploading} className="h-10 w-10 rounded-xl border-[#d7d1bf] bg-white"><X size={17} /></Button>
              </header>

              <div className="admin-scrollbar min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
                <div className="grid gap-5">
                  <Field label="Tiêu đề" hint={`${draft.title.length}/180`}>
                    <Input value={draft.title} maxLength={180} onChange={(event) => setDraft({ ...draft, title: event.target.value })} className="h-12 rounded-xl border-[#d7d1bf] bg-white" placeholder="Ví dụ: Một mẻ bánh mới bắt đầu như thế nào?" required />
                  </Field>

                  <Field label="Ảnh đại diện" hint="Khuyên dùng ảnh ngang 16:10">
                    <div className="grid gap-3">
                      <div className="flex min-h-52 items-center justify-center overflow-hidden rounded-2xl border border-[#ddd6c8] bg-[#eee9de]">
                        {draft.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={draft.image_url} alt="Xem trước ảnh bản tin" className="max-h-72 w-full object-contain" />
                        ) : (
                          <div className="soft-grid grid min-h-52 w-full place-items-center text-center text-[#7b8e79]"><div><ImageUp className="mx-auto" size={24} /><p className="mt-2 text-xs font-bold">Ảnh sẽ hiển thị ở đây</p></div></div>
                        )}
                      </div>
                      <Input value={draft.image_url} onChange={(event) => setDraft({ ...draft, image_url: event.target.value })} placeholder="https://..." className="h-11 rounded-xl border-[#d7d1bf] bg-white" />
                      <label className="flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-[#aebe9f] bg-white text-sm font-semibold text-[#184d39] transition hover:bg-[#fffced]">
                        <input type="file" accept="image/*" className="sr-only" onChange={(event) => upload(event.target.files?.[0])} disabled={uploading} />
                        {uploading ? <Loader2 className="animate-spin" size={17} /> : <ImageUp size={17} />}
                        {uploading ? "Đang tải ảnh…" : "Chọn ảnh từ máy"}
                      </label>
                    </div>
                  </Field>

                  {uploadError ? <p className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm font-semibold text-red-700">{uploadError}</p> : null}

                  <Field label="Nội dung" hint={`${draft.content.length}/12000`}>
                    <Textarea value={draft.content} maxLength={12000} onChange={(event) => setDraft({ ...draft, content: event.target.value })} className="min-h-[20rem] resize-y rounded-xl border-[#d7d1bf] bg-white p-4 leading-7" placeholder="Viết nội dung bài ở đây. Có thể xuống dòng để chia đoạn..." required />
                  </Field>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-[#d9d3c6] bg-white p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div><p className="text-sm font-extrabold text-[#184d39]">Hiển thị trên web</p><p className="mt-1 text-xs leading-5 text-[#849087]">Tắt để lưu bài thành bản nháp.</p></div>
                        <Switch checked={draft.is_published} onCheckedChange={(value) => setDraft({ ...draft, is_published: value })} />
                      </div>
                    </div>
                    <div className={`rounded-2xl border p-4 ${draft.is_featured ? "border-[#d7c77d] bg-[#fff7d9]" : "border-[#d9d3c6] bg-white"}`}>
                      <div className="flex items-center justify-between gap-4">
                        <div><p className="flex items-center gap-1.5 text-sm font-extrabold text-[#184d39]"><Sparkles size={14} /> Nổi bật</p><p className="mt-1 text-xs leading-5 text-[#849087]">Bật để bài xuất hiện trên trang chủ.</p></div>
                        <Switch checked={draft.is_featured} onCheckedChange={(value) => setDraft({ ...draft, is_featured: value })} />
                      </div>
                    </div>
                  </div>

                  <Field label="Thứ tự ưu tiên" hint="Số nhỏ hiển thị trước khi cùng mức ưu tiên">
                    <Input type="number" min="0" max="9999" value={draft.sort_order} onChange={(event) => setDraft({ ...draft, sort_order: Number(event.target.value) })} className="h-11 rounded-xl border-[#d7d1bf] bg-white" />
                  </Field>
                </div>
              </div>

              <footer className="shrink-0 border-t border-[#e4ded2] bg-[#fffced] p-4 sm:px-6">
                <div className="flex gap-2">
                  <Button type="submit" disabled={saving || uploading} className="h-12 flex-1 rounded-xl bg-[#184d39] text-white hover:bg-[#184d39]">
                    {saving ? <Loader2 className="animate-spin" size={17} /> : <Save size={17} />}
                    {saving ? "Đang lưu…" : draft.id ? "Lưu thay đổi" : "Đăng bản tin"}
                  </Button>
                  <Button type="button" variant="outline" onClick={closeEditor} disabled={saving || uploading} className="h-12 rounded-xl border-[#d7d1bf] bg-white px-5">Hủy</Button>
                </div>
              </footer>
            </form>
          </aside>
        </div>
      ) : null}
    </div>
  );
}

function ShopPanel({ shop, saving, mutate }: { shop: ShopSettings; saving: boolean; mutate: MutateFn }) {
  const [draft, setDraft] = useState(shop);
  const fields = useMemo(() => [
    ["name", "Tên quán"], ["tagline", "Dòng giới thiệu ngắn"], ["phone", "Số điện thoại"], ["email", "Email"], ["address", "Địa chỉ"], ["map_url", "Liên kết Google Maps"], ["zalo_url", "Liên kết Zalo"], ["opening_text", "Giờ/ghi chú mở cửa"],
  ] as const, []);

  return (
    <form onSubmit={(event) => { event.preventDefault(); mutate("/api/admin/menu", { method: "PATCH", body: JSON.stringify({ entity: "shop", id: "1", data: draft }) }, "Đã cập nhật thông tin quán."); }} className="mt-5 overflow-hidden rounded-[1.8rem] border border-[#ddd7c9] bg-[#fffced] shadow-[0_16px_50px_rgba(39,65,51,0.045)]">
      <div className="border-b border-[#eee8dc] px-5 py-5 sm:px-6"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#c7db95] text-[#55725c]"><Store size={18} /></span><div><h2 className="text-xl font-bold">Thông tin quán</h2><p className="mt-1 text-sm text-[#77857d]">Thông tin liên hệ và liên kết hiển thị trên website.</p></div></div></div>
      <div className="p-5 sm:p-6"><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{fields.map(([name, label]) => <Field key={name} label={label}><Input value={String(draft[name])} onChange={(event) => setDraft({ ...draft, [name]: event.target.value })} className="h-11 rounded-xl border-[#d7d1bf] bg-white" required /></Field>)}</div><div className="mt-4"><Field label="Mô tả quán"><Textarea value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} className="min-h-28 rounded-xl border-[#d7d1bf] bg-white" required /></Field></div><div className="mt-6 flex justify-end"><Button disabled={saving} className="h-11 rounded-xl bg-[#184d39] px-6"><Save size={17} /> Lưu thông tin quán</Button></div></div>
    </form>
  );
}
