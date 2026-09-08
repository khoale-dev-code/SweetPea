"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Eye,
  Film,
  ImageIcon,
  LayoutTemplate,
  Leaf,
  Loader2,
  Save,
  Sparkles,
  UploadCloud,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DEFAULT_HOME_PAGE_CONTENT, normalizeHomePageContent } from "@/lib/homepage-defaults";
import type {
  HomeHeroContent,
  HomeMedia,
  HomeMediaType,
  HomePageContent,
  HomeSpaceContent,
} from "@/lib/homepage-types";

type EditorTab = "hero" | "space";

type ApiError = { error?: string };

type SnackbarState = {
  tone: "success" | "error" | "info";
  title: string;
  description?: string;
} | null;

async function jsonApi<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    cache: "no-store",
  });
  const body = (await response.json().catch(() => ({}))) as T & ApiError;
  if (!response.ok) throw new Error(body.error || "Không thể xử lý yêu cầu.");
  return body;
}

async function uploadHomeMedia(file: File): Promise<HomeMedia> {
  const isVideo = file.type.startsWith("video/");
  const isImage = file.type.startsWith("image/");
  if (!isVideo && !isImage) throw new Error("Chỉ hỗ trợ ảnh, GIF hoặc video.");

  const limit = isVideo ? 80 * 1024 * 1024 : 20 * 1024 * 1024;
  if (file.size > limit) {
    throw new Error(isVideo ? "Video phải nhỏ hơn 80MB." : "Ảnh/GIF phải nhỏ hơn 20MB.");
  }

  const signed = await jsonApi<{
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

  const resourceType = isVideo ? "video" : "image";
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${signed.cloudName}/${resourceType}/upload`,
    { method: "POST", body: form },
  );
  const result = (await response.json()) as {
    secure_url?: string;
    format?: string;
    error?: { message?: string };
  };

  if (!response.ok || !result.secure_url) {
    throw new Error(result.error?.message || "Tải media thất bại.");
  }

  const type: HomeMediaType = isVideo
    ? "video"
    : file.type === "image/gif" || result.format?.toLowerCase() === "gif"
      ? "gif"
      : "image";

  return {
    type,
    url: result.secure_url,
    alt: file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim(),
  };
}

function Snackbar({
  value,
  onClose,
}: {
  value: SnackbarState;
  onClose: () => void;
}) {
  if (!value) return null;

  const success = value.tone === "success";
  const failed = value.tone === "error";
  const Icon = success ? CheckCircle2 : failed ? AlertCircle : Clock3;

  return (
    <div
      role={failed ? "alert" : "status"}
      aria-live={failed ? "assertive" : "polite"}
      className="fixed bottom-5 right-4 z-[180] w-[calc(100%-2rem)] max-w-[25rem] sm:bottom-6 sm:right-6"
    >
      <div
        className={[
          "flex items-start gap-3 rounded-[1.15rem] border p-3.5 shadow-[0_18px_55px_rgba(24,77,57,0.18)] backdrop-blur-xl sm:p-4",
          success
            ? "border-[#9fba70]/45 bg-[#f6fae9]/95 text-[#184d39]"
            : failed
              ? "border-red-200 bg-red-50/95 text-red-800"
              : "border-[#184d39]/12 bg-[#fffced]/96 text-[#184d39]",
        ].join(" ")}
      >
        <span
          className={[
            "grid h-9 w-9 shrink-0 place-items-center rounded-xl",
            success
              ? "bg-[#c7db95] text-[#184d39]"
              : failed
                ? "bg-red-100 text-red-700"
                : "bg-[#184d39] text-[#fffced]",
          ].join(" ")}
        >
          <Icon size={17} />
        </span>

        <div className="min-w-0 flex-1 pt-0.5">
          <p className="text-sm font-extrabold leading-5">{value.title}</p>
          {value.description ? (
            <p className="mt-1 text-[11px] leading-5 opacity-65">{value.description}</p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng thông báo"
          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg opacity-50 transition hover:bg-black/5 hover:opacity-100"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
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

function MediaPreview({ media }: { media: HomeMedia }) {
  if (media.type === "video") {
    return (
      <video
        src={media.url}
        muted
        playsInline
        loop
        autoPlay
        className="h-full w-full object-cover"
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={media.url} alt={media.alt} className="h-full w-full object-cover" />
  );
}

function MediaEditor({
  title,
  note,
  media,
  onChange,
  uploading,
  onUpload,
}: {
  title: string;
  note: string;
  media: HomeMedia;
  onChange: (media: HomeMedia) => void;
  uploading: boolean;
  onUpload: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <article className="overflow-hidden rounded-[1.4rem] border border-[#184d39]/10 bg-[#fffced]">
      <div className="relative aspect-[16/10] overflow-hidden bg-[#c7db95]/20">
        <MediaPreview media={media} />
        <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1.5 rounded-full bg-[#184d39]/88 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.08em] text-white backdrop-blur">
          {media.type === "video" ? <Film size={10} /> : <ImageIcon size={10} />}
          {media.type}
        </span>
      </div>

      <div className="grid gap-3 p-3.5 sm:p-4">
        <div>
          <h4 className="text-sm font-extrabold text-[#184d39]">{title}</h4>
          <p className="mt-1 text-[11px] leading-5 text-[#184d39]/50">{note}</p>
        </div>

        <div className="grid gap-2 sm:grid-cols-[7rem_minmax(0,1fr)]">
          <select
            value={media.type}
            onChange={(event) =>
              onChange({ ...media, type: event.target.value as HomeMediaType })
            }
            className="h-10 rounded-xl border border-[#184d39]/12 bg-white px-3 text-xs font-bold text-[#184d39] outline-none"
          >
            <option value="image">Ảnh</option>
            <option value="gif">GIF</option>
            <option value="video">Video</option>
          </select>

          <Input
            value={media.url}
            onChange={(event) => onChange({ ...media, url: event.target.value })}
            placeholder="URL media hoặc /images/..."
            className="h-10 rounded-xl border-[#184d39]/12 bg-white text-xs"
          />
        </div>

        <Input
          value={media.alt}
          onChange={(event) => onChange({ ...media, alt: event.target.value })}
          placeholder="Mô tả media / alt text"
          className="h-10 rounded-xl border-[#184d39]/12 bg-white text-xs"
        />

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
          className="sr-only"
          disabled={uploading}
          onChange={(event) => {
            const file = event.currentTarget.files?.[0];
            event.currentTarget.value = "";
            if (file) onUpload(file);
          }}
        />

        <Button
          type="button"
          variant="outline"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="h-10 rounded-xl border-dashed border-[#184d39]/22 bg-[#c7db95]/20 text-xs font-extrabold text-[#184d39] hover:bg-[#c7db95]/34"
        >
          {uploading ? <Loader2 size={15} className="animate-spin" /> : <UploadCloud size={15} />}
          {uploading ? "Đang tải..." : "Tải ảnh / GIF / video"}
        </Button>
      </div>
    </article>
  );
}

function ChipFields({
  values,
  onChange,
}: {
  values: [string, string, string];
  onChange: (values: [string, string, string]) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {values.map((value, index) => (
        <Field key={index} label={`Chip ${index + 1}`}>
          <Input
            value={value}
            onChange={(event) => {
              const next = [...values] as [string, string, string];
              next[index] = event.target.value;
              onChange(next);
            }}
            className="h-11 rounded-xl border-[#184d39]/12 bg-white"
          />
        </Field>
      ))}
    </div>
  );
}

function HeroEditor({
  value,
  onChange,
  uploadingKey,
  upload,
}: {
  value: HomeHeroContent;
  onChange: (value: HomeHeroContent) => void;
  uploadingKey: string;
  upload: (key: string, file: File, apply: (media: HomeMedia) => void) => void;
}) {
  return (
    <div className="grid gap-5">
      <section className="rounded-[1.5rem] border border-[#184d39]/10 bg-white/55 p-4 sm:p-5">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#184d39]/50">01 · Nội dung Hero</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Nhãn nhỏ"><Input value={value.eyebrow} onChange={(event) => onChange({ ...value, eyebrow: event.target.value })} className="h-11 rounded-xl border-[#184d39]/12 bg-[#fffced]" /></Field>
          <Field label="Dòng tiêu đề 1"><Input value={value.title} onChange={(event) => onChange({ ...value, title: event.target.value })} className="h-11 rounded-xl border-[#184d39]/12 bg-[#fffced]" /></Field>
          <Field label="Dòng tiêu đề 2"><Input value={value.accent_title} onChange={(event) => onChange({ ...value, accent_title: event.target.value })} className="h-11 rounded-xl border-[#184d39]/12 bg-[#fffced]" /></Field>
          <Field label="Nhãn trên ảnh chính"><Input value={value.media_label} onChange={(event) => onChange({ ...value, media_label: event.target.value })} className="h-11 rounded-xl border-[#184d39]/12 bg-[#fffced]" /></Field>
        </div>
        <div className="mt-4"><Field label="Mô tả"><Textarea value={value.description} onChange={(event) => onChange({ ...value, description: event.target.value })} className="min-h-28 rounded-xl border-[#184d39]/12 bg-[#fffced]" /></Field></div>
        <div className="mt-4"><ChipFields values={value.chips} onChange={(chips) => onChange({ ...value, chips })} /></div>
      </section>

      <section className="rounded-[1.5rem] border border-[#184d39]/10 bg-[#c7db95]/16 p-4 sm:p-5">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#184d39]/50">02 · Nút & sticker</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Nút chính"><Input value={value.primary_label} onChange={(event) => onChange({ ...value, primary_label: event.target.value })} className="h-11 rounded-xl border-[#184d39]/12 bg-[#fffced]" /></Field>
          <Field label="Link nút chính"><Input value={value.primary_href} onChange={(event) => onChange({ ...value, primary_href: event.target.value })} className="h-11 rounded-xl border-[#184d39]/12 bg-[#fffced]" /></Field>
          <Field label="Nút phụ"><Input value={value.secondary_label} onChange={(event) => onChange({ ...value, secondary_label: event.target.value })} className="h-11 rounded-xl border-[#184d39]/12 bg-[#fffced]" /></Field>
          <Field label="Link nút phụ"><Input value={value.secondary_href} onChange={(event) => onChange({ ...value, secondary_href: event.target.value })} className="h-11 rounded-xl border-[#184d39]/12 bg-[#fffced]" /></Field>
          <Field label="Sticker - tiêu đề"><Input value={value.sticker_title} onChange={(event) => onChange({ ...value, sticker_title: event.target.value })} className="h-11 rounded-xl border-[#184d39]/12 bg-[#fffced]" /></Field>
          <Field label="Sticker - mô tả"><Input value={value.sticker_text} onChange={(event) => onChange({ ...value, sticker_text: event.target.value })} className="h-11 rounded-xl border-[#184d39]/12 bg-[#fffced]" /></Field>
        </div>
      </section>

      <section className="rounded-[1.5rem] border border-[#184d39]/10 bg-white/55 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div><p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#184d39]/50">03 · Media Hero</p><h3 className="mt-1 font-extrabold text-[#184d39]">Ảnh, GIF hoặc video</h3></div>
          <span className="rounded-full bg-[#c7db95] px-3 py-1 text-[9px] font-extrabold text-[#184d39]">2 vị trí</span>
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          <MediaEditor
            title="Ảnh / video chính"
            note="Khung lớn bên phải của phần đầu trang."
            media={value.main_media}
            onChange={(main_media) => onChange({ ...value, main_media })}
            uploading={uploadingKey === "hero-main"}
            onUpload={(file) => upload("hero-main", file, (main_media) => onChange({ ...value, main_media }))}
          />
          <MediaEditor
            title="Media tròn nổi"
            note="Khung tròn nhỏ nằm chồng lên ảnh chính."
            media={value.bubble_media}
            onChange={(bubble_media) => onChange({ ...value, bubble_media })}
            uploading={uploadingKey === "hero-bubble"}
            onUpload={(file) => upload("hero-bubble", file, (bubble_media) => onChange({ ...value, bubble_media }))}
          />
        </div>
      </section>
    </div>
  );
}

function SpaceEditor({
  value,
  onChange,
  uploadingKey,
  upload,
}: {
  value: HomeSpaceContent;
  onChange: (value: HomeSpaceContent) => void;
  uploadingKey: string;
  upload: (key: string, file: File, apply: (media: HomeMedia) => void) => void;
}) {
  return (
    <div className="grid gap-5">
      <section className="rounded-[1.5rem] border border-[#184d39]/10 bg-white/55 p-4 sm:p-5">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#184d39]/50">01 · Nội dung Không gian</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Nhãn nhỏ"><Input value={value.eyebrow} onChange={(event) => onChange({ ...value, eyebrow: event.target.value })} className="h-11 rounded-xl border-[#184d39]/12 bg-[#fffced]" /></Field>
          <Field label="Tiêu đề"><Input value={value.title} onChange={(event) => onChange({ ...value, title: event.target.value })} className="h-11 rounded-xl border-[#184d39]/12 bg-[#fffced]" /></Field>
        </div>
        <div className="mt-4"><Field label="Mô tả"><Textarea value={value.description} onChange={(event) => onChange({ ...value, description: event.target.value })} className="min-h-28 rounded-xl border-[#184d39]/12 bg-[#fffced]" /></Field></div>
        <div className="mt-4"><ChipFields values={value.chips} onChange={(chips) => onChange({ ...value, chips })} /></div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Nút CTA"><Input value={value.cta_label} onChange={(event) => onChange({ ...value, cta_label: event.target.value })} className="h-11 rounded-xl border-[#184d39]/12 bg-[#fffced]" /></Field>
          <Field label="Link CTA"><Input value={value.cta_href} onChange={(event) => onChange({ ...value, cta_href: event.target.value })} className="h-11 rounded-xl border-[#184d39]/12 bg-[#fffced]" /></Field>
        </div>
      </section>

      <section className="rounded-[1.5rem] border border-[#184d39]/10 bg-[#c7db95]/16 p-4 sm:p-5">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#184d39]/50">02 · Chú thích trên ảnh</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Field label="Ảnh lớn"><Input value={value.main_label} onChange={(event) => onChange({ ...value, main_label: event.target.value })} className="h-11 rounded-xl border-[#184d39]/12 bg-[#fffced]" /></Field>
          <Field label="Ảnh phải trên"><Input value={value.top_label} onChange={(event) => onChange({ ...value, top_label: event.target.value })} className="h-11 rounded-xl border-[#184d39]/12 bg-[#fffced]" /></Field>
          <Field label="Ảnh phải dưới"><Input value={value.bottom_label} onChange={(event) => onChange({ ...value, bottom_label: event.target.value })} className="h-11 rounded-xl border-[#184d39]/12 bg-[#fffced]" /></Field>
        </div>
      </section>

      <section className="rounded-[1.5rem] border border-[#184d39]/10 bg-white/55 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div><p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#184d39]/50">03 · Media Không gian</p><h3 className="mt-1 font-extrabold text-[#184d39]">3 khung media độc lập</h3></div>
          <span className="rounded-full bg-[#c7db95] px-3 py-1 text-[9px] font-extrabold text-[#184d39]">Ảnh · GIF · Video</span>
        </div>
        <div className="mt-4 grid gap-3 xl:grid-cols-3">
          <MediaEditor
            title="Media lớn"
            note="Khung ảnh lớn bên trái cụm hình."
            media={value.main_media}
            onChange={(main_media) => onChange({ ...value, main_media })}
            uploading={uploadingKey === "space-main"}
            onUpload={(file) => upload("space-main", file, (main_media) => onChange({ ...value, main_media }))}
          />
          <MediaEditor
            title="Media phải trên"
            note="Khung nhỏ phía trên bên phải."
            media={value.top_media}
            onChange={(top_media) => onChange({ ...value, top_media })}
            uploading={uploadingKey === "space-top"}
            onUpload={(file) => upload("space-top", file, (top_media) => onChange({ ...value, top_media }))}
          />
          <MediaEditor
            title="Media phải dưới"
            note="Khung nhỏ phía dưới bên phải."
            media={value.bottom_media}
            onChange={(bottom_media) => onChange({ ...value, bottom_media })}
            uploading={uploadingKey === "space-bottom"}
            onUpload={(file) => upload("space-bottom", file, (bottom_media) => onChange({ ...value, bottom_media }))}
          />
        </div>
      </section>
    </div>
  );
}

export function HomepagePanel() {
  const [content, setContent] = useState<HomePageContent | null>(null);
  const [tab, setTab] = useState<EditorTab>("hero");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingKey, setUploadingKey] = useState("");
  const [error, setError] = useState("");
  const [savedContent, setSavedContent] = useState<HomePageContent | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [snackbar, setSnackbar] = useState<SnackbarState>(null);

  const mediaCount = useMemo(() => (content ? 5 : 0), [content]);
  const dirty = useMemo(() => {
    if (!content || !savedContent) return false;
    return JSON.stringify(content) !== JSON.stringify(savedContent);
  }, [content, savedContent]);

  useEffect(() => {
    if (!snackbar) return;
    const timeout = window.setTimeout(
      () => setSnackbar(null),
      snackbar.tone === "error" ? 6500 : 4200,
    );
    return () => window.clearTimeout(timeout);
  }, [snackbar]);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const result = await jsonApi<{ content: HomePageContent }>("/api/admin/homepage");
      const normalized = normalizeHomePageContent(result.content);
      setContent(normalized);
      setSavedContent(normalized);
      setLastSavedAt(null);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Không thể tải Trang chủ.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function save() {
    if (!content) return;

    if (!dirty) {
      setSnackbar({
        tone: "info",
        title: "Không có thay đổi mới",
        description: "Nội dung Trang chủ hiện tại đã được lưu.",
      });
      return;
    }

    setSaving(true);
    setError("");
    setSnackbar(null);

    try {
      const result = await jsonApi<{ content: HomePageContent }>("/api/admin/homepage", {
        method: "PATCH",
        body: JSON.stringify({ content }),
      });
      const normalized = normalizeHomePageContent(result.content);
      const savedAt = new Date();
      setContent(normalized);
      setSavedContent(normalized);
      setLastSavedAt(savedAt);
      setSnackbar({
        tone: "success",
        title: "Lưu trang chủ thành công",
        description: "Nội dung mới đã được cập nhật trên website.",
      });
    } catch (requestError) {
      const text = requestError instanceof Error ? requestError.message : "Không thể lưu Trang chủ.";
      setError(text);
      setSnackbar({
        tone: "error",
        title: "Lưu trang chủ thất bại",
        description: text,
      });
    } finally {
      setSaving(false);
    }
  }

  async function upload(key: string, file: File, apply: (media: HomeMedia) => void) {
    setUploadingKey(key);
    setError("");
    try {
      const media = await uploadHomeMedia(file);
      apply(media);
      setSnackbar({
        tone: "info",
        title: "Đã tải media",
        description: "Media mới đang ở trạng thái chưa lưu. Bấm Lưu để cập nhật website.",
      });
    } catch (requestError) {
      const text = requestError instanceof Error ? requestError.message : "Tải media thất bại.";
      setError(text);
      setSnackbar({
        tone: "error",
        title: "Tải media thất bại",
        description: text,
      });
    } finally {
      setUploadingKey("");
    }
  }

  if (loading) {
    return (
      <section className="mt-5 grid min-h-72 place-items-center rounded-[1.8rem] border border-[#184d39]/10 bg-[#fffced]">
        <div className="text-center text-[#184d39]"><Loader2 className="mx-auto animate-spin" /><p className="mt-3 text-sm font-bold">Đang tải nội dung Trang chủ…</p></div>
      </section>
    );
  }

  if (!content) {
    return (
      <section className="mt-5 rounded-[1.8rem] border border-red-200 bg-red-50 p-6 text-sm font-semibold text-red-700">
        {error || "Chưa thể tải dữ liệu Trang chủ. Hãy chạy file SQL migration trước."}
      </section>
    );
  }

  return (
    <div className="mt-5 grid gap-4" data-homepage-admin-version="4.4.2">
      <section className="overflow-hidden rounded-[1.8rem] border border-[#184d39]/10 bg-[#fffced] shadow-[0_16px_50px_rgba(39,65,51,0.045)]">
        <div className="flex flex-col gap-4 border-b border-[#184d39]/10 p-5 sm:p-6 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-start gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#c7db95] text-[#184d39]"><LayoutTemplate size={20} /></span>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#184d39]/50">Trang chủ · CMS</p>
              <h2 className="mt-1 text-xl font-extrabold text-[#184d39] sm:text-2xl">Chỉnh nội dung & media trực tiếp</h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-[#184d39]/55">Hai khu vực trong ảnh bạn gửi — Hero đầu trang và Không gian Sweet Pea — giờ có thể đổi chữ, ảnh, GIF hoặc video mà không cần sửa code.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span
              className={[
                "inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-[10px] font-extrabold",
                saving
                  ? "border-[#184d39]/12 bg-[#184d39] text-[#fffced]"
                  : uploadingKey
                    ? "border-[#184d39]/10 bg-[#fffced] text-[#184d39]"
                    : dirty
                      ? "border-[#d8c37b]/45 bg-[#fff5cf] text-[#765b18]"
                      : "border-[#9fb86e]/35 bg-[#c7db95]/45 text-[#184d39]",
              ].join(" ")}
            >
              {saving ? (
                <Loader2 size={12} className="animate-spin" />
              ) : uploadingKey ? (
                <Loader2 size={12} className="animate-spin" />
              ) : dirty ? (
                <Clock3 size={12} />
              ) : (
                <CheckCircle2 size={12} />
              )}
              {saving
                ? "Đang lưu"
                : uploadingKey
                  ? "Đang tải media"
                  : dirty
                    ? "Có thay đổi chưa lưu"
                    : "Đã lưu"}
            </span>

            <Button asChild variant="outline" className="h-11 rounded-xl border-[#184d39]/12 bg-white text-[#184d39]"><Link href="/" target="_blank"><Eye size={16} /> Xem trang chủ</Link></Button>
            <Button type="button" disabled={saving || Boolean(uploadingKey) || !dirty} onClick={save} className="h-11 rounded-xl bg-[#184d39] px-5 text-[#fffced] hover:bg-[#123e2e] disabled:cursor-not-allowed disabled:opacity-45">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {saving ? "Đang lưu..." : dirty ? "Lưu thay đổi" : "Đã lưu"}
            </Button>
          </div>
        </div>

        <div className="grid gap-3 border-b border-[#184d39]/8 bg-[#c7db95]/14 p-4 sm:grid-cols-3 sm:p-5">
          <div className="rounded-2xl border border-[#184d39]/8 bg-white/65 px-4 py-3"><p className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-[#184d39]/45">Khu vực</p><p className="mt-1 text-xl font-black text-[#184d39]">2</p><p className="text-[10px] text-[#184d39]/45">Hero + Không gian</p></div>
          <div className="rounded-2xl border border-[#184d39]/8 bg-white/65 px-4 py-3"><p className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-[#184d39]/45">Vị trí media</p><p className="mt-1 text-xl font-black text-[#184d39]">{mediaCount}</p><p className="text-[10px] text-[#184d39]/45">đổi độc lập từng khung</p></div>
          <div className="rounded-2xl border border-[#184d39]/8 bg-[#c7db95]/35 px-4 py-3"><p className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-[#184d39]/45">Hỗ trợ</p><p className="mt-1 flex items-center gap-2 text-sm font-extrabold text-[#184d39]"><ImageIcon size={15} /> Ảnh · GIF <Film size={15} /> Video</p><p className="mt-1 text-[10px] text-[#184d39]/45">Cloudinary signed upload</p></div>
        </div>

        <div className="flex gap-2 overflow-x-auto p-4 sm:px-5">
          <button type="button" onClick={() => setTab("hero")} className={`min-h-10 shrink-0 rounded-full px-4 text-xs font-extrabold transition ${tab === "hero" ? "bg-[#184d39] text-[#fffced]" : "border border-[#184d39]/10 bg-white text-[#184d39]/60"}`}><Sparkles size={13} className="mr-1.5 inline" />Hero đầu trang</button>
          <button type="button" onClick={() => setTab("space")} className={`min-h-10 shrink-0 rounded-full px-4 text-xs font-extrabold transition ${tab === "space" ? "bg-[#184d39] text-[#fffced]" : "border border-[#184d39]/10 bg-white text-[#184d39]/60"}`}><Leaf size={13} className="mr-1.5 inline" />Không gian Sweet Pea</button>
        </div>
      </section>

      {error ? (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          <AlertCircle className="mt-0.5 shrink-0" size={16} />
          {error}
        </div>
      ) : null}

      {tab === "hero" ? (
        <HeroEditor value={content.hero} onChange={(hero) => setContent({ ...content, hero })} uploadingKey={uploadingKey} upload={upload} />
      ) : (
        <SpaceEditor value={content.space} onChange={(space) => setContent({ ...content, space })} uploadingKey={uploadingKey} upload={upload} />
      )}

      <div className="sticky bottom-3 z-20 flex items-center justify-between gap-3 rounded-[1.35rem] border border-[#184d39]/12 bg-[#fffced]/95 p-3 shadow-[0_16px_45px_rgba(24,77,57,0.13)] backdrop-blur-xl sm:p-4">
        <div className="hidden min-w-0 sm:block">
          <p className="flex items-center gap-1.5 text-xs font-extrabold text-[#184d39]">
            {saving ? (
              <><Loader2 size={13} className="animate-spin" /> Đang lưu thay đổi...</>
            ) : uploadingKey ? (
              <><Loader2 size={13} className="animate-spin" /> Đang tải media...</>
            ) : dirty ? (
              <><Clock3 size={13} className="text-[#8a6b1f]" /> Có thay đổi chưa lưu</>
            ) : (
              <><CheckCircle2 size={13} className="text-[#668a4c]" /> Nội dung hiện tại đã được lưu</>
            )}
          </p>
          <p className="mt-0.5 text-[10px] text-[#184d39]/45">
            {lastSavedAt
              ? `Lưu thành công lúc ${lastSavedAt.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}.`
              : dirty
                ? "Bấm Lưu để cập nhật nội dung mới lên website."
                : "Sẵn sàng chỉnh sửa nội dung Trang chủ."}
          </p>
        </div>
        <div className="ml-auto flex gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={saving || Boolean(uploadingKey)}
            onClick={() => {
              setContent(DEFAULT_HOME_PAGE_CONTENT);
              setSnackbar({
                tone: "info",
                title: "Đã đưa nội dung mặc định vào form",
                description: "Thay đổi này chưa được lưu. Bấm Lưu để áp dụng lên website.",
              });
            }}
            className="h-10 rounded-xl border-[#184d39]/12 bg-white px-4 text-xs text-[#184d39]"
          >
            Mặc định
          </Button>
          <Button
            type="button"
            disabled={saving || Boolean(uploadingKey) || !dirty}
            onClick={save}
            className="h-10 rounded-xl bg-[#184d39] px-5 text-xs font-extrabold text-[#fffced] hover:bg-[#123e2e] disabled:cursor-not-allowed disabled:opacity-45"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : dirty ? <Save size={15} /> : <CheckCircle2 size={15} />}
            {saving ? "Đang lưu" : dirty ? "Lưu" : "Đã lưu"}
          </Button>
        </div>
      </div>

      <Snackbar value={snackbar} onClose={() => setSnackbar(null)} />
    </div>
  );
}
