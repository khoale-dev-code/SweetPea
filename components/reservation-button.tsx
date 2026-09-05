"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import {
  CalendarCheck2,
  CheckCircle2,
  Clock3,
  Loader2,
  MapPin,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

type ReservationButtonProps = {
  variant?: "primary" | "icon" | "menu";
  className?: string;
};

type ReservationDraft = {
  customer_name: string;
  phone: string;
  reservation_date: string;
  reservation_time: string;
  guest_count: number;
  seating_preference: "any" | "garden" | "indoor";
  note: string;
  website: string;
};

function localDateInputValue(date = new Date()) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

function emptyDraft(): ReservationDraft {
  return {
    customer_name: "",
    phone: "",
    reservation_date: localDateInputValue(),
    reservation_time: "",
    guest_count: 2,
    seating_preference: "any",
    note: "",
    website: "",
  };
}

function ReservationDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<ReservationDraft>(() => emptyDraft());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [reservationCode, setReservationCode] = useState("");

  const minDate = useMemo(() => localDateInputValue(), []);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !submitting) onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose, submitting]);

  if (!open || typeof document === "undefined") return null;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/public/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });

      const body = (await response.json().catch(() => ({}))) as {
        error?: string;
        reservationCode?: string;
      };

      if (!response.ok) {
        throw new Error(body.error || "Không thể gửi yêu cầu đặt bàn.");
      }

      setReservationCode(body.reservationCode || "");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Không thể gửi yêu cầu đặt bàn.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setDraft(emptyDraft());
    setReservationCode("");
    setError("");
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Đặt bàn tại Sweet Pea"
      data-reservation-modal-version="3.6"
    >
      <button
        type="button"
        aria-label="Đóng form đặt bàn"
        onClick={() => {
          if (!submitting) onClose();
        }}
        className="absolute inset-0 bg-[#102d22]/55 backdrop-blur-[4px]"
      />

      <div className="relative max-h-[94dvh] w-full overflow-y-auto rounded-t-[2rem] border border-[#184d39]/10 bg-[#fffced] shadow-[0_-24px_70px_rgba(16,45,34,0.24)] sm:max-w-[44rem] sm:rounded-[2rem] sm:shadow-[0_28px_90px_rgba(16,45,34,0.28)]">
        <div className="sticky top-0 z-10 border-b border-[#184d39]/10 bg-[#c7db95]/95 px-5 py-5 backdrop-blur sm:px-7 sm:py-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#fffced] text-[#184d39] shadow-sm">
                <CalendarCheck2 size={20} />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#184d39]/55">
                  Sweet Pea · Giữ chỗ trước
                </p>
                <h2 className="mt-1 font-display text-2xl font-bold leading-tight text-[#184d39] sm:text-3xl">
                  Đặt bàn thật nhanh
                </h2>
                <p className="mt-1.5 text-sm leading-6 text-[#184d39]/62">
                  Gửi thời gian bạn muốn ghé. Tiệm sẽ xác nhận lại để tránh trùng bàn.
                </p>
              </div>
            </div>

            <button
              type="button"
              disabled={submitting}
              onClick={onClose}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[#184d39]/10 bg-[#fffced]/80 text-[#184d39] transition hover:bg-white disabled:opacity-50"
              aria-label="Đóng"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {reservationCode ? (
          <div className="px-5 py-8 sm:px-7 sm:py-10">
            <div className="mx-auto max-w-lg text-center">
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#c7db95] text-[#184d39]">
                <CheckCircle2 size={30} />
              </span>
              <p className="mt-5 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#184d39]/48">
                Đã gửi yêu cầu
              </p>
              <h3 className="mt-2 font-display text-3xl font-bold text-[#184d39]">
                Tiệm đã nhận thông tin của bạn.
              </h3>
              <p className="mt-3 text-sm leading-7 text-[#184d39]/62">
                Yêu cầu đặt bàn chưa được xác nhận tự động. Sweet Pea sẽ kiểm tra bàn
                trống và liên hệ qua số điện thoại bạn đã để lại.
              </p>

              <div className="mx-auto mt-6 max-w-sm rounded-2xl border border-[#184d39]/10 bg-[#c7db95]/28 px-5 py-4">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#184d39]/48">
                  Mã yêu cầu
                </p>
                <strong className="mt-1 block text-xl tracking-[0.14em] text-[#184d39]">
                  {reservationCode}
                </strong>
              </div>

              <div className="mt-7 grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={reset}
                  className="min-h-12 rounded-full border border-[#184d39]/12 bg-white px-5 text-sm font-bold text-[#184d39] transition hover:bg-[#c7db95]/20"
                >
                  Đặt thêm bàn khác
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="min-h-12 rounded-full bg-[#184d39] px-5 text-sm font-bold text-[#fffced] transition hover:bg-[#123e2e]"
                >
                  Xong
                </button>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="px-5 py-6 sm:px-7 sm:py-7">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-bold text-[#184d39]">
                Tên của bạn
                <input
                  value={draft.customer_name}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      customer_name: event.target.value,
                    }))
                  }
                  minLength={2}
                  maxLength={80}
                  autoComplete="name"
                  placeholder="Ví dụ: Nguyễn An"
                  required
                  className="h-12 rounded-2xl border border-[#184d39]/12 bg-white px-4 font-medium text-[#184d39] outline-none transition placeholder:text-[#184d39]/30 focus:border-[#184d39]/35 focus:ring-4 focus:ring-[#c7db95]/35"
                />
              </label>

              <label className="grid gap-2 text-sm font-bold text-[#184d39]">
                Số điện thoại
                <input
                  value={draft.phone}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, phone: event.target.value }))
                  }
                  inputMode="tel"
                  autoComplete="tel"
                  minLength={8}
                  maxLength={24}
                  placeholder="Ví dụ: 09xx xxx xxx"
                  required
                  className="h-12 rounded-2xl border border-[#184d39]/12 bg-white px-4 font-medium text-[#184d39] outline-none transition placeholder:text-[#184d39]/30 focus:border-[#184d39]/35 focus:ring-4 focus:ring-[#c7db95]/35"
                />
              </label>

              <label className="grid gap-2 text-sm font-bold text-[#184d39]">
                Ngày ghé
                <span className="relative">
                  <CalendarCheck2
                    size={17}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#184d39]/45"
                  />
                  <input
                    type="date"
                    min={minDate}
                    value={draft.reservation_date}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        reservation_date: event.target.value,
                      }))
                    }
                    required
                    className="h-12 w-full rounded-2xl border border-[#184d39]/12 bg-white pl-11 pr-4 font-medium text-[#184d39] outline-none transition focus:border-[#184d39]/35 focus:ring-4 focus:ring-[#c7db95]/35"
                  />
                </span>
              </label>

              <label className="grid gap-2 text-sm font-bold text-[#184d39]">
                Giờ dự kiến
                <span className="relative">
                  <Clock3
                    size={17}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#184d39]/45"
                  />
                  <input
                    type="time"
                    value={draft.reservation_time}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        reservation_time: event.target.value,
                      }))
                    }
                    required
                    className="h-12 w-full rounded-2xl border border-[#184d39]/12 bg-white pl-11 pr-4 font-medium text-[#184d39] outline-none transition focus:border-[#184d39]/35 focus:ring-4 focus:ring-[#c7db95]/35"
                  />
                </span>
              </label>

              <label className="grid gap-2 text-sm font-bold text-[#184d39]">
                Số khách
                <span className="relative">
                  <Users
                    size={17}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#184d39]/45"
                  />
                  <select
                    value={draft.guest_count}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        guest_count: Number(event.target.value),
                      }))
                    }
                    className="h-12 w-full appearance-none rounded-2xl border border-[#184d39]/12 bg-white pl-11 pr-4 font-medium text-[#184d39] outline-none transition focus:border-[#184d39]/35 focus:ring-4 focus:ring-[#c7db95]/35"
                  >
                    {Array.from({ length: 12 }, (_, index) => index + 1).map((count) => (
                      <option key={count} value={count}>
                        {count} {count === 1 ? "khách" : "khách"}
                      </option>
                    ))}
                    <option value={15}>13–15 khách</option>
                    <option value={20}>16–20 khách</option>
                    <option value={30}>21–30 khách</option>
                  </select>
                </span>
              </label>

              <label className="grid gap-2 text-sm font-bold text-[#184d39]">
                Khu vực mong muốn
                <span className="relative">
                  <MapPin
                    size={17}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#184d39]/45"
                  />
                  <select
                    value={draft.seating_preference}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        seating_preference: event.target
                          .value as ReservationDraft["seating_preference"],
                      }))
                    }
                    className="h-12 w-full appearance-none rounded-2xl border border-[#184d39]/12 bg-white pl-11 pr-4 font-medium text-[#184d39] outline-none transition focus:border-[#184d39]/35 focus:ring-4 focus:ring-[#c7db95]/35"
                  >
                    <option value="any">Không yêu cầu</option>
                    <option value="garden">Sân vườn</option>
                    <option value="indoor">Trong nhà</option>
                  </select>
                </span>
              </label>
            </div>

            <label className="mt-4 grid gap-2 text-sm font-bold text-[#184d39]">
              Ghi chú
              <textarea
                value={draft.note}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, note: event.target.value }))
                }
                maxLength={400}
                rows={3}
                placeholder="Ví dụ: Có em bé, cần bàn yên tĩnh, sinh nhật nhỏ..."
                className="min-h-24 resize-y rounded-2xl border border-[#184d39]/12 bg-white px-4 py-3 font-medium leading-6 text-[#184d39] outline-none transition placeholder:text-[#184d39]/30 focus:border-[#184d39]/35 focus:ring-4 focus:ring-[#c7db95]/35"
              />
            </label>

            <label className="sr-only" aria-hidden="true">
              Website
              <input
                tabIndex={-1}
                autoComplete="off"
                value={draft.website}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, website: event.target.value }))
                }
              />
            </label>

            {error ? (
              <div className="mt-4 rounded-2xl border border-[#b74234]/18 bg-[#b74234]/7 px-4 py-3 text-sm font-semibold leading-6 text-[#9c352b]">
                {error}
              </div>
            ) : null}

            <div className="mt-6 rounded-2xl bg-[#c7db95]/24 px-4 py-3 text-xs leading-5 text-[#184d39]/62">
              Sweet Pea sẽ dùng thông tin này để xử lý yêu cầu giữ bàn. Bàn chỉ được
              giữ sau khi tiệm xác nhận lại với bạn.
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#184d39] px-6 text-sm font-extrabold text-[#fffced] shadow-[0_12px_28px_rgba(24,77,57,0.16)] transition hover:bg-[#123e2e] disabled:cursor-wait disabled:opacity-65"
            >
              {submitting ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <CalendarCheck2 size={18} />
              )}
              {submitting ? "Đang gửi yêu cầu..." : "Gửi yêu cầu đặt bàn"}
            </button>
          </form>
        )}
      </div>
    </div>,
    document.body,
  );
}

export function ReservationButton({
  variant = "primary",
  className,
}: ReservationButtonProps) {
  const [open, setOpen] = useState(false);

  const button =
    variant === "icon" ? (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Đặt bàn"
        className={cn(
          "focus-ring grid h-11 w-11 place-items-center rounded-full bg-[#c7db95] text-[#184d39] shadow-sm transition hover:bg-[#d2e5a2]",
          className,
        )}
      >
        <CalendarCheck2 size={19} />
      </button>
    ) : variant === "menu" ? (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "focus-ring flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#c7db95] px-5 font-bold text-[#184d39] transition hover:bg-[#d2e5a2]",
          className,
        )}
      >
        <CalendarCheck2 size={18} />
        Đặt bàn
      </button>
    ) : (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "focus-ring min-h-11 items-center gap-2 rounded-full bg-[#c7db95] px-5 text-sm font-extrabold text-[#184d39] shadow-sm transition hover:bg-[#d2e5a2]",
          className,
        )}
      >
        <CalendarCheck2 size={17} />
        Đặt bàn
      </button>
    );

  return (
    <>
      {button}
      <ReservationDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}
