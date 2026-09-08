"use client";

import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Film,
  ImageUp,
  Leaf,
  Loader2,
  Plus,
  Save,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  DEFAULT_ABOUT_PAGE_CONTENT,
  normalizeAboutPageContent,
  type AboutGalleryItem,
  type AboutMedia,
  type AboutPageContent,
} from "@/lib/about-page-types";

type Tab = "hero" | "story" | "highlights" | "gallery" | "quote";
type ToastState = { kind: "success" | "error" | "info"; title: string; text: string } | null;

type ApiResponse = {
  content?: AboutPageContent;
  setupRequired?: boolean;
  warning?: string;
  error?: string;
};

async function request(url: string, init?: RequestInit) {
  const response = await fetch(url, {
    ...init,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
  const body = (await response.json().catch(() => ({}))) as ApiResponse;
  if (!response.ok) throw new Error(body.error || "Không thể xử lý yêu cầu.");
  return body;
}

async function uploadAboutMedia(file: File): Promise<AboutMedia> {
  const isVideo = file.type.startsWith("video/");
  const isImage = file.type.startsWith("image/");
  if (!isVideo && !isImage) throw new Error("Chỉ hỗ trợ ảnh, GIF hoặc video.");

  const limit = isVideo ? 80 * 1024 * 1024 : 20 * 1024 * 1024;
  if (file.size > limit) {
    throw new Error(isVideo ? "Video phải nhỏ hơn 80MB." : "Ảnh/GIF phải nhỏ hơn 20MB.");
  }

  const signedResponse = await fetch("/api/admin/upload-signature", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  const signed = (await signedResponse.json().catch(() => ({}))) as {
    cloudName?: string;
    apiKey?: string;
    folder?: string;
    timestamp?: number;
    signature?: string;
    error?: string;
  };

  if (!signedResponse.ok) throw new Error(signed.error || "Không thể tạo chữ ký upload.");
  if (!signed.cloudName || !signed.apiKey || !signed.folder || !signed.timestamp || !signed.signature) {
    throw new Error("Thiếu cấu hình Cloudinary.");
  }

  const form = new FormData();
  form.append("file", file);
  form.append("api_key", signed.apiKey);
  form.append("folder", signed.folder);
  form.append("timestamp", String(signed.timestamp));
  form.append("signature", signed.signature);

  const resourceType = isVideo ? "video" : "image";
  const uploadResponse = await fetch(
    `https://api.cloudinary.com/v1_1/${signed.cloudName}/${resourceType}/upload`,
    { method: "POST", body: form },
  );
  const uploaded = (await uploadResponse.json().catch(() => ({}))) as {
    secure_url?: string;
    format?: string;
    error?: { message?: string };
  };

  if (!uploadResponse.ok || !uploaded.secure_url) {
    throw new Error(uploaded.error?.message || "Tải media thất bại.");
  }

  return {
    type: isVideo
      ? "video"
      : file.type === "image/gif" || uploaded.format?.toLowerCase() === "gif"
        ? "gif"
        : "image",
    url: uploaded.secure_url,
    alt: file.name.replace(/\.[^.]+$/, ""),
  };
}

function cloneContent(value: AboutPageContent) {
  return normalizeAboutPageContent(JSON.parse(JSON.stringify(value)));
}

function SectionCard({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <section className="overflow-hidden rounded-[1.55rem] border border-[#184d39]/9 bg-[#fffced] shadow-[0_12px_34px_rgba(24,77,57,.045)]">
      <div className="border-b border-[#184d39]/8 bg-[#c7db95]/18 px-4 py-4 sm:px-5">
        <h3 className="text-sm font-extrabold text-[#184d39]">{title}</h3>
        {note ? <p className="mt-1 text-xs leading-5 text-[#184d39]/48">{note}</p> : null}
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="grid gap-2 text-xs font-extrabold text-[#184d39]">
      <span className="flex items-center justify-between gap-3">
        <span>{label}</span>
        {hint ? <span className="text-[10px] font-medium text-[#184d39]/40">{hint}</span> : null}
      </span>
      {children}
    </label>
  );
}

function MediaField({
  label,
  media,
  onChange,
  onUploadState,
}: {
  label: string;
  media: AboutMedia;
  onChange: (next: AboutMedia) => void;
  onUploadState: (value: boolean) => void;
}) {
  const [uploading, setUploading] = useState(false);

  async function upload(file?: File) {
    if (!file) return;
    setUploading(true);
    onUploadState(true);
    try {
      const next = await uploadAboutMedia(file);
      onChange({ ...next, alt: media.alt || next.alt });
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Tải media thất bại.");
    } finally {
      setUploading(false);
      onUploadState(false);
    }
  }

  return (
    <div className="grid gap-3 rounded-[1.3rem] border border-[#184d39]/8 bg-white/55 p-3.5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-extrabold text-[#184d39]">{label}</p>
          <p className="mt-0.5 text-[10px] text-[#184d39]/42">Ảnh, GIF hoặc video</p>
        </div>
        <span className="rounded-full bg-[#fde8ef] px-2 py-1 text-[9px] font-extrabold uppercase text-[#a85675]">
          {media.type}
        </span>
      </div>

      <div className="relative aspect-[16/9] overflow-hidden rounded-[1rem] border border-[#184d39]/8 bg-[#c7db95]/14">
        {media.type === "video" ? (
          <video src={media.url} muted loop autoPlay playsInline className="h-full w-full object-cover" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={media.url} alt={media.alt} className="h-full w-full object-cover" />
        )}
      </div>

      <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
        <Input
          value={media.url}
          onChange={(event) => onChange({ ...media, url: event.target.value })}
          placeholder="https://... hoặc /images/..."
          className="h-10 rounded-xl border-[#184d39]/10 bg-[#fffced] text-xs"
        />
        <label className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-[#184d39]/18 bg-[#c7db95]/22 px-3 text-[10px] font-extrabold text-[#184d39] transition hover:bg-[#c7db95]/35">
          {uploading ? <Loader2 size={14} className="animate-spin" /> : <ImageUp size={14} />}
          {uploading ? "Đang tải..." : "Thay media"}
          <input
            type="file"
            accept="image/*,video/*"
            className="sr-only"
            disabled={uploading}
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.currentTarget.value = "";
              void upload(file);
            }}
          />
        </label>
      </div>

      <Input
        value={media.alt}
        onChange={(event) => onChange({ ...media, alt: event.target.value })}
        placeholder="Mô tả media / alt text"
        className="h-10 rounded-xl border-[#184d39]/10 bg-[#fffced] text-xs"
      />
    </div>
  );
}

export function AboutPagePanel() {
  const [content, setContent] = useState<AboutPageContent>(cloneContent(DEFAULT_ABOUT_PAGE_CONTENT));
  const [baseline, setBaseline] = useState("");
  const [tab, setTab] = useState<Tab>("hero");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [setupRequired, setSetupRequired] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const [lastSaved, setLastSaved] = useState("");

  const dirty = useMemo(() => JSON.stringify(content) !== baseline, [content, baseline]);

  useEffect(() => {
    let active = true;
    void request("/api/admin/about-page")
      .then((body) => {
        if (!active) return;
        const next = normalizeAboutPageContent(body.content || DEFAULT_ABOUT_PAGE_CONTENT);
        setContent(next);
        setBaseline(JSON.stringify(next));
        setSetupRequired(Boolean(body.setupRequired));
        if (body.warning) {
          setToast({ kind: "info", title: "Cần thiết lập Supabase", text: body.warning });
        }
      })
      .catch((error) => {
        if (!active) return;
        setToast({ kind: "error", title: "Không tải được dữ liệu", text: error instanceof Error ? error.message : "Đã có lỗi xảy ra." });
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), toast.kind === "error" ? 6500 : 4200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  async function save() {
    if (!dirty || saving || uploading) return;
    setSaving(true);
    try {
      const body = await request("/api/admin/about-page", {
        method: "PUT",
        body: JSON.stringify({ content }),
      });
      const next = normalizeAboutPageContent(body.content || content);
      setContent(next);
      setBaseline(JSON.stringify(next));
      setSetupRequired(false);
      setLastSaved(
        new Intl.DateTimeFormat("vi-VN", { hour: "2-digit", minute: "2-digit" }).format(new Date()),
      );
      setToast({
        kind: "success",
        title: "Lưu trang Giới thiệu thành công",
        text: "Nội dung và media mới đã được cập nhật trên website.",
      });
    } catch (error) {
      setToast({
        kind: "error",
        title: "Lưu chưa thành công",
        text: error instanceof Error ? error.message : "Đã có lỗi xảy ra.",
      });
    } finally {
      setSaving(false);
    }
  }

  function updateHero(patch: Partial<AboutPageContent["hero"]>) {
    setContent((current) => ({ ...current, hero: { ...current.hero, ...patch } }));
  }

  function updateStory(patch: Partial<AboutPageContent["story"]>) {
    setContent((current) => ({ ...current, story: { ...current.story, ...patch } }));
  }

  function updateGallery(patch: Partial<AboutPageContent["gallery"]>) {
    setContent((current) => ({ ...current, gallery: { ...current.gallery, ...patch } }));
  }

  function updateQuote(patch: Partial<AboutPageContent["quote"]>) {
    setContent((current) => ({ ...current, quote: { ...current.quote, ...patch } }));
  }

  function updateGalleryItem(index: number, patch: Partial<AboutGalleryItem>) {
    setContent((current) => ({
      ...current,
      gallery: {
        ...current.gallery,
        items: current.gallery.items.map((item, itemIndex) =>
          itemIndex === index ? { ...item, ...patch } : item,
        ),
      },
    }));
  }

  function moveGallery(index: number, direction: -1 | 1) {
    setContent((current) => {
      const items = [...current.gallery.items];
      const target = index + direction;
      if (target < 0 || target >= items.length) return current;
      [items[index], items[target]] = [items[target], items[index]];
      return { ...current, gallery: { ...current.gallery, items } };
    });
  }

  function removeGallery(index: number) {
    setContent((current) => ({
      ...current,
      gallery: {
        ...current.gallery,
        items: current.gallery.items.filter((_, itemIndex) => itemIndex !== index),
      },
    }));
  }

  function addGallery() {
    if (content.gallery.items.length >= 8) return;
    setContent((current) => ({
      ...current,
      gallery: {
        ...current.gallery,
        items: [
          ...current.gallery.items,
          {
            id: `about-gallery-${Date.now()}`,
            caption: "Góc mới Sweet Pea",
            media: {
              type: "image",
              url: "/images/about/sweet-pea-garden-view.webp",
              alt: "Không gian Sweet Pea",
            },
          },
        ],
      },
    }));
  }

  const tabs: Array<{ id: Tab; label: string }> = [
    { id: "hero", label: "Mở đầu" },
    { id: "story", label: "Câu chuyện" },
    { id: "highlights", label: "Điểm nổi bật" },
    { id: "gallery", label: "Thư viện" },
    { id: "quote", label: "Thông điệp" },
  ];

  if (loading) {
    return (
      <div className="mt-5 grid min-h-72 place-items-center rounded-[1.8rem] border border-[#184d39]/9 bg-[#fffced]">
        <div className="text-center text-[#184d39]/55">
          <Loader2 className="mx-auto animate-spin" size={22} />
          <p className="mt-3 text-sm font-bold">Đang tải trang Giới thiệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-5" data-about-admin-version="4.8">
      <section className="overflow-hidden rounded-[1.8rem] border border-[#184d39]/9 bg-[#fffced] shadow-[0_16px_48px_rgba(24,77,57,.05)]">
        <header className="border-b border-[#184d39]/8 bg-[linear-gradient(135deg,rgba(199,219,149,.36),rgba(253,232,239,.48),rgba(255,252,237,.92))] px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#c7db95] text-[#184d39] shadow-sm">
                  <Leaf size={19} />
                </span>
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.17em] text-[#184d39]/45">Website · Giới thiệu</p>
                  <h2 className="mt-0.5 text-xl font-extrabold text-[#184d39] sm:text-2xl">Nội dung & hình ảnh trang Giới thiệu</h2>
                </div>
              </div>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#184d39]/55">
                Chỉnh nội dung, thay ảnh/GIF/video và sắp xếp thư viện mà không cần sửa code.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className={`rounded-full px-3 py-2 text-[10px] font-extrabold ${dirty ? "bg-[#fde8ef] text-[#a85675]" : "bg-[#c7db95]/55 text-[#184d39]"}`}>
                {uploading ? "Đang tải media" : saving ? "Đang lưu" : dirty ? "Có thay đổi chưa lưu" : "Đã lưu"}
              </span>
              <Button
                type="button"
                disabled={!dirty || saving || uploading || setupRequired}
                onClick={() => void save()}
                className="h-10 rounded-xl bg-[#184d39] px-4 text-[#fffced] hover:bg-[#123e2e]"
              >
                {saving ? <Loader2 className="animate-spin" size={15} /> : <Save size={15} />}
                Lưu trang
              </Button>
            </div>
          </div>

          {setupRequired ? (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold leading-5 text-amber-800">
              Cần chạy <code>supabase/ABOUT-PAGE-V4.8.sql</code> trong Supabase SQL Editor trước khi lưu.
            </div>
          ) : null}
        </header>

        <div className="border-b border-[#184d39]/8 px-4 py-3 sm:px-5">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {tabs.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`shrink-0 rounded-full px-3.5 py-2 text-[10px] font-extrabold transition ${
                  tab === item.id
                    ? "bg-[#184d39] text-[#fffced]"
                    : "border border-[#184d39]/9 bg-white/55 text-[#184d39]/58 hover:bg-[#c7db95]/20"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 sm:p-5 lg:p-6">
          {tab === "hero" ? (
            <div className="grid gap-4 xl:grid-cols-[1fr_.85fr]">
              <SectionCard title="Nội dung mở đầu" note="Phần đầu tiên khách nhìn thấy khi vào trang Giới thiệu.">
                <div className="grid gap-4">
                  <Field label="Nhãn nhỏ"><Input value={content.hero.eyebrow} onChange={(e) => updateHero({ eyebrow: e.target.value })} className="h-10 rounded-xl border-[#184d39]/10 bg-white" /></Field>
                  <Field label="Tiêu đề chính"><Input value={content.hero.title} onChange={(e) => updateHero({ title: e.target.value })} className="h-10 rounded-xl border-[#184d39]/10 bg-white" /></Field>
                  <Field label="Dòng nhấn"><Input value={content.hero.accent} onChange={(e) => updateHero({ accent: e.target.value })} className="h-10 rounded-xl border-[#184d39]/10 bg-white" /></Field>
                  <Field label="Mô tả"><Textarea value={content.hero.description} onChange={(e) => updateHero({ description: e.target.value })} className="min-h-28 rounded-xl border-[#184d39]/10 bg-white" /></Field>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Nút chính"><Input value={content.hero.primary_label} onChange={(e) => updateHero({ primary_label: e.target.value })} className="h-10 rounded-xl border-[#184d39]/10 bg-white" /></Field>
                    <Field label="Nút phụ"><Input value={content.hero.secondary_label} onChange={(e) => updateHero({ secondary_label: e.target.value })} className="h-10 rounded-xl border-[#184d39]/10 bg-white" /></Field>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Nhãn sticker"><Input value={content.hero.badge_title} onChange={(e) => updateHero({ badge_title: e.target.value })} className="h-10 rounded-xl border-[#184d39]/10 bg-white" /></Field>
                    <Field label="Nội dung sticker"><Input value={content.hero.badge_text} onChange={(e) => updateHero({ badge_text: e.target.value })} className="h-10 rounded-xl border-[#184d39]/10 bg-white" /></Field>
                  </div>
                </div>
              </SectionCard>

              <MediaField label="Media chính" media={content.hero.media} onChange={(media) => updateHero({ media })} onUploadState={setUploading} />
            </div>
          ) : null}

          {tab === "story" ? (
            <div className="grid gap-4 xl:grid-cols-[1.05fr_.95fr]">
              <SectionCard title="Câu chuyện Sweet Pea">
                <div className="grid gap-4">
                  <Field label="Nhãn"><Input value={content.story.eyebrow} onChange={(e) => updateStory({ eyebrow: e.target.value })} className="h-10 rounded-xl border-[#184d39]/10 bg-white" /></Field>
                  <Field label="Tiêu đề"><Textarea value={content.story.title} onChange={(e) => updateStory({ title: e.target.value })} className="min-h-20 rounded-xl border-[#184d39]/10 bg-white" /></Field>
                  {["paragraph_1", "paragraph_2", "paragraph_3"].map((key, index) => (
                    <Field key={key} label={`Đoạn ${index + 1}`}>
                      <Textarea value={content.story[key as keyof typeof content.story] as string} onChange={(e) => updateStory({ [key]: e.target.value } as Partial<AboutPageContent["story"]>)} className="min-h-24 rounded-xl border-[#184d39]/10 bg-white" />
                    </Field>
                  ))}
                </div>
              </SectionCard>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                <MediaField label="Ảnh / video trái" media={content.story.media_left} onChange={(media_left) => updateStory({ media_left })} onUploadState={setUploading} />
                <MediaField label="Ảnh / video phải" media={content.story.media_right} onChange={(media_right) => updateStory({ media_right })} onUploadState={setUploading} />
              </div>
            </div>
          ) : null}

          {tab === "highlights" ? (
            <SectionCard title="3 điểm nổi bật" note="Ba thẻ nhỏ nằm giữa trang.">
              <div className="grid gap-4 lg:grid-cols-3">
                {content.highlights.map((item, index) => (
                  <div key={index} className="rounded-[1.25rem] border border-[#184d39]/8 bg-white/55 p-4">
                    <span className="mb-3 grid h-8 w-8 place-items-center rounded-xl bg-[#fde8ef] text-[#a85675]"><Sparkles size={14} /></span>
                    <Field label={`Tiêu đề ${index + 1}`}><Input value={item.title} onChange={(e) => setContent((current) => ({ ...current, highlights: current.highlights.map((row, rowIndex) => rowIndex === index ? { ...row, title: e.target.value } : row) }))} className="h-10 rounded-xl border-[#184d39]/10 bg-[#fffced]" /></Field>
                    <div className="mt-3"><Field label="Mô tả"><Textarea value={item.text} onChange={(e) => setContent((current) => ({ ...current, highlights: current.highlights.map((row, rowIndex) => rowIndex === index ? { ...row, text: e.target.value } : row) }))} className="min-h-24 rounded-xl border-[#184d39]/10 bg-[#fffced]" /></Field></div>
                  </div>
                ))}
              </div>
            </SectionCard>
          ) : null}

          {tab === "gallery" ? (
            <div className="grid gap-4">
              <SectionCard title="Tiêu đề thư viện">
                <div className="grid gap-3 md:grid-cols-3">
                  <Field label="Nhãn"><Input value={content.gallery.eyebrow} onChange={(e) => updateGallery({ eyebrow: e.target.value })} className="h-10 rounded-xl border-[#184d39]/10 bg-white" /></Field>
                  <Field label="Tiêu đề"><Input value={content.gallery.title} onChange={(e) => updateGallery({ title: e.target.value })} className="h-10 rounded-xl border-[#184d39]/10 bg-white" /></Field>
                  <Field label="Mô tả"><Input value={content.gallery.description} onChange={(e) => updateGallery({ description: e.target.value })} className="h-10 rounded-xl border-[#184d39]/10 bg-white" /></Field>
                </div>
              </SectionCard>

              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-bold text-[#184d39]/50">{content.gallery.items.length}/8 media</p>
                <Button type="button" variant="outline" disabled={content.gallery.items.length >= 8} onClick={addGallery} className="h-9 rounded-xl border-[#184d39]/10 bg-white"><Plus size={14} /> Thêm media</Button>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                {content.gallery.items.map((item, index) => (
                  <div key={item.id} className="rounded-[1.45rem] border border-[#184d39]/8 bg-white/45 p-3.5">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div><p className="text-xs font-extrabold text-[#184d39]">Media #{index + 1}</p><p className="mt-0.5 text-[10px] text-[#184d39]/40">Thứ tự này cũng là thứ tự hiển thị.</p></div>
                      <div className="flex gap-1">
                        <button type="button" disabled={index === 0} onClick={() => moveGallery(index, -1)} className="grid h-8 w-8 place-items-center rounded-lg border border-[#184d39]/9 bg-[#fffced] disabled:opacity-25"><ArrowUp size={13} /></button>
                        <button type="button" disabled={index === content.gallery.items.length - 1} onClick={() => moveGallery(index, 1)} className="grid h-8 w-8 place-items-center rounded-lg border border-[#184d39]/9 bg-[#fffced] disabled:opacity-25"><ArrowDown size={13} /></button>
                        <button type="button" disabled={content.gallery.items.length <= 1} onClick={() => removeGallery(index)} className="grid h-8 w-8 place-items-center rounded-lg border border-red-200 bg-red-50 text-red-600 disabled:opacity-25"><Trash2 size={13} /></button>
                      </div>
                    </div>
                    <MediaField label="Hình / GIF / video" media={item.media} onChange={(media) => updateGalleryItem(index, { media })} onUploadState={setUploading} />
                    <div className="mt-3"><Field label="Caption"><Input value={item.caption} onChange={(e) => updateGalleryItem(index, { caption: e.target.value })} className="h-10 rounded-xl border-[#184d39]/10 bg-[#fffced]" /></Field></div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {tab === "quote" ? (
            <div className="grid gap-4 xl:grid-cols-[1fr_.9fr]">
              <SectionCard title="Thông điệp cuối trang">
                <div className="grid gap-4">
                  <Field label="Câu trích dẫn"><Textarea value={content.quote.text} onChange={(e) => updateQuote({ text: e.target.value })} className="min-h-24 rounded-xl border-[#184d39]/10 bg-white" /></Field>
                  <Field label="Mô tả"><Textarea value={content.quote.description} onChange={(e) => updateQuote({ description: e.target.value })} className="min-h-24 rounded-xl border-[#184d39]/10 bg-white" /></Field>
                </div>
              </SectionCard>
              <MediaField label="Background thông điệp" media={content.quote.media} onChange={(media) => updateQuote({ media })} onUploadState={setUploading} />
            </div>
          ) : null}
        </div>

        <footer className="sticky bottom-0 z-10 flex flex-col gap-3 border-t border-[#184d39]/8 bg-[#fffced]/95 px-4 py-3 backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#184d39]/50">
            {dirty ? <Sparkles size={14} className="text-[#b65f80]" /> : <CheckCircle2 size={14} className="text-[#6d8b5e]" />}
            <span>{dirty ? "Có thay đổi chưa lưu." : lastSaved ? `Lưu thành công lúc ${lastSaved}.` : "Nội dung hiện tại đã được lưu."}</span>
          </div>
          <Button type="button" disabled={!dirty || saving || uploading || setupRequired} onClick={() => void save()} className="h-10 rounded-xl bg-[#184d39] px-5 text-[#fffced] hover:bg-[#123e2e]">
            {saving ? <Loader2 className="animate-spin" size={15} /> : <Save size={15} />}
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </footer>
      </section>

      {toast ? (
        <div className="fixed bottom-5 right-5 z-[120000] w-[min(360px,calc(100vw-2rem))] rounded-[1.3rem] border border-[#184d39]/10 bg-[#fffced] p-4 shadow-[0_18px_60px_rgba(24,77,57,.18)]">
          <div className="flex items-start gap-3">
            <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${toast.kind === "success" ? "bg-[#c7db95] text-[#184d39]" : toast.kind === "error" ? "bg-red-100 text-red-700" : "bg-[#fde8ef] text-[#a85675]"}`}>
              {toast.kind === "success" ? <CheckCircle2 size={17} /> : toast.kind === "error" ? <X size={17} /> : <Sparkles size={17} />}
            </span>
            <div className="min-w-0 flex-1"><p className="text-sm font-extrabold text-[#184d39]">{toast.title}</p><p className="mt-1 text-xs leading-5 text-[#184d39]/55">{toast.text}</p></div>
            <button type="button" onClick={() => setToast(null)} className="grid h-7 w-7 place-items-center rounded-lg text-[#184d39]/45 hover:bg-[#184d39]/5"><X size={14} /></button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
