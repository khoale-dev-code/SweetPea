"use client";

import {
  ArrowLeft,
  ArrowRight,
  Film,
  GripVertical,
  ImagePlus,
  Images,
  Loader2,
  Star,
  Trash2,
} from "lucide-react";
import {
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";

export type AdminNewsMedia = {
  type: "image" | "gif" | "video";
  url: string;
};

type NewsMediaDnDGridProps = {
  media: AdminNewsMedia[];
  coverUrl: string;
  uploading: boolean;
  maxItems?: number;
  onFiles: (files: File[]) => void;
  onRemove: (index: number) => void;
  onMove: (index: number, direction: -1 | 1) => void;
  onReorder: (sourceIndex: number, targetIndex: number) => void;
  onSetCover: (url: string) => void;
};

const ACCEPT =
  "image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime";

function isFileDrag(event: DragEvent<HTMLElement>) {
  return Array.from(event.dataTransfer.types || []).includes("Files");
}

export function NewsMediaDnDGrid({
  media,
  coverUrl,
  uploading,
  maxItems = 12,
  onFiles,
  onRemove,
  onMove,
  onReorder,
  onSetCover,
}: NewsMediaDnDGridProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const fileDragDepth = useRef(0);
  const [fileDropActive, setFileDropActive] = useState(false);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const room = Math.max(0, maxItems - media.length);
  const disabled = uploading || room <= 0;

  function sendFiles(files: File[]) {
    if (!files.length || disabled) return;
    onFiles(files.slice(0, room));
  }

  function onInputChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.currentTarget.files || []);
    event.currentTarget.value = "";
    sendFiles(files);
  }

  function onRootDragEnter(event: DragEvent<HTMLDivElement>) {
    if (!isFileDrag(event)) return;
    event.preventDefault();
    fileDragDepth.current += 1;
    if (!disabled) setFileDropActive(true);
  }

  function onRootDragOver(event: DragEvent<HTMLDivElement>) {
    if (!isFileDrag(event)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = disabled ? "none" : "copy";
  }

  function onRootDragLeave(event: DragEvent<HTMLDivElement>) {
    if (!isFileDrag(event)) return;
    event.preventDefault();
    fileDragDepth.current = Math.max(0, fileDragDepth.current - 1);
    if (fileDragDepth.current === 0) setFileDropActive(false);
  }

  function onRootDrop(event: DragEvent<HTMLDivElement>) {
    if (!isFileDrag(event)) return;
    event.preventDefault();
    fileDragDepth.current = 0;
    setFileDropActive(false);
    sendFiles(Array.from(event.dataTransfer.files || []));
  }

  function startCardDrag(event: DragEvent<HTMLElement>, index: number) {
    if (uploading) {
      event.preventDefault();
      return;
    }

    setDraggingIndex(index);
    setOverIndex(index);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("application/x-sweet-pea-news-media", String(index));
    event.dataTransfer.setData("text/plain", String(index));
  }

  function overCard(event: DragEvent<HTMLElement>, index: number) {
    if (isFileDrag(event) || draggingIndex === null) return;
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = "move";
    if (overIndex !== index) setOverIndex(index);
  }

  function dropCard(event: DragEvent<HTMLElement>, targetIndex: number) {
    if (isFileDrag(event)) return;
    event.preventDefault();
    event.stopPropagation();

    const raw = event.dataTransfer.getData("application/x-sweet-pea-news-media");
    const sourceIndex = draggingIndex ?? Number(raw);

    if (
      Number.isInteger(sourceIndex) &&
      sourceIndex >= 0 &&
      sourceIndex < media.length &&
      sourceIndex !== targetIndex
    ) {
      onReorder(sourceIndex, targetIndex);
    }

    setDraggingIndex(null);
    setOverIndex(null);
  }

  function endCardDrag() {
    setDraggingIndex(null);
    setOverIndex(null);
  }

  return (
    <div
      data-news-media-dnd-version="4.6"
      className="mt-4"
      onDragEnter={onRootDragEnter}
      onDragOver={onRootDragOver}
      onDragLeave={onRootDragLeave}
      onDrop={onRootDrop}
    >
      {media.length ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {media.map((item, index) => {
            const isCover = coverUrl === item.url;
            const isDragging = draggingIndex === index;
            const isTarget = overIndex === index && draggingIndex !== index;

            return (
              <article
                key={`${item.type}-${item.url}`}
                draggable={!uploading}
                onDragStart={(event) => startCardDrag(event, index)}
                onDragOver={(event) => overCard(event, index)}
                onDrop={(event) => dropCard(event, index)}
                onDragEnd={endCardDrag}
                className={[
                  "group relative overflow-hidden rounded-2xl border-2 bg-[#fffced] transition-all duration-200",
                  isCover
                    ? "border-[#c7db95] shadow-[0_10px_28px_rgba(24,77,57,0.08)]"
                    : "border-[#184d39]/10",
                  isTarget
                    ? "scale-[1.015] border-[#ef9fbc] bg-[#fff7fa] shadow-[0_12px_30px_rgba(181,72,122,0.12)]"
                    : "",
                  isDragging ? "scale-[0.98] opacity-45" : "",
                  uploading ? "cursor-default" : "cursor-grab active:cursor-grabbing",
                ].join(" ")}
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-[#edf3db]">
                  {item.type === "video" ? (
                    <>
                      <video
                        src={item.url}
                        muted
                        playsInline
                        preload="metadata"
                        className="h-full w-full object-cover"
                      />
                      <span className="pointer-events-none absolute inset-0 grid place-items-center bg-[#184d39]/8 text-white">
                        <span className="grid h-10 w-10 place-items-center rounded-full bg-[#184d39]/72 backdrop-blur">
                          <Film size={17} />
                        </span>
                      </span>
                    </>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.url}
                      alt={`Media bản tin ${index + 1}`}
                      draggable={false}
                      className="h-full w-full object-cover"
                    />
                  )}

                  <div className="pointer-events-none absolute left-2 top-2 flex items-center gap-1.5">
                    <span className="rounded-full bg-[#184d39]/88 px-2 py-1 text-[9px] font-extrabold text-[#fffced] backdrop-blur">
                      {index + 1}
                    </span>
                    <span className="rounded-full bg-white/88 px-2 py-1 text-[9px] font-extrabold uppercase text-[#184d39] backdrop-blur">
                      {item.type === "gif" ? "GIF" : item.type === "video" ? "Video" : "Ảnh"}
                    </span>
                  </div>

                  <span className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-xl border border-white/45 bg-[#fffced]/88 text-[#184d39] shadow-sm backdrop-blur transition group-hover:scale-105">
                    <GripVertical size={15} />
                  </span>

                  {isCover ? (
                    <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-[#c7db95] px-2.5 py-1.5 text-[9px] font-extrabold text-[#184d39] shadow-sm">
                      <Star size={10} fill="currentColor" /> Ảnh bìa
                    </span>
                  ) : null}
                </div>

                <div className="flex items-center justify-between gap-2 border-t border-[#184d39]/8 p-2.5">
                  <div className="min-w-0">
                    <p className="text-[10px] font-extrabold text-[#184d39]">
                      {index === 0 ? "Media đầu tiên" : `Media ${index + 1}`}
                    </p>
                    <p className="mt-0.5 truncate text-[9px] text-[#184d39]/42">
                      Kéo card để đổi vị trí
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    {item.type !== "video" && !isCover ? (
                      <button
                        type="button"
                        onClick={() => onSetCover(item.url)}
                        className="hidden h-8 items-center gap-1 rounded-lg border border-[#184d39]/10 bg-[#c7db95]/30 px-2.5 text-[9px] font-extrabold text-[#184d39] transition hover:bg-[#c7db95]/55 sm:inline-flex"
                      >
                        <Star size={11} /> Đặt bìa
                      </button>
                    ) : null}

                    <button
                      type="button"
                      disabled={index === 0 || uploading}
                      onClick={() => onMove(index, -1)}
                      className="grid h-8 w-8 place-items-center rounded-lg border border-[#184d39]/9 bg-white text-[#184d39] transition hover:bg-[#c7db95]/22 disabled:opacity-25"
                      aria-label="Chuyển media sang trái"
                      title="Chuyển sang trước"
                    >
                      <ArrowLeft size={13} />
                    </button>

                    <button
                      type="button"
                      disabled={index === media.length - 1 || uploading}
                      onClick={() => onMove(index, 1)}
                      className="grid h-8 w-8 place-items-center rounded-lg border border-[#184d39]/9 bg-white text-[#184d39] transition hover:bg-[#c7db95]/22 disabled:opacity-25"
                      aria-label="Chuyển media sang phải"
                      title="Chuyển sang sau"
                    >
                      <ArrowRight size={13} />
                    </button>

                    <button
                      type="button"
                      disabled={uploading}
                      onClick={() => onRemove(index)}
                      className="grid h-8 w-8 place-items-center rounded-lg border border-[#d95f72]/15 bg-[#fff7f8] text-[#c65369] transition hover:bg-[#fde8ef] disabled:opacity-40"
                      aria-label="Xóa media"
                      title="Xóa media"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="grid min-h-28 place-items-center rounded-2xl border border-dashed border-[#184d39]/14 bg-[#fffced]/55 text-center text-[#184d39]/50">
          <div className="p-5">
            <Images className="mx-auto" size={23} />
            <p className="mt-2 text-xs font-extrabold">Chưa có media cho bài viết</p>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPT}
        multiple
        className="sr-only"
        onChange={onInputChange}
        disabled={disabled}
      />

      <button
        type="button"
        disabled={disabled}
        onClick={() => fileInputRef.current?.click()}
        className={[
          "relative mt-3 flex min-h-[112px] w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed px-5 py-5 text-center transition-all duration-200",
          fileDropActive
            ? "scale-[1.01] border-[#e68daf] bg-[#fff1f6] shadow-[0_12px_32px_rgba(181,72,122,0.12)]"
            : "border-[#184d39]/16 bg-[#fffced]/75 hover:border-[#e6a5bc] hover:bg-[#fff8fb]",
          disabled ? "cursor-not-allowed opacity-55" : "cursor-pointer",
        ].join(" ")}
      >
        <span className="pointer-events-none absolute -left-10 -top-10 h-28 w-28 rounded-full bg-[#c7db95]/30 blur-2xl" />
        <span className="pointer-events-none absolute -bottom-12 -right-8 h-28 w-28 rounded-full bg-[#f3b8d3]/28 blur-2xl" />

        <span className="relative flex flex-col items-center">
          <span
            className={[
              "grid h-11 w-11 place-items-center rounded-2xl transition",
              fileDropActive
                ? "bg-[#f3b8d3] text-white"
                : "bg-[#c7db95]/65 text-[#184d39]",
            ].join(" ")}
          >
            {uploading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <ImagePlus size={18} />
            )}
          </span>

          <strong className="mt-3 text-sm text-[#184d39]">
            {uploading
              ? "Đang tải media lên..."
              : fileDropActive
                ? "Thả file vào đây"
                : "Kéo & thả ảnh, GIF hoặc video vào đây"}
          </strong>

          <span className="mt-1 text-[10px] leading-4 text-[#184d39]/48">
            {room > 0
              ? `Hoặc bấm để chọn từ máy · còn ${room}/${maxItems} vị trí`
              : `Đã đủ ${maxItems} media`}
          </span>
        </span>
      </button>

      {media.length > 1 ? (
        <p className="mt-2.5 text-[10px] leading-4 text-[#184d39]/48">
          Mẹo: trên máy tính, giữ card bằng biểu tượng ⋮⋮ rồi kéo sang vị trí mong muốn. Trên điện thoại vẫn có nút mũi tên để đổi thứ tự.
        </p>
      ) : null}
    </div>
  );
}
