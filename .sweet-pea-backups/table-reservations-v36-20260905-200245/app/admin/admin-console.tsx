"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Film,
  ImageUp,
  Images,
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
type NewsMediaKind = "image" | "gif" | "video";
type NewsMediaDraft = {
  type: NewsMediaKind;
  url: string;
};

type NewsDraft = {
  id?: string;
  title: string;
  content: string;
  image_url: string;
  media: NewsMediaDraft[];
  media_autoplay_seconds: number;
  is_featured: boolean;
  is_published: boolean;
  sort_order: number;
};

type SizeOptionDraft = {
  key: string;
  label: string;
  price: number;
};

type ProductMeta = {
  description: string;
  sizes: SizeOptionDraft[];
  images: string[];
  autoplaySeconds: number;
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
  media: [],
  media_autoplay_seconds: 0,
  is_featured: false,
  is_published: true,
  sort_order: 0,
});

const NEWS_MEDIA_MARKER = /\[\[newsmedia:([^\]]*)\]\]/i;
const NEWS_AUTOPLAY_MARKER = /\[\[newsautoplay:(\d+)\]\]/i;

function cleanNewsContent(value?: string) {
  return (value || "")
    .replace(NEWS_MEDIA_MARKER, "")
    .replace(NEWS_AUTOPLAY_MARKER, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function inferNewsMediaKind(url: string): NewsMediaKind {
  const clean = url.split("?")[0].toLowerCase();
  if (clean.endsWith(".gif")) return "gif";
  if (/\.(mp4|webm|mov|m4v|ogv|ogg)$/i.test(clean)) return "video";
  return "image";
}

function parseNewsMeta(item: Pick<MenuItem, "description" | "image_url">) {
  const raw = item.description || "";
  const mediaMatch = raw.match(NEWS_MEDIA_MARKER);
  const autoplayMatch = raw.match(NEWS_AUTOPLAY_MARKER);
  const media: NewsMediaDraft[] = [];

  if (mediaMatch?.[1]) {
    mediaMatch[1].split("|").map((entry) => entry.trim()).filter(Boolean).forEach((entry) => {
      const separator = entry.indexOf("=");
      if (separator <= 0) return;
      const rawType = entry.slice(0, separator).trim().toLowerCase();
      const encodedUrl = entry.slice(separator + 1).trim();
      let url = encodedUrl;
      try { url = decodeURIComponent(encodedUrl); } catch { /* keep URL */ }
      if (!url) return;
      const type: NewsMediaKind = rawType === "video" ? "video" : rawType === "gif" ? "gif" : "image";
      if (!media.some((candidate) => candidate.url === url)) media.push({ type, url });
    });
  }

  if (item.image_url && !media.some((candidate) => candidate.url === item.image_url)) {
    media.unshift({ type: inferNewsMediaKind(item.image_url), url: item.image_url });
  }

  return {
    content: cleanNewsContent(raw),
    media: media.slice(0, 12),
    autoplaySeconds: autoplayMatch ? Math.max(0, Math.min(30, Number(autoplayMatch[1]) || 0)) : 0,
  };
}


const SIZE_MARKER = /\[\[sizes:([^\]]+)\]\]/i;
const GALLERY_MARKER = /\[\[gallery:([^\]]+)\]\]/i;
const AUTOPLAY_MARKER = /\[\[autoplay:(\d+)\]\]/i;

function uniqueImages(images: string[]) {
  return [...new Set(images.map((image) => image.trim()).filter(Boolean))];
}

function cleanProductDescription(value?: string) {
  return (value || "")
    .replace(SIZE_MARKER, "")
    .replace(GALLERY_MARKER, "")
    .replace(AUTOPLAY_MARKER, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function parseProductMeta(item: Pick<MenuItem, "description" | "image_url">): ProductMeta {
  const raw = item.description || "";
  const sizeMatch = raw.match(SIZE_MARKER);
  const galleryMatch = raw.match(GALLERY_MARKER);
  const autoplayMatch = raw.match(AUTOPLAY_MARKER);

  const sizes = sizeMatch
    ? sizeMatch[1]
        .split(/[|;]/)
        .map((part, index) => {
          const match = part.trim().match(/^([^=:]+?)\s*[=:]\s*([\d.,]+)\s*(?:đ|vnd)?$/i);
          if (!match) return null;
          const price = Number(match[2].replace(/[^\d]/g, ""));
          if (!match[1].trim() || !price) return null;
          return { key: `saved-${index}-${match[1].trim()}`, label: match[1].trim(), price };
        })
        .filter((value): value is SizeOptionDraft => Boolean(value))
    : [];

  const images = uniqueImages([
    item.image_url || "",
    ...(galleryMatch ? galleryMatch[1].split("|") : []),
  ]);
  const autoplaySeconds = autoplayMatch ? Number(autoplayMatch[1] || 0) : 0;

  return {
    description: cleanProductDescription(raw),
    sizes,
    images,
    autoplaySeconds: autoplaySeconds >= 2 && autoplaySeconds <= 30 ? autoplaySeconds : 0,
  };
}

function serializeProductDescription(
  description: string,
  sizes: SizeOptionDraft[],
  images: string[],
  autoplaySeconds: number,
) {
  const parts = [cleanProductDescription(description)];
  const validSizes = sizes
    .map((size) => ({ label: size.label.trim(), price: Number(size.price || 0) }))
    .filter((size) => size.label && size.price > 0);
  const validImages = uniqueImages(images);

  if (validSizes.length) {
    parts.push(`[[sizes:${validSizes.map((size) => `${size.label}=${Math.round(size.price)}`).join("|")}]]`);
  }
  if (validImages.length > 1) {
    parts.push(`[[gallery:${validImages.join("|")}]]`);
  }
  if (validImages.length > 1 && autoplaySeconds > 0) {
    parts.push(`[[autoplay:${Math.round(autoplaySeconds)}]]`);
  }

  return parts.filter(Boolean).join("\n");
}

function defaultSizeOptions(): SizeOptionDraft[] {
  return [
    { key: "size-default-m", label: "M", price: 0 },
    { key: "size-default-l", label: "L", price: 0 },
  ];
}

function menuCategories(data: Pick<StoreData, "categories">) {
  return data.categories.filter((category) => category.slug !== NEWS_CATEGORY_SLUG);
}

function money(value: number) {
  return new Intl.NumberFormat("vi-VN").format(Number(value || 0)) + "đ";
}

function adminProductPrice(item: MenuItem) {
  const sizes = parseProductMeta(item).sizes;
  if (!sizes.length) return money(item.price);
  return `Từ ${money(Math.min(...sizes.map((size) => size.price)))}`;
}

function adminProductDescription(item: MenuItem) {
  const meta = parseProductMeta(item);
  const extras = [
    meta.sizes.length ? `${meta.sizes.length} size` : "",
    meta.images.length > 1 ? `${meta.images.length} ảnh` : "",
    meta.autoplaySeconds ? `auto ${meta.autoplaySeconds}s` : "",
  ].filter(Boolean);
  return [meta.description || "Không có mô tả", extras.join(" · ")].filter(Boolean).join(" · ");
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


async function uploadNewsMediaToCloudinary(file: File): Promise<NewsMediaDraft> {
  const isVideo = file.type.startsWith("video/");
  const isImage = file.type.startsWith("image/");
  if (!isVideo && !isImage) throw new Error("Chỉ hỗ trợ hình ảnh, GIF hoặc video.");
  const limit = isVideo ? 80 * 1024 * 1024 : 20 * 1024 * 1024;
  if (file.size > limit) throw new Error(isVideo ? "Video phải nhỏ hơn 80MB." : "Ảnh/GIF phải nhỏ hơn 20MB.");

  const signed = await api<{ cloudName: string; apiKey: string; folder: string; timestamp: number; signature: string }>(
    "/api/admin/upload-signature",
    { method: "POST" },
  );
  const form = new FormData();
  form.append("file", file);
  form.append("api_key", signed.apiKey);
  form.append("folder", signed.folder);
  form.append("timestamp", String(signed.timestamp));
  form.append("signature", signed.signature);
  // Use an explicit Cloudinary resource endpoint. The old /auto/upload endpoint can
  // reject signed uploads on some Cloudinary accounts, which made adding images
  // from the Edit News form appear to do nothing even though the UI was correct.
  const resourceType = isVideo ? "video" : "image";
  const response = await fetch(`https://api.cloudinary.com/v1_1/${signed.cloudName}/${resourceType}/upload`, {
    method: "POST",
    body: form,
  });
  const result = (await response.json()) as { secure_url?: string; resource_type?: string; format?: string; error?: { message?: string } };
  if (!response.ok || !result.secure_url) throw new Error(result.error?.message || "Tải media thất bại.");
  const type: NewsMediaKind = isVideo ? "video" : file.type === "image/gif" || result.format?.toLowerCase() === "gif" ? "gif" : "image";
  return { type, url: result.secure_url };
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
  const [sizeMode, setSizeMode] = useState(false);
  const [sizeOptions, setSizeOptions] = useState<SizeOptionDraft[]>(() => defaultSizeOptions());
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [galleryAutoplay, setGalleryAutoplay] = useState(false);
  const [manualImageUrl, setManualImageUrl] = useState("");
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
    setError("");

    const validSizes = sizeMode
      ? sizeOptions
          .map((option) => ({ ...option, label: option.label.trim(), price: Number(option.price || 0) }))
          .filter((option) => option.label && option.price > 0)
      : [];

    if (sizeMode && validSizes.length === 0) {
      setError("Hãy thêm ít nhất một size có tên và giá hợp lệ.");
      return;
    }

    const images = uniqueImages(galleryImages);
    const primaryPrice = sizeMode
      ? Math.min(...validSizes.map((option) => option.price))
      : Number(itemDraft.price || 0);

    if (!sizeMode && primaryPrice <= 0) {
      setError("Giá bán phải lớn hơn 0.");
      return;
    }

    const payload: ItemDraft = {
      ...itemDraft,
      price: primaryPrice,
      image_url: images[0] || "",
      description: serializeProductDescription(
        itemDraft.description,
        validSizes,
        images,
        galleryAutoplay && images.length > 1 ? 5 : 0,
      ),
    };

    const editing = Boolean(itemDraft.id);
    const saved = await mutate(
      "/api/admin/menu",
      {
        method: editing ? "PATCH" : "POST",
        body: JSON.stringify({ entity: "item", id: itemDraft.id, data: itemPayload(payload) }),
      },
      editing ? "Đã cập nhật món." : "Đã thêm món mới.",
    );

    if (saved) {
      setItemDraft(emptyItem(data ? menuCategories(data)[0]?.id || "" : ""));
      setSizeMode(false);
      setSizeOptions(defaultSizeOptions());
      setGalleryImages([]);
      setGalleryAutoplay(false);
      setManualImageUrl("");
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

  async function uploadImages(files?: FileList | null) {
    if (!files?.length) return;
    const selectedFiles = Array.from(files).slice(0, Math.max(0, 8 - galleryImages.length));
    if (!selectedFiles.length) {
      setError("Mỗi sản phẩm hỗ trợ tối đa 8 hình.");
      return;
    }

    setUploading(true);
    setError("");
    setMessage("");
    try {
      const uploaded: string[] = [];
      for (const file of selectedFiles) {
        uploaded.push(await uploadToCloudinary(file));
      }
      setGalleryImages((current) => uniqueImages([...current, ...uploaded]).slice(0, 8));
      setMessage(`Đã tải ${uploaded.length} hình. Bấm Lưu món để hoàn tất.`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Tải ảnh thất bại.");
    } finally {
      setUploading(false);
    }
  }

  function addManualImage() {
    const url = manualImageUrl.trim();
    if (!url) return;
    if (!/^https?:\/\//i.test(url)) {
      setError("URL ảnh phải bắt đầu bằng http:// hoặc https://");
      return;
    }
    setGalleryImages((current) => uniqueImages([...current, url]).slice(0, 8));
    setManualImageUrl("");
    setError("");
  }

  function moveGalleryImage(index: number, direction: -1 | 1) {
    setGalleryImages((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function openCreateItem(categoryId?: string) {
    setItemDraft(emptyItem(categoryId || (data ? menuCategories(data)[0]?.id || "" : "")));
    setSizeMode(false);
    setSizeOptions(defaultSizeOptions());
    setGalleryImages([]);
    setGalleryAutoplay(false);
    setManualImageUrl("");
    setItemEditorOpen(true);
  }

  function openEditItem(item: MenuItem) {
    const meta = parseProductMeta(item);
    setItemDraft({ ...item, description: meta.description, image_url: meta.images[0] || item.image_url || "" });
    setSizeMode(meta.sizes.length > 0);
    setSizeOptions(meta.sizes.length ? meta.sizes : defaultSizeOptions());
    setGalleryImages(meta.images);
    setGalleryAutoplay(meta.autoplaySeconds === 5);
    setManualImageUrl("");
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
                                    <p className="mt-1 max-w-[22rem] truncate text-xs text-[#8a958e]">{adminProductDescription(item)}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3"><span className="inline-flex rounded-lg bg-[#c7db95] px-2.5 py-1.5 text-xs font-bold text-[#5d735f]">{categoryById.get(item.category_id) || "Chưa phân loại"}</span></td>
                              <td className="px-4 py-3 text-sm font-extrabold tabular-nums text-[#184d39]">{adminProductPrice(item)}</td>
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
                                <strong className="shrink-0 text-sm text-[#184d39]">{adminProductPrice(item)}</strong>
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
          <button type="button" aria-label="Đóng form" className="absolute inset-0 bg-[#184d39]/48 backdrop-blur-[3px]" onClick={() => setItemEditorOpen(false)} />
          <div className="absolute inset-y-0 right-0 flex w-full max-w-[48rem] flex-col bg-[#fffced] shadow-[-28px_0_80px_rgba(24,77,57,0.2)]">
            <div className="flex items-center justify-between gap-3 border-b border-[#184d39]/10 px-5 py-4 sm:px-7">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#184d39]/55">Thực đơn · Sản phẩm</p>
                <h2 className="mt-1 text-xl font-bold text-[#184d39] sm:text-2xl">{itemDraft.id ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}</h2>
                <p className="mt-1 text-xs text-[#184d39]/55">Quản lý size, giá và bộ ảnh trong cùng một sản phẩm.</p>
              </div>
              <Button type="button" variant="outline" size="icon" onClick={() => setItemEditorOpen(false)} className="h-10 w-10 rounded-xl border-[#184d39]/12 bg-white/70 text-[#184d39]"><X size={17} /></Button>
            </div>

            <form onSubmit={saveItem} className="flex min-h-0 flex-1 flex-col">
              <div className="admin-scrollbar flex-1 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
                <div className="grid gap-6">
                  <section className="rounded-[1.5rem] border border-[#184d39]/10 bg-white/55 p-4 sm:p-5">
                    <div className="mb-4 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#184d39]/55">01 · Thông tin chung</p>
                        <h3 className="mt-1 font-bold text-[#184d39]">Tên món và danh mục</h3>
                      </div>
                      <span className="rounded-full bg-[#c7db95]/55 px-3 py-1 text-[10px] font-bold text-[#184d39]">Bắt buộc</span>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Tên sản phẩm">
                        <Input value={itemDraft.name} onChange={(event) => setItemDraft({ ...itemDraft, name: event.target.value })} className="h-11 rounded-xl border-[#184d39]/12 bg-[#fffced]" placeholder="Ví dụ: Matcha latte" required />
                      </Field>
                      <Field label="Danh mục">
                        <select value={itemDraft.category_id} onChange={(event) => setItemDraft({ ...itemDraft, category_id: event.target.value })} className="h-11 rounded-xl border border-[#184d39]/12 bg-[#fffced] px-3 text-sm text-[#184d39] outline-none focus:border-[#184d39]/35" required>
                          {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                        </select>
                      </Field>
                    </div>

                    <div className="mt-4">
                      <Field label="Mô tả" hint="Không bắt buộc">
                        <Textarea value={itemDraft.description} onChange={(event) => setItemDraft({ ...itemDraft, description: event.target.value })} className="min-h-24 rounded-xl border-[#184d39]/12 bg-[#fffced]" placeholder="Hương vị, thành phần hoặc ghi chú ngắn cho khách..." />
                      </Field>
                    </div>
                  </section>

                  <section className="rounded-[1.5rem] border border-[#184d39]/10 bg-white/55 p-4 sm:p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#184d39]/55">02 · Size & giá</p>
                        <h3 className="mt-1 font-bold text-[#184d39]">Giá bán theo từng kích thước</h3>
                        <p className="mt-1 text-xs leading-5 text-[#184d39]/55">Bật nhiều size nếu cùng một món có các mức giá khác nhau.</p>
                      </div>
                      <label className="flex min-h-11 items-center justify-between gap-4 rounded-xl border border-[#184d39]/10 bg-[#c7db95]/30 px-3 text-sm font-semibold text-[#184d39] sm:min-w-[14rem]">
                        <span>Nhiều size / nhiều giá</span>
                        <Switch checked={sizeMode} onCheckedChange={(value) => {
                          setSizeMode(value);
                          if (value && !sizeOptions.length) setSizeOptions(defaultSizeOptions());
                        }} />
                      </label>
                    </div>

                    {sizeMode ? (
                      <div className="mt-5 grid gap-2.5">
                        {sizeOptions.map((option, index) => (
                          <div key={option.key} className="grid grid-cols-[minmax(0,0.7fr)_minmax(0,1fr)_40px] items-end gap-2 rounded-2xl border border-[#184d39]/10 bg-[#fffced] p-3">
                            <Field label={`Size ${index + 1}`}>
                              <Input value={option.label} onChange={(event) => setSizeOptions((current) => current.map((entry) => entry.key === option.key ? { ...entry, label: event.target.value } : entry))} placeholder="S / M / L / 500ml" className="h-10 rounded-xl border-[#184d39]/12 bg-white" required />
                            </Field>
                            <Field label="Giá" hint="VNĐ">
                              <Input type="number" min="0" step="1000" value={option.price || ""} onChange={(event) => setSizeOptions((current) => current.map((entry) => entry.key === option.key ? { ...entry, price: Number(event.target.value) } : entry))} placeholder="35000" className="h-10 rounded-xl border-[#184d39]/12 bg-white" required />
                            </Field>
                            <Button type="button" variant="outline" size="icon" disabled={sizeOptions.length <= 1} onClick={() => setSizeOptions((current) => current.filter((entry) => entry.key !== option.key))} className="h-10 w-10 rounded-xl border-[#a64538]/20 bg-white text-[#a64538] hover:bg-[#a64538]/5">
                              <Trash2 size={15} />
                            </Button>
                          </div>
                        ))}

                        <button type="button" onClick={() => setSizeOptions((current) => [...current, { key: `size-${Date.now()}-${current.length}`, label: "", price: 0 }])} className="mt-1 inline-flex min-h-10 w-fit items-center gap-2 rounded-full border border-dashed border-[#184d39]/25 bg-[#c7db95]/22 px-4 text-xs font-bold text-[#184d39] transition hover:bg-[#c7db95]/38">
                          <Plus size={15} /> Thêm size
                        </button>

                        <div className="rounded-xl bg-[#c7db95]/22 px-3 py-2.5 text-xs leading-5 text-[#184d39]/65">
                          Trên website giá sẽ hiển thị dạng <strong className="text-[#184d39]">Từ {(() => { const prices = sizeOptions.filter((option) => option.price > 0).map((option) => option.price); return prices.length ? money(Math.min(...prices)) : "—"; })()}</strong> và khách có thể bấm xem từng size.
                        </div>
                      </div>
                    ) : (
                      <div className="mt-5 max-w-sm">
                        <Field label="Giá bán" hint="VNĐ">
                          <Input type="number" min="0" step="1000" value={itemDraft.price || ""} onChange={(event) => setItemDraft({ ...itemDraft, price: Number(event.target.value) })} className="h-11 rounded-xl border-[#184d39]/12 bg-[#fffced]" placeholder="35000" required />
                        </Field>
                      </div>
                    )}
                  </section>

                  <section className="rounded-[1.5rem] border border-[#184d39]/10 bg-white/55 p-4 sm:p-5">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#184d39]/55">03 · Hình sản phẩm</p>
                        <h3 className="mt-1 font-bold text-[#184d39]">Một hoặc nhiều hình</h3>
                        <p className="mt-1 text-xs leading-5 text-[#184d39]/55">Tối đa 8 hình. Hình đầu tiên là ảnh bìa; có thể đổi thứ tự bằng mũi tên.</p>
                      </div>
                      <span className="w-fit rounded-full bg-[#c7db95]/50 px-3 py-1 text-[10px] font-bold text-[#184d39]">{galleryImages.length}/8 ảnh</span>
                    </div>

                    {galleryImages.length ? (
                      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                        {galleryImages.map((image, index) => (
                          <div key={`${image}-${index}`} className="group relative overflow-hidden rounded-2xl border border-[#184d39]/10 bg-[#fffced]">
                            <div className="aspect-square p-1.5">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={image} alt={`Ảnh sản phẩm ${index + 1}`} className="h-full w-full rounded-xl object-contain" />
                            </div>
                            <div className="absolute inset-x-1.5 bottom-1.5 flex items-center justify-between gap-1 rounded-xl bg-[#184d39]/86 p-1.5 text-[#fffced] backdrop-blur">
                              <span className="pl-1 text-[9px] font-bold">{index === 0 ? "Ảnh bìa" : `Ảnh ${index + 1}`}</span>
                              <div className="flex items-center gap-0.5">
                                <button type="button" disabled={index === 0} onClick={() => moveGalleryImage(index, -1)} className="grid h-7 w-7 place-items-center rounded-lg hover:bg-white/10 disabled:opacity-30" aria-label="Chuyển ảnh sang trái">←</button>
                                <button type="button" disabled={index === galleryImages.length - 1} onClick={() => moveGalleryImage(index, 1)} className="grid h-7 w-7 place-items-center rounded-lg hover:bg-white/10 disabled:opacity-30" aria-label="Chuyển ảnh sang phải">→</button>
                                <button type="button" onClick={() => setGalleryImages((current) => current.filter((_, imageIndex) => imageIndex !== index))} className="grid h-7 w-7 place-items-center rounded-lg text-[#ffd9d2] hover:bg-white/10" aria-label="Xóa ảnh"><Trash2 size={13} /></button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-4 grid min-h-32 place-items-center rounded-2xl border border-dashed border-[#184d39]/18 bg-[#c7db95]/16 text-center text-[#184d39]/55">
                        <div><ImageUp className="mx-auto" size={24} /><p className="mt-2 text-xs font-bold">Chưa có hình sản phẩm</p></div>
                      </div>
                    )}

                    <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto]">
                      <div className="flex gap-2">
                        <Input value={manualImageUrl} onChange={(event) => setManualImageUrl(event.target.value)} placeholder="Dán URL ảnh https://..." className="h-11 rounded-xl border-[#184d39]/12 bg-[#fffced]" />
                        <Button type="button" variant="outline" onClick={addManualImage} disabled={!manualImageUrl.trim() || galleryImages.length >= 8} className="h-11 rounded-xl border-[#184d39]/12 bg-white px-4 text-[#184d39]">Thêm</Button>
                      </div>
                      <label className={`flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-[#184d39]/22 bg-[#c7db95]/24 px-5 text-sm font-bold text-[#184d39] transition hover:bg-[#c7db95]/40 ${galleryImages.length >= 8 ? "pointer-events-none opacity-50" : ""}`}>
                        <input type="file" accept="image/*" multiple className="sr-only" onChange={(event) => uploadImages(event.target.files)} disabled={uploading || galleryImages.length >= 8} />
                        {uploading ? <Loader2 className="animate-spin" size={17} /> : <ImageUp size={17} />}
                        {uploading ? "Đang tải..." : "Chọn nhiều ảnh"}
                      </label>
                    </div>

                    {galleryImages.length > 1 ? (
                      <div className="mt-4 rounded-2xl border border-[#184d39]/10 bg-[#c7db95]/25 p-3">
                        <Toggle label="Tự động chuyển ảnh mỗi 5 giây" checked={galleryAutoplay} onChange={setGalleryAutoplay} />
                        <p className="mt-2 px-1 text-[11px] leading-5 text-[#184d39]/55">Khách vẫn có thể vuốt trên điện thoại, bấm mũi tên trên desktop hoặc chọn chấm ảnh thủ công. Auto slide sẽ tạm dừng khi khách đang tương tác.</p>
                      </div>
                    ) : null}
                  </section>

                  <section className="rounded-[1.5rem] border border-[#184d39]/10 bg-white/55 p-4 sm:p-5">
                    <div className="mb-4">
                      <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#184d39]/55">04 · Hiển thị</p>
                      <h3 className="mt-1 font-bold text-[#184d39]">Trạng thái sản phẩm</h3>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <Toggle label="Đang bán" checked={itemDraft.is_available} onChange={(value) => setItemDraft({ ...itemDraft, is_available: value })} />
                      <Toggle label="Nổi bật" checked={itemDraft.is_featured} onChange={(value) => setItemDraft({ ...itemDraft, is_featured: value })} />
                      <Field label="Thứ tự">
                        <Input type="number" min="0" max="9999" value={itemDraft.sort_order} onChange={(event) => setItemDraft({ ...itemDraft, sort_order: Number(event.target.value) })} className="h-12 rounded-xl border-[#184d39]/12 bg-[#fffced]" />
                      </Field>
                    </div>
                  </section>
                </div>
              </div>

              <div className="flex gap-2 border-t border-[#184d39]/10 bg-[#fffced]/95 px-5 py-4 backdrop-blur sm:px-7">
                <Button type="button" variant="outline" className="h-11 rounded-xl border-[#184d39]/12 bg-white px-5 text-[#184d39]" onClick={() => setItemEditorOpen(false)}>Hủy</Button>
                <Button disabled={saving || uploading} className="h-11 flex-1 rounded-xl bg-[#184d39] text-[#fffced] hover:bg-[#123e2e]"><Save size={17} /> {saving ? "Đang lưu..." : itemDraft.id ? "Lưu thay đổi" : "Thêm sản phẩm"}</Button>
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
  const nextOrder = () =>
    Math.max(0, ...categories.map((category) => Number(category.sort_order || 0))) + 1;

  const emptyCategoryDraft = () => ({
    name: "",
    description: "",
    sort_order: nextOrder(),
    is_visible: true,
  });

  const [draft, setDraft] = useState(emptyCategoryDraft);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const sortedCategories = useMemo(
    () =>
      [...categories].sort(
        (a, b) =>
          Number(a.sort_order || 0) - Number(b.sort_order || 0) ||
          a.name.localeCompare(b.name, "vi"),
      ),
    [categories],
  );

  const filteredCategories = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("vi");
    if (!needle) return sortedCategories;

    return sortedCategories.filter((category) =>
      `${category.name} ${category.description || ""}`
        .toLocaleLowerCase("vi")
        .includes(needle),
    );
  }, [query, sortedCategories]);

  const visibleCount = categories.filter(
    (category) => category.is_visible !== false,
  ).length;

  const totalItems = categories.reduce(
    (sum, category) => sum + (itemCounts.get(category.id) || 0),
    0,
  );

  function categoryPayload(
    category: Pick<MenuCategory, "name" | "description" | "sort_order" | "is_visible">,
    visibleOverride?: boolean,
  ) {
    return {
      name: category.name,
      description: category.description || "",
      sort_order: Number(category.sort_order || 0),
      is_visible:
        typeof visibleOverride === "boolean"
          ? visibleOverride
          : category.is_visible !== false,
    };
  }

  function openCreate() {
    setEditingId(null);
    setDraft(emptyCategoryDraft());
    setEditorOpen(true);
  }

  function openEdit(category: MenuCategory) {
    setEditingId(category.id);
    setDraft({
      name: category.name,
      description: category.description || "",
      sort_order: Number(category.sort_order || 0),
      is_visible: category.is_visible !== false,
    });
    setEditorOpen(true);
  }

  function closeEditor() {
    if (saving) return;
    setEditorOpen(false);
    setEditingId(null);
    setDraft(emptyCategoryDraft());
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();

    const editing = Boolean(editingId);
    const saved = await mutate(
      "/api/admin/menu",
      {
        method: editing ? "PATCH" : "POST",
        body: JSON.stringify({
          entity: "category",
          id: editingId || undefined,
          data: {
            name: draft.name.trim(),
            description: draft.description.trim(),
            sort_order: Number(draft.sort_order || 0),
            is_visible: Boolean(draft.is_visible),
          },
        }),
      },
      editing ? "Đã cập nhật danh mục." : "Đã thêm danh mục.",
    );

    if (saved) {
      setEditorOpen(false);
      setEditingId(null);
      setDraft(emptyCategoryDraft());
    }
  }

  async function toggleVisibility(category: MenuCategory, value: boolean) {
    await mutate(
      "/api/admin/menu",
      {
        method: "PATCH",
        body: JSON.stringify({
          entity: "category",
          id: category.id,
          data: categoryPayload(category, value),
        }),
      },
      value ? "Đã hiện danh mục." : "Đã ẩn danh mục.",
    );
  }

  return (
    <div className="mt-5" data-category-panel-version="3.5">
      <section className="overflow-hidden rounded-[1.9rem] border border-[#184d39]/10 bg-[#fffced] shadow-[0_18px_55px_rgba(24,77,57,0.055)]">
        <div className="border-b border-[#184d39]/10 px-4 py-5 sm:px-6 lg:px-7">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#c7db95] text-[#184d39]">
                  <Tags size={18} />
                </span>
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#184d39]/50">
                    Cấu trúc thực đơn
                  </p>
                  <h2 className="mt-0.5 text-xl font-extrabold text-[#184d39] sm:text-2xl">
                    Quản lý danh mục
                  </h2>
                </div>
              </div>

              <p className="mt-3 max-w-xl text-sm leading-6 text-[#184d39]/58">
                Nhóm món theo menu thực tế. Bạn có thể sửa tên, mô tả, thứ tự và
                bật hoặc ẩn từng nhóm mà không cần mở trang khác.
              </p>
            </div>

            <Button
              type="button"
              onClick={openCreate}
              disabled={saving}
              className="h-11 w-full rounded-full bg-[#184d39] px-5 font-bold text-[#fffced] shadow-[0_10px_24px_rgba(24,77,57,0.14)] hover:bg-[#123e2e] sm:w-fit"
            >
              <Plus size={17} />
              Thêm danh mục
            </Button>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-[#184d39]/8 bg-[#c7db95]/26 px-4 py-3">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#184d39]/48">
                Tổng danh mục
              </p>
              <div className="mt-1 flex items-baseline gap-2">
                <strong className="text-2xl text-[#184d39]">{categories.length}</strong>
                <span className="text-xs font-semibold text-[#184d39]/48">nhóm món</span>
              </div>
            </div>

            <div className="rounded-2xl border border-[#184d39]/8 bg-[#fffced] px-4 py-3">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#184d39]/48">
                Đang hiển thị
              </p>
              <div className="mt-1 flex items-baseline gap-2">
                <strong className="text-2xl text-[#184d39]">{visibleCount}</strong>
                <span className="text-xs font-semibold text-[#184d39]/48">
                  / {categories.length} danh mục
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-[#184d39]/8 bg-[#fffced] px-4 py-3">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#184d39]/48">
                Món đang quản lý
              </p>
              <div className="mt-1 flex items-baseline gap-2">
                <strong className="text-2xl text-[#184d39]">{totalItems}</strong>
                <span className="text-xs font-semibold text-[#184d39]/48">món</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-b border-[#184d39]/8 bg-[#c7db95]/12 px-4 py-3 sm:px-6 lg:px-7">
          <label className="relative block max-w-xl">
            <Search
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#184d39]/42"
            />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm Coffee, Matcha, Topping..."
              className="h-11 rounded-2xl border-[#184d39]/10 bg-[#fffced] pl-10 text-[#184d39] placeholder:text-[#184d39]/35"
            />
            <span className="sr-only">Tìm danh mục</span>
          </label>
        </div>

        <div className="p-4 sm:p-5 lg:p-6">
          {filteredCategories.length ? (
            <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
              {filteredCategories.map((category, index) => {
                const count = itemCounts.get(category.id) || 0;
                const visible = category.is_visible !== false;

                return (
                  <article
                    key={category.id}
                    className={[
                      "group relative overflow-hidden rounded-[1.45rem] border p-4 transition-all duration-200 sm:p-5",
                      visible
                        ? "border-[#184d39]/10 bg-[#fffced] hover:-translate-y-0.5 hover:border-[#184d39]/20 hover:shadow-[0_14px_35px_rgba(24,77,57,0.07)]"
                        : "border-[#184d39]/8 bg-[#184d39]/[0.035] opacity-75",
                    ].join(" ")}
                  >
                    <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#c7db95]/35 blur-2xl" />

                    <div className="relative flex items-start gap-3">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#c7db95] text-sm font-black text-[#184d39]">
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate text-[15px] font-extrabold text-[#184d39]">
                            {category.name}
                          </h3>
                          <span className="rounded-full border border-[#184d39]/8 bg-white/60 px-2 py-0.5 text-[10px] font-extrabold text-[#184d39]/58">
                            {count} món
                          </span>
                        </div>

                        <p className="mt-1 line-clamp-2 min-h-10 text-xs leading-5 text-[#184d39]/50">
                          {category.description || "Chưa có mô tả cho danh mục này."}
                        </p>
                      </div>
                    </div>

                    <div className="relative mt-4 grid grid-cols-2 gap-2 rounded-2xl bg-[#c7db95]/18 p-3">
                      <div>
                        <p className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-[#184d39]/42">
                          Thứ tự
                        </p>
                        <p className="mt-0.5 text-sm font-extrabold text-[#184d39]">
                          #{category.sort_order}
                        </p>
                      </div>

                      <div>
                        <p className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-[#184d39]/42">
                          Trạng thái
                        </p>
                        <p className="mt-0.5 text-sm font-extrabold text-[#184d39]">
                          {visible ? "Đang hiện" : "Đang ẩn"}
                        </p>
                      </div>
                    </div>

                    <div className="relative mt-4 flex items-center justify-between gap-3 border-t border-[#184d39]/8 pt-4">
                      <label className="flex min-w-0 items-center gap-2 text-xs font-bold text-[#184d39]/60">
                        <Switch
                          checked={visible}
                          disabled={saving}
                          onCheckedChange={(value) => toggleVisibility(category, value)}
                        />
                        <span className="truncate">
                          {visible ? "Hiện trên menu" : "Đang ẩn"}
                        </span>
                      </label>

                      <div className="flex shrink-0 items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          disabled={saving}
                          onClick={() => openEdit(category)}
                          className="h-9 w-9 rounded-xl border-[#184d39]/12 bg-[#fffced] text-[#184d39] shadow-none hover:border-[#184d39]/25 hover:bg-[#c7db95]/28"
                          aria-label={`Sửa ${category.name}`}
                        >
                          <Pencil size={15} />
                        </Button>

                        <div
                          title={
                            count > 0
                              ? "Danh mục đang có món. Hãy chuyển hoặc xóa các món trước khi xóa danh mục."
                              : "Xóa danh mục"
                          }
                        >
                          <DeleteConfirm
                            compact
                            label={category.name}
                            disabled={saving || count > 0}
                            onConfirm={() =>
                              mutate(
                                `/api/admin/menu?entity=category&id=${encodeURIComponent(category.id)}`,
                                { method: "DELETE" },
                                "Đã xóa danh mục.",
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="grid min-h-56 place-items-center rounded-[1.5rem] border border-dashed border-[#184d39]/14 bg-[#c7db95]/12 p-8 text-center">
              <div>
                <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#c7db95] text-[#184d39]">
                  <Search size={19} />
                </span>
                <h3 className="mt-4 font-extrabold text-[#184d39]">
                  Không tìm thấy danh mục
                </h3>
                <p className="mt-1 text-sm text-[#184d39]/50">
                  Thử đổi từ khóa tìm kiếm.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {editorOpen ? (
        <div
          className="fixed inset-0 z-[70]"
          role="dialog"
          aria-modal="true"
          aria-label={editingId ? "Chỉnh sửa danh mục" : "Thêm danh mục"}
        >
          <button
            type="button"
            aria-label="Đóng form danh mục"
            className="absolute inset-0 bg-[#184d39]/45 backdrop-blur-[3px]"
            onClick={closeEditor}
          />

          <div className="absolute inset-y-0 right-0 flex w-full max-w-[32rem] flex-col bg-[#fffced] shadow-[-28px_0_80px_rgba(24,77,57,0.22)]">
            <div className="border-b border-[#184d39]/10 bg-[#c7db95] px-5 py-5 sm:px-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#184d39]/55">
                    Danh mục thực đơn
                  </p>
                  <h2 className="mt-1 text-2xl font-extrabold text-[#184d39]">
                    {editingId ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-[#184d39]/58">
                    {editingId
                      ? "Thay đổi tên, mô tả, thứ tự hoặc trạng thái hiển thị."
                      : "Tạo nhóm món mới khi menu tại tiệm có thêm một loại sản phẩm."}
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  disabled={saving}
                  onClick={closeEditor}
                  className="h-10 w-10 shrink-0 rounded-xl border-[#184d39]/12 bg-[#fffced]/75 text-[#184d39]"
                >
                  <X size={17} />
                </Button>
              </div>
            </div>

            <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
              <div className="admin-scrollbar flex-1 overflow-y-auto px-5 py-6 sm:px-6">
                <div className="grid gap-5">
                  <Field label="Tên danh mục" hint="2–80 ký tự">
                    <Input
                      value={draft.name}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          name: event.target.value,
                        }))
                      }
                      placeholder="Ví dụ: Coffee"
                      className="h-12 rounded-2xl border-[#184d39]/12 bg-white"
                      required
                    />
                  </Field>

                  <Field label="Mô tả" hint="Tối đa 240 ký tự">
                    <Textarea
                      value={draft.description}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          description: event.target.value,
                        }))
                      }
                      placeholder="Mô tả ngắn giúp quản trị dễ nhận biết nhóm món."
                      className="min-h-28 rounded-2xl border-[#184d39]/12 bg-white"
                    />
                  </Field>

                  <Field label="Thứ tự hiển thị" hint="Số nhỏ hiển thị trước">
                    <Input
                      type="number"
                      min="0"
                      max="9999"
                      value={draft.sort_order}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          sort_order: Number(event.target.value || 0),
                        }))
                      }
                      className="h-12 rounded-2xl border-[#184d39]/12 bg-white"
                      required
                    />
                  </Field>

                  <div className="rounded-2xl border border-[#184d39]/10 bg-[#c7db95]/24 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-extrabold text-[#184d39]">
                          Hiển thị trên menu
                        </p>
                        <p className="mt-1 text-xs leading-5 text-[#184d39]/50">
                          Tắt nếu muốn tạm ẩn cả nhóm món khỏi phía khách hàng.
                        </p>
                      </div>

                      <Switch
                        checked={draft.is_visible}
                        onCheckedChange={(value) =>
                          setDraft((current) => ({
                            ...current,
                            is_visible: value,
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 border-t border-[#184d39]/10 bg-[#fffced] px-5 py-4 sm:px-6">
                <Button
                  type="button"
                  variant="outline"
                  disabled={saving}
                  onClick={closeEditor}
                  className="h-11 rounded-xl border-[#184d39]/12 bg-white px-5 text-[#184d39]"
                >
                  Hủy
                </Button>

                <Button
                  disabled={saving}
                  className="h-11 flex-1 rounded-xl bg-[#184d39] font-bold text-[#fffced] hover:bg-[#123e2e]"
                >
                  <Save size={17} />
                  {saving
                    ? "Đang lưu..."
                    : editingId
                      ? "Lưu thay đổi"
                      : "Thêm danh mục"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
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
  const [manualMediaUrl, setManualMediaUrl] = useState("");
  const [manualMediaType, setManualMediaType] = useState<NewsMediaKind>("image");
  const mediaInputRef = useRef<HTMLInputElement | null>(null);

  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("vi");
    return [...items]
      .filter((item) => {
        const cleanContent = cleanNewsContent(item.description);
        if (needle && !`${item.name} ${cleanContent}`.toLocaleLowerCase("vi").includes(needle)) return false;
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
    const payload = {
      ...draft,
      media: draft.media.map(({ type, url }) => ({ type, url })),
      media_autoplay_seconds: draft.media.length > 1 ? draft.media_autoplay_seconds : 0,
    };
    const saved = await mutate(
      "/api/admin/menu",
      { method: editing ? "PATCH" : "POST", body: JSON.stringify({ entity: "news", id: draft.id, data: payload }) },
      editing ? "Đã cập nhật bản tin." : "Đã đăng bản tin mới.",
    );
    if (saved) {
      setDraft(emptyNews());
      setManualMediaUrl("");
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

  function addMedia(itemsToAdd: NewsMediaDraft[]) {
    setDraft((current) => {
      const next = [...current.media];
      for (const item of itemsToAdd) {
        if (next.length >= 12) break;
        if (!next.some((candidate) => candidate.url === item.url)) next.push(item);
      }
      const firstCover = current.image_url || next.find((item) => item.type !== "video")?.url || "";
      return { ...current, media: next, image_url: firstCover };
    });
  }

  async function uploadMedia(files: File[]) {
    if (!files.length) return;
    const room = Math.max(0, 12 - draft.media.length);
    if (!room) {
      setUploadError("Bài viết đã đủ 12 media. Hãy xóa bớt media trước khi thêm mới.");
      return;
    }
    setUploading(true);
    setUploadError("");
    try {
      const uploaded: NewsMediaDraft[] = [];
      for (const file of files.slice(0, room)) {
        uploaded.push(await uploadNewsMediaToCloudinary(file));
      }
      addMedia(uploaded);
      if (uploaded.length) {
        setUploadError("");
      }
    } catch (requestError) {
      setUploadError(requestError instanceof Error ? requestError.message : "Tải media thất bại.");
    } finally {
      setUploading(false);
    }
  }

  function handleMediaInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    // Copy the FileList immediately, then clear the input. Clearing is important in
    // edit mode because it lets the user select the same image again after removing it.
    const files = Array.from(event.currentTarget.files || []);
    event.currentTarget.value = "";
    if (!files.length) return;
    void uploadMedia(files);
  }

  function addManualMedia() {
    const url = manualMediaUrl.trim();
    if (!url || draft.media.length >= 12) return;
    addMedia([{ type: manualMediaType, url }]);
    setManualMediaUrl("");
  }

  function removeMedia(index: number) {
    setDraft((current) => {
      const removed = current.media[index];
      const media = current.media.filter((_, mediaIndex) => mediaIndex !== index);
      const nextCover = removed?.url === current.image_url ? media.find((item) => item.type !== "video")?.url || "" : current.image_url;
      return { ...current, media, image_url: nextCover, media_autoplay_seconds: media.length > 1 ? current.media_autoplay_seconds : 0 };
    });
  }

  function moveMedia(index: number, direction: -1 | 1) {
    setDraft((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.media.length) return current;
      const media = [...current.media];
      [media[index], media[target]] = [media[target], media[index]];
      return { ...current, media };
    });
  }

  function openCreate() {
    setDraft(emptyNews());
    setUploadError("");
    setManualMediaUrl("");
    setEditorOpen(true);
  }

  function edit(item: MenuItem) {
    const meta = parseNewsMeta(item);
    setDraft({
      id: item.id,
      title: item.name,
      content: meta.content,
      image_url: item.image_url,
      media: meta.media,
      media_autoplay_seconds: meta.autoplaySeconds,
      is_featured: item.is_featured,
      is_published: item.is_available,
      sort_order: item.sort_order,
    });
    setUploadError("");
    setManualMediaUrl("");
    setEditorOpen(true);
  }

  function closeEditor() {
    if (saving || uploading) return;
    setEditorOpen(false);
    setDraft(emptyNews());
    setManualMediaUrl("");
    setUploadError("");
  }

  function adminDate(value?: string) {
    if (!value) return "Chưa có ngày";
    return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(value));
  }

  return (
    <div className="mt-5">
      <section className="overflow-hidden rounded-[1.8rem] border border-[#184d39]/12 bg-[#fffced] shadow-[0_16px_50px_rgba(24,77,57,0.055)]">
        <div className="flex flex-col gap-4 border-b border-[#184d39]/10 p-5 sm:p-6 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-[#184d39]">Quản lý bản tin</h2>
              <span className="rounded-full bg-[#c7db95] px-2.5 py-1 text-xs font-extrabold text-[#184d39]">{items.length} bài</span>
            </div>
            <p className="mt-1 text-sm text-[#184d39]/60">Mỗi bài có thể có tối đa 12 ảnh, GIF hoặc video. Ảnh bìa vẫn dùng cho trang chủ và danh sách bài.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/news" target="_blank" className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#184d39]/12 bg-white px-4 text-sm font-bold text-[#184d39] transition hover:bg-[#c7db95]/20">
              <Eye size={16} /> Xem trang Bản tin
            </Link>
            <Button type="button" onClick={openCreate} className="h-10 rounded-xl bg-[#184d39] px-4 text-[#fffced] hover:bg-[#123e2e]">
              <Plus size={16} /> Viết bài mới
            </Button>
          </div>
        </div>

        <div className="grid gap-3 border-b border-[#184d39]/10 bg-[#c7db95]/16 p-4 sm:grid-cols-3 sm:p-5">
          <div className="rounded-2xl border border-[#184d39]/10 bg-[#fffced] px-4 py-3"><p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#184d39]/50">Đang hiển thị</p><p className="mt-1 text-2xl font-extrabold text-[#184d39]">{publishedCount}</p></div>
          <div className="rounded-2xl border border-[#184d39]/10 bg-[#c7db95]/45 px-4 py-3"><p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#184d39]/55">Nổi bật trang chủ</p><p className="mt-1 text-2xl font-extrabold text-[#184d39]">{featuredCount}</p></div>
          <div className="rounded-2xl border border-[#184d39]/10 bg-[#fffced] px-4 py-3"><p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#184d39]/50">Bản nháp</p><p className="mt-1 text-2xl font-extrabold text-[#184d39]">{draftCount}</p></div>
        </div>

        <div className="flex flex-col gap-3 border-b border-[#184d39]/10 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#184d39]/45" />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm theo tiêu đề hoặc nội dung..." className="h-11 rounded-xl border-[#184d39]/12 bg-white pl-10" />
          </div>
          <div className="admin-scrollbar flex gap-2 overflow-x-auto pb-1 lg:pb-0">
            {([ ["all", "Tất cả"], ["published", "Đang hiện"], ["featured", "Nổi bật"], ["draft", "Bản nháp"] ] as Array<[NewsFilter, string]>).map(([value, label]) => (
              <button key={value} type="button" onClick={() => setFilter(value)} className={`h-10 shrink-0 rounded-xl px-3.5 text-xs font-extrabold transition ${filter === value ? "bg-[#184d39] text-[#fffced]" : "border border-[#184d39]/12 bg-[#fffced] text-[#184d39]/65 hover:bg-[#c7db95]/22"}`}>{label}</button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-[#184d39]/10">
          {filtered.length ? filtered.map((item) => {
            const meta = parseNewsMeta(item);
            const videoCount = meta.media.filter((media) => media.type === "video").length;
            const gifCount = meta.media.filter((media) => media.type === "gif").length;
            return (
              <article key={item.id} className="grid gap-4 p-4 transition hover:bg-[#c7db95]/10 sm:p-5 md:grid-cols-[9rem_minmax(0,1fr)] xl:grid-cols-[10rem_minmax(0,1fr)_auto] xl:items-center">
                <button type="button" onClick={() => edit(item)} className="group relative h-28 overflow-hidden rounded-2xl border border-[#184d39]/12 bg-[#c7db95]/28 text-left md:h-24 xl:h-24">
                  {item.image_url ? <img src={item.image_url} alt={item.name} loading="lazy" className="h-full w-full object-contain transition duration-300 group-hover:scale-[1.02]" /> : meta.media[0]?.type === "video" ? <><video src={meta.media[0].url} muted playsInline preload="metadata" className="h-full w-full object-cover" /><span className="absolute inset-0 grid place-items-center bg-[#184d39]/15 text-white"><Film size={22} /></span></> : <div className="soft-grid grid h-full place-items-center text-[#184d39]/55"><Newspaper size={22} /></div>}
                  {meta.media.length > 1 ? <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-full bg-[#184d39]/88 px-2 py-1 text-[9px] font-bold text-white"><Images size={11} /> {meta.media.length}</span> : null}
                </button>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.08em] ${item.is_available ? "bg-[#c7db95]/55 text-[#184d39]" : "bg-[#184d39]/7 text-[#184d39]/55"}`}>{item.is_available ? "Đang hiển thị" : "Bản nháp"}</span>
                    {item.is_featured ? <span className="inline-flex items-center gap-1 rounded-full bg-[#fff3c8] px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.08em] text-[#87671e]"><Sparkles size={11} /> Nổi bật</span> : null}
                    {meta.media.length ? <span className="inline-flex items-center gap-1 rounded-full border border-[#184d39]/10 bg-white px-2.5 py-1 text-[9px] font-bold text-[#184d39]/60"><Images size={11} /> {meta.media.length} media</span> : null}
                    {videoCount ? <span className="inline-flex items-center gap-1 rounded-full bg-[#184d39] px-2.5 py-1 text-[9px] font-bold text-[#fffced]"><Film size={10} /> {videoCount} video</span> : null}
                    {gifCount ? <span className="rounded-full bg-[#c7db95] px-2.5 py-1 text-[9px] font-bold text-[#184d39]">{gifCount} GIF</span> : null}
                    <span className="text-[10px] font-semibold text-[#184d39]/42">{adminDate(item.created_at)}</span>
                  </div>
                  <h3 className="mt-2 line-clamp-1 text-base font-extrabold text-[#184d39] sm:text-lg">{item.name}</h3>
                  <p className="mt-1 line-clamp-2 text-sm leading-6 text-[#184d39]/58">{meta.content || "Chưa có nội dung."}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2 xl:hidden">
                    {item.is_available ? <Link href={`/news/${item.id}`} target="_blank" className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-[#184d39]/12 bg-white px-3 text-xs font-bold text-[#184d39]"><Eye size={14} /> Xem bài</Link> : null}
                    <Button type="button" variant="outline" className="h-9 rounded-xl border-[#184d39]/12 bg-white px-3 text-xs" onClick={() => edit(item)}><Pencil size={14} /> Sửa</Button>
                  </div>
                </div>

                <div className="col-span-full flex flex-wrap items-center gap-2 border-t border-dashed border-[#184d39]/12 pt-3 md:col-start-2 xl:col-auto xl:border-0 xl:pt-0">
                  <button type="button" disabled={saving} onClick={() => quickUpdate(item, { is_featured: !item.is_featured }, item.is_featured ? "Đã bỏ bài khỏi mục nổi bật trang chủ." : "Đã đưa bài lên mục nổi bật trang chủ.")} className={`inline-flex h-10 items-center gap-2 rounded-xl border px-3 text-xs font-extrabold transition ${item.is_featured ? "border-[#d8c77f] bg-[#fff5cf] text-[#7d611d]" : "border-[#184d39]/12 bg-white text-[#184d39]/65 hover:bg-[#c7db95]/20"}`}><Sparkles size={14} /> {item.is_featured ? "Đang nổi bật" : "Đưa lên nổi bật"}</button>
                  <label className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#184d39]/12 bg-white px-3 text-xs font-bold text-[#184d39]/65"><Switch checked={item.is_available} disabled={saving} onCheckedChange={(value) => quickUpdate(item, { is_published: value }, value ? "Đã hiển thị bản tin." : "Đã chuyển bản tin thành bản nháp.")} />{item.is_available ? "Đang hiện" : "Đang ẩn"}</label>
                  <Button type="button" variant="outline" size="icon" className="hidden h-10 w-10 rounded-xl border-[#184d39]/12 bg-white xl:inline-flex" onClick={() => edit(item)} aria-label={`Sửa ${item.name}`}><Pencil size={15} /></Button>
                  <DeleteConfirm compact label={item.name} disabled={saving} onConfirm={() => mutate(`/api/admin/menu?entity=news&id=${encodeURIComponent(item.id)}`, { method: "DELETE" }, "Đã xóa bản tin.")} />
                </div>
              </article>
            );
          }) : <div className="grid min-h-72 place-items-center p-8 text-center"><div><span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#c7db95]/55 text-[#184d39]"><Newspaper size={23} /></span><p className="mt-4 font-bold text-[#184d39]">Không tìm thấy bản tin phù hợp</p><p className="mt-1 text-sm text-[#184d39]/55">Thử đổi bộ lọc hoặc tạo một bài viết mới.</p><Button type="button" onClick={openCreate} className="mt-4 h-10 rounded-xl bg-[#184d39]"><Plus size={15} /> Viết bài mới</Button></div></div>}
        </div>
      </section>

      {editorOpen ? (
        <div className="fixed inset-0 z-[120]">
          <button type="button" aria-label="Đóng trình biên tập" className="absolute inset-0 bg-[#102d23]/48 backdrop-blur-[2px]" onClick={closeEditor} />
          <aside className="absolute inset-y-0 right-0 flex w-full max-w-[46rem] flex-col border-l border-[#184d39]/12 bg-[#fffced] shadow-[-24px_0_70px_rgba(24,56,44,0.18)]">
            <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
              <header className="flex shrink-0 items-center justify-between gap-4 border-b border-[#184d39]/10 bg-[#fffced] px-4 py-4 sm:px-6">
                <div><p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#184d39]/55">Biên tập Bản tin</p><h2 className="mt-1 text-xl font-bold text-[#184d39]">{draft.id ? "Chỉnh sửa bài viết" : "Viết bài mới"}</h2></div>
                <Button type="button" variant="outline" size="icon" onClick={closeEditor} disabled={saving || uploading} className="h-10 w-10 rounded-xl border-[#184d39]/12 bg-white"><X size={17} /></Button>
              </header>

              <div className="admin-scrollbar min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
                <div className="grid gap-5">
                  <section className="rounded-[1.5rem] border border-[#184d39]/10 bg-white/60 p-4 sm:p-5">
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#184d39]/50">01 · Nội dung</p>
                    <div className="mt-4 grid gap-5">
                      <Field label="Tiêu đề" hint={`${draft.title.length}/180`}><Input value={draft.title} maxLength={180} onChange={(event) => setDraft({ ...draft, title: event.target.value })} className="h-12 rounded-xl border-[#184d39]/12 bg-[#fffced]" placeholder="Ví dụ: Một mẻ bánh mới bắt đầu như thế nào?" required /></Field>
                      <Field label="Nội dung" hint={`${draft.content.length}/12000`}><Textarea value={draft.content} maxLength={12000} onChange={(event) => setDraft({ ...draft, content: event.target.value })} className="min-h-[18rem] resize-y rounded-xl border-[#184d39]/12 bg-[#fffced] p-4 leading-7" placeholder="Viết nội dung bài ở đây. Có thể xuống dòng để chia đoạn..." required /></Field>
                    </div>
                  </section>

                  <section className="rounded-[1.5rem] border border-[#184d39]/10 bg-[#c7db95]/18 p-4 sm:p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div><p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#184d39]/55">02 · Media</p><h3 className="mt-1 font-bold text-[#184d39]">Ảnh · GIF · Video</h3><p className="mt-1 text-xs leading-5 text-[#184d39]/55">Tối đa 12 media. Ảnh/GIF tối đa 20MB, video tối đa 80MB.</p></div>
                      <span className="rounded-full bg-[#184d39] px-3 py-1.5 text-[10px] font-bold text-[#fffced]">{draft.media.length}/12</span>
                    </div>

                    {draft.media.length ? (
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        {draft.media.map((media, index) => (
                          <div key={`${media.type}-${media.url}`} className={`relative overflow-hidden rounded-2xl border-2 bg-[#fffced] ${draft.image_url === media.url ? "border-[#184d39]" : "border-[#184d39]/10"}`}>
                            <div className="relative flex aspect-[16/10] items-center justify-center overflow-hidden bg-[#184d39]/[0.045]">
                              {media.type === "video" ? <><video src={media.url} muted playsInline preload="metadata" className="h-full w-full object-contain" /><span className="absolute inset-0 grid place-items-center bg-[#184d39]/8 text-[#184d39]"><Film size={28} /></span></> : <img src={media.url} alt={`Media ${index + 1}`} className="h-full w-full object-contain" />}
                              <span className="absolute left-2 top-2 rounded-full bg-[#184d39]/88 px-2 py-1 text-[9px] font-extrabold uppercase text-white">{media.type === "video" ? "Video" : media.type === "gif" ? "GIF" : `Ảnh ${index + 1}`}</span>
                              {draft.image_url === media.url ? <span className="absolute right-2 top-2 rounded-full bg-[#c7db95] px-2 py-1 text-[9px] font-extrabold text-[#184d39]">Ảnh bìa</span> : null}
                            </div>
                            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#184d39]/10 p-2.5">
                              <div className="flex gap-1">
                                <button type="button" disabled={index === 0} onClick={() => moveMedia(index, -1)} className="grid h-8 w-8 place-items-center rounded-lg border border-[#184d39]/10 bg-white text-[#184d39] disabled:opacity-30"><ChevronLeft size={14} /></button>
                                <button type="button" disabled={index === draft.media.length - 1} onClick={() => moveMedia(index, 1)} className="grid h-8 w-8 place-items-center rounded-lg border border-[#184d39]/10 bg-white text-[#184d39] disabled:opacity-30"><ChevronRight size={14} /></button>
                              </div>
                              <div className="flex gap-1">
                                {media.type !== "video" && draft.image_url !== media.url ? <button type="button" onClick={() => setDraft((current) => ({ ...current, image_url: media.url }))} className="h-8 rounded-lg border border-[#184d39]/10 bg-[#c7db95]/30 px-2.5 text-[10px] font-bold text-[#184d39]">Đặt bìa</button> : null}
                                <button type="button" onClick={() => removeMedia(index)} className="grid h-8 w-8 place-items-center rounded-lg border border-red-200 bg-white text-red-600"><Trash2 size={14} /></button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : <div className="mt-4 grid min-h-36 place-items-center rounded-2xl border border-dashed border-[#184d39]/18 bg-[#fffced]/70 text-center text-[#184d39]/55"><div><Images className="mx-auto" size={25} /><p className="mt-2 text-xs font-bold">Chưa có media cho bài viết</p></div></div>}

                    <div className="mt-4 grid gap-2 lg:grid-cols-[1fr_auto]">
                      <div className="grid gap-2 sm:grid-cols-[7rem_1fr_auto]">
                        <select value={manualMediaType} onChange={(event) => setManualMediaType(event.target.value as NewsMediaKind)} className="h-11 rounded-xl border border-[#184d39]/12 bg-[#fffced] px-3 text-sm font-semibold text-[#184d39] outline-none"><option value="image">Ảnh</option><option value="gif">GIF</option><option value="video">Video</option></select>
                        <Input value={manualMediaUrl} onChange={(event) => setManualMediaUrl(event.target.value)} placeholder="Dán URL media https://..." className="h-11 rounded-xl border-[#184d39]/12 bg-[#fffced]" />
                        <Button type="button" variant="outline" onClick={addManualMedia} disabled={!manualMediaUrl.trim() || draft.media.length >= 12} className="h-11 rounded-xl border-[#184d39]/12 bg-white px-4 text-[#184d39]">Thêm</Button>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                        <input
                          ref={mediaInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
                          multiple
                          className="sr-only"
                          onChange={handleMediaInputChange}
                          disabled={uploading || draft.media.length >= 12}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => mediaInputRef.current?.click()}
                          disabled={uploading || draft.media.length >= 12}
                          className="h-11 rounded-xl border-dashed border-[#184d39]/22 bg-[#fffced] px-5 font-bold text-[#184d39] hover:bg-white"
                        >
                          {uploading ? <Loader2 className="animate-spin" size={17} /> : <ImageUp size={17} />}
                          {uploading ? "Đang tải media..." : draft.id ? "Thêm ảnh / GIF / video" : "Chọn nhiều file"}
                        </Button>
                        {draft.id ? <p className="text-center text-[10px] font-medium leading-4 text-[#184d39]/50">Có thể thêm media mới khi đang sửa bài. Media cũ vẫn được giữ nguyên.</p> : null}
                      </div>
                    </div>

                    {uploadError ? <p className="mt-3 rounded-xl border border-red-100 bg-red-50 p-3 text-sm font-semibold text-red-700">{uploadError}</p> : null}

                    {draft.media.length > 1 ? (
                      <div className="mt-4 flex items-center justify-between gap-4 rounded-2xl border border-[#184d39]/10 bg-[#fffced]/75 p-4">
                        <div><p className="text-sm font-extrabold text-[#184d39]">Tự động chuyển media</p><p className="mt-1 text-xs leading-5 text-[#184d39]/55">Ảnh/GIF sẽ tự chuyển sau 5 giây. Khi đang xem video, slideshow sẽ tạm dừng.</p></div>
                        <Switch checked={draft.media_autoplay_seconds === 5} onCheckedChange={(value) => setDraft({ ...draft, media_autoplay_seconds: value ? 5 : 0 })} />
                      </div>
                    ) : null}
                  </section>

                  <section className="rounded-[1.5rem] border border-[#184d39]/10 bg-white/60 p-4 sm:p-5">
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#184d39]/50">03 · Hiển thị</p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-[#184d39]/10 bg-[#fffced] p-4"><div className="flex items-center justify-between gap-4"><div><p className="text-sm font-extrabold text-[#184d39]">Hiển thị trên web</p><p className="mt-1 text-xs leading-5 text-[#184d39]/52">Tắt để lưu bài thành bản nháp.</p></div><Switch checked={draft.is_published} onCheckedChange={(value) => setDraft({ ...draft, is_published: value })} /></div></div>
                      <div className={`rounded-2xl border p-4 ${draft.is_featured ? "border-[#184d39]/20 bg-[#c7db95]/45" : "border-[#184d39]/10 bg-[#fffced]"}`}><div className="flex items-center justify-between gap-4"><div><p className="flex items-center gap-1.5 text-sm font-extrabold text-[#184d39]"><Sparkles size={14} /> Nổi bật</p><p className="mt-1 text-xs leading-5 text-[#184d39]/52">Bật để bài xuất hiện trên trang chủ.</p></div><Switch checked={draft.is_featured} onCheckedChange={(value) => setDraft({ ...draft, is_featured: value })} /></div></div>
                    </div>
                    <div className="mt-4"><Field label="Thứ tự ưu tiên" hint="Số nhỏ hiển thị trước khi cùng mức ưu tiên"><Input type="number" min="0" max="9999" value={draft.sort_order} onChange={(event) => setDraft({ ...draft, sort_order: Number(event.target.value) })} className="h-11 rounded-xl border-[#184d39]/12 bg-[#fffced]" /></Field></div>
                  </section>
                </div>
              </div>

              <footer className="shrink-0 border-t border-[#184d39]/10 bg-[#fffced]/95 p-4 backdrop-blur sm:px-6"><div className="flex gap-2"><Button type="submit" disabled={saving || uploading} className="h-12 flex-1 rounded-xl bg-[#184d39] text-[#fffced] hover:bg-[#123e2e]">{saving ? <Loader2 className="animate-spin" size={17} /> : <Save size={17} />}{saving ? "Đang lưu…" : draft.id ? "Lưu thay đổi" : "Đăng bản tin"}</Button><Button type="button" variant="outline" onClick={closeEditor} disabled={saving || uploading} className="h-12 rounded-xl border-[#184d39]/12 bg-white px-5">Hủy</Button></div></footer>
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
