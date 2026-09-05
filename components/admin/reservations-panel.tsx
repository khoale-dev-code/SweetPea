"use client";

import {
  CalendarCheck2,
  Check,
  CheckCircle2,
  Clock3,
  Filter,
  MapPin,
  Phone,
  RefreshCw,
  RotateCcw,
  Search,
  Users,
  X,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  TableReservation,
  TableReservationStatus,
} from "@/lib/types";

type ReservationFilter =
  | "pending"
  | "today"
  | "confirmed"
  | "upcoming"
  | "cancelled"
  | "all";

type ReservationFeed = {
  reservations: TableReservation[];
  loading: boolean;
  error: string;
  newCount: number;
  refresh: () => Promise<void>;
  lastNewReservation: TableReservation | null;
  clearToast: () => void;
};

function localDateInputValue(date = new Date()) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

function dateLabel(value: string) {
  const parsed = new Date(`${value}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;

  return new Intl.DateTimeFormat("vi-VN", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parsed);
}

function createdLabel(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
}

function seatingLabel(value: TableReservation["seating_preference"]) {
  if (value === "garden") return "Sân vườn";
  if (value === "indoor") return "Trong nhà";
  return "Không yêu cầu";
}

function statusMeta(status: TableReservationStatus) {
  if (status === "confirmed") {
    return {
      label: "Đã xác nhận",
      className: "bg-[#c7db95]/65 text-[#184d39]",
    };
  }

  if (status === "completed") {
    return {
      label: "Hoàn tất",
      className: "bg-[#184d39] text-white",
    };
  }

  if (status === "cancelled") {
    return {
      label: "Đã hủy",
      className: "bg-[#b74234]/10 text-[#9d3a30]",
    };
  }

  return {
    label: "Chờ xác nhận",
    className: "bg-[#fff0bf] text-[#7a5c14]",
  };
}

async function reservationApi<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });

  const body = (await response.json().catch(() => ({}))) as T & {
    error?: string;
  };

  if (!response.ok) {
    throw new Error(body.error || "Không thể tải yêu cầu đặt bàn.");
  }

  return body;
}

export function useReservationAdminFeed(enabled: boolean): ReservationFeed {
  const [reservations, setReservations] = useState<TableReservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastNewReservation, setLastNewReservation] =
    useState<TableReservation | null>(null);

  const initializedRef = useRef(false);
  const seenIdsRef = useRef<Set<string>>(new Set());
  const inFlightRef = useRef(false);

  const fetchReservations = useCallback(async () => {
    if (!enabled || inFlightRef.current) return;

    inFlightRef.current = true;
    if (!initializedRef.current) setLoading(true);

    try {
      const result = await reservationApi<{ reservations: TableReservation[] }>(
        "/api/admin/reservations",
      );

      const rows = result.reservations || [];

      if (!initializedRef.current) {
        seenIdsRef.current = new Set(rows.map((row) => row.id));
        initializedRef.current = true;
      } else {
        const newcomer = rows.find(
          (row) =>
            row.status === "pending" && !seenIdsRef.current.has(row.id),
        );

        if (newcomer) {
          setLastNewReservation(newcomer);
          if (typeof navigator !== "undefined" && "vibrate" in navigator) {
            navigator.vibrate?.(120);
          }
        }

        rows.forEach((row) => seenIdsRef.current.add(row.id));
      }

      setReservations(rows);
      setError("");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Không thể tải yêu cầu đặt bàn.",
      );
    } finally {
      setLoading(false);
      inFlightRef.current = false;
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    void fetchReservations();
    const timer = window.setInterval(() => {
      void fetchReservations();
    }, 10_000);

    return () => window.clearInterval(timer);
  }, [enabled, fetchReservations]);

  const newCount = reservations.filter(
    (reservation) => reservation.status === "pending",
  ).length;

  return {
    reservations,
    loading,
    error,
    newCount,
    refresh: fetchReservations,
    lastNewReservation,
    clearToast: () => setLastNewReservation(null),
  };
}

export function ReservationNewToast({
  reservation,
  onOpen,
  onDismiss,
}: {
  reservation: TableReservation | null;
  onOpen: () => void;
  onDismiss: () => void;
}) {
  if (!reservation) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[80] w-[min(calc(100vw-2rem),24rem)] overflow-hidden rounded-[1.5rem] border border-[#184d39]/12 bg-[#fffced] shadow-[0_24px_70px_rgba(24,77,57,0.22)] sm:bottom-6 sm:right-6">
      <div className="flex items-start gap-3 bg-[#c7db95] px-4 py-4">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#fffced] text-[#184d39]">
          <CalendarCheck2 size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#184d39]/55">
            Có khách vừa đặt bàn
          </p>
          <h3 className="mt-1 truncate text-sm font-extrabold text-[#184d39]">
            {reservation.customer_name}
          </h3>
          <p className="mt-1 text-xs leading-5 text-[#184d39]/62">
            {reservation.guest_count} khách · {dateLabel(reservation.reservation_date)} ·{" "}
            {reservation.reservation_time.slice(0, 5)}
          </p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[#184d39]/55 transition hover:bg-white/50 hover:text-[#184d39]"
          aria-label="Ẩn thông báo"
        >
          <X size={15} />
        </button>
      </div>

      <div className="p-3">
        <button
          type="button"
          onClick={onOpen}
          className="min-h-10 w-full rounded-xl bg-[#184d39] px-4 text-xs font-extrabold text-[#fffced] transition hover:bg-[#123e2e]"
        >
          Mở yêu cầu đặt bàn
        </button>
      </div>
    </div>
  );
}

export function ReservationsPanel({
  reservations,
  loading,
  error,
  refresh,
}: {
  reservations: TableReservation[];
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
}) {
  const [filter, setFilter] = useState<ReservationFilter>("pending");
  const [query, setQuery] = useState("");
  const [updatingId, setUpdatingId] = useState("");
  const [actionError, setActionError] = useState("");

  const today = localDateInputValue();

  const counts = useMemo(() => {
    return {
      pending: reservations.filter((row) => row.status === "pending").length,
      today: reservations.filter(
        (row) =>
          row.reservation_date === today &&
          row.status !== "cancelled" &&
          row.status !== "completed",
      ).length,
      confirmed: reservations.filter((row) => row.status === "confirmed").length,
      upcoming: reservations.filter(
        (row) =>
          row.reservation_date >= today &&
          row.status !== "cancelled" &&
          row.status !== "completed",
      ).length,
    };
  }, [reservations, today]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("vi");

    return [...reservations]
      .filter((row) => {
        if (
          needle &&
          !`${row.customer_name} ${row.phone} ${row.note || ""}`
            .toLocaleLowerCase("vi")
            .includes(needle)
        ) {
          return false;
        }

        if (filter === "pending") return row.status === "pending";
        if (filter === "confirmed") return row.status === "confirmed";
        if (filter === "cancelled") return row.status === "cancelled";
        if (filter === "today") {
          return (
            row.reservation_date === today &&
            row.status !== "cancelled" &&
            row.status !== "completed"
          );
        }
        if (filter === "upcoming") {
          return (
            row.reservation_date >= today &&
            row.status !== "cancelled" &&
            row.status !== "completed"
          );
        }

        return true;
      })
      .sort((a, b) => {
        const aKey = `${a.reservation_date}T${a.reservation_time}`;
        const bKey = `${b.reservation_date}T${b.reservation_time}`;

        if (filter === "all" || filter === "cancelled") {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }

        return aKey.localeCompare(bKey);
      });
  }, [filter, query, reservations, today]);

  async function updateStatus(
    reservation: TableReservation,
    status: TableReservationStatus,
  ) {
    if (updatingId) return;

    setUpdatingId(reservation.id);
    setActionError("");

    try {
      await reservationApi("/api/admin/reservations", {
        method: "PATCH",
        body: JSON.stringify({ id: reservation.id, status }),
      });
      await refresh();
    } catch (requestError) {
      setActionError(
        requestError instanceof Error
          ? requestError.message
          : "Không thể cập nhật trạng thái.",
      );
    } finally {
      setUpdatingId("");
    }
  }

  const filters: Array<[ReservationFilter, string, number | null]> = [
    ["pending", "Chờ xác nhận", counts.pending],
    ["today", "Hôm nay", counts.today],
    ["upcoming", "Sắp tới", counts.upcoming],
    ["confirmed", "Đã xác nhận", counts.confirmed],
    ["cancelled", "Đã hủy", null],
    ["all", "Tất cả", reservations.length],
  ];

  return (
    <section
      className="mt-5 overflow-hidden rounded-[1.8rem] border border-[#184d39]/10 bg-[#fffced] shadow-[0_16px_50px_rgba(39,65,51,0.045)]"
      data-reservations-admin-version="3.6"
    >
      <div className="border-b border-[#184d39]/10 px-4 py-5 sm:px-6 lg:px-7">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#c7db95] text-[#184d39]">
                <CalendarCheck2 size={19} />
              </span>
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#184d39]/48">
                  Tiếp nhận khách
                </p>
                <h2 className="mt-0.5 text-xl font-extrabold text-[#184d39] sm:text-2xl">
                  Yêu cầu đặt bàn
                </h2>
              </div>
            </div>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#184d39]/58">
              Yêu cầu mới tự xuất hiện tại đây. Xác nhận sau khi đã kiểm tra bàn
              trống và liên hệ với khách.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void refresh()}
            disabled={loading}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-[#184d39]/12 bg-white px-5 text-sm font-extrabold text-[#184d39] transition hover:bg-[#c7db95]/24 disabled:opacity-60 sm:w-fit"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Làm mới
          </button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            icon={<Clock3 size={17} />}
            label="Chờ xác nhận"
            value={counts.pending}
            note="cần xử lý"
          />
          <MetricCard
            icon={<CalendarCheck2 size={17} />}
            label="Hôm nay"
            value={counts.today}
            note="lượt khách"
          />
          <MetricCard
            icon={<CheckCircle2 size={17} />}
            label="Đã xác nhận"
            value={counts.confirmed}
            note="đang giữ bàn"
          />
          <MetricCard
            icon={<Users size={17} />}
            label="Sắp tới"
            value={counts.upcoming}
            note="yêu cầu"
          />
        </div>
      </div>

      <div className="border-b border-[#184d39]/8 bg-[#c7db95]/12 px-4 py-3 sm:px-6 lg:px-7">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <label className="relative block w-full xl:max-w-sm">
            <Search
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#184d39]/42"
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm tên hoặc số điện thoại..."
              className="h-11 w-full rounded-2xl border border-[#184d39]/10 bg-[#fffced] pl-10 pr-4 text-sm font-medium text-[#184d39] outline-none placeholder:text-[#184d39]/35 focus:border-[#184d39]/30"
            />
          </label>

          <div className="admin-scrollbar flex gap-2 overflow-x-auto pb-1 xl:pb-0">
            {filters.map(([value, label, count]) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-xl px-3 text-xs font-extrabold transition ${
                  filter === value
                    ? "bg-[#184d39] text-white"
                    : "border border-[#184d39]/10 bg-[#fffced] text-[#184d39]/62 hover:bg-white"
                }`}
              >
                {value === "pending" ? <Filter size={13} /> : null}
                {label}
                {count !== null ? (
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[9px] ${
                      filter === value ? "bg-white/14" : "bg-[#c7db95]/45"
                    }`}
                  >
                    {count}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </div>
      </div>

      {(error || actionError) && (
        <div className="border-b border-[#b74234]/12 bg-[#b74234]/6 px-5 py-3 text-sm font-semibold text-[#9d3a30] sm:px-6">
          {actionError || error}
        </div>
      )}

      <div className="p-4 sm:p-5 lg:p-6">
        {loading && !reservations.length ? (
          <div className="grid min-h-56 place-items-center rounded-[1.5rem] border border-dashed border-[#184d39]/12 bg-[#c7db95]/10 text-center">
            <div>
              <RefreshCw className="mx-auto animate-spin text-[#184d39]/55" size={22} />
              <p className="mt-3 text-sm font-bold text-[#184d39]/60">
                Đang tải yêu cầu đặt bàn...
              </p>
            </div>
          </div>
        ) : filtered.length ? (
          <div className="grid gap-3 xl:grid-cols-2">
            {filtered.map((reservation) => (
              <ReservationCard
                key={reservation.id}
                reservation={reservation}
                updating={updatingId === reservation.id}
                onStatus={updateStatus}
              />
            ))}
          </div>
        ) : (
          <div className="grid min-h-56 place-items-center rounded-[1.5rem] border border-dashed border-[#184d39]/14 bg-[#c7db95]/12 p-8 text-center">
            <div>
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#c7db95] text-[#184d39]">
                <CalendarCheck2 size={20} />
              </span>
              <h3 className="mt-4 font-extrabold text-[#184d39]">
                Chưa có yêu cầu phù hợp
              </h3>
              <p className="mt-1 text-sm text-[#184d39]/50">
                Khi khách đặt bàn, thông tin sẽ xuất hiện ở đây.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function MetricCard({
  icon,
  label,
  value,
  note,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  note: string;
}) {
  return (
    <div className="rounded-2xl border border-[#184d39]/8 bg-white/55 px-4 py-3">
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#c7db95] text-[#184d39]">
          {icon}
        </span>
        <div>
          <p className="text-[9px] font-extrabold uppercase tracking-[0.11em] text-[#184d39]/45">
            {label}
          </p>
          <div className="mt-0.5 flex items-baseline gap-2">
            <strong className="text-xl text-[#184d39]">{value}</strong>
            <span className="text-[10px] font-semibold text-[#184d39]/42">{note}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReservationCard({
  reservation,
  updating,
  onStatus,
}: {
  reservation: TableReservation;
  updating: boolean;
  onStatus: (
    reservation: TableReservation,
    status: TableReservationStatus,
  ) => Promise<void>;
}) {
  const meta = statusMeta(reservation.status);

  return (
    <article className="rounded-[1.45rem] border border-[#184d39]/10 bg-white/55 p-4 transition hover:border-[#184d39]/18 hover:shadow-[0_12px_32px_rgba(24,77,57,0.055)] sm:p-5">
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#c7db95] text-[#184d39]">
          <Users size={18} />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-base font-extrabold text-[#184d39]">
              {reservation.customer_name}
            </h3>
            <span
              className={`rounded-full px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.08em] ${meta.className}`}
            >
              {meta.label}
            </span>
          </div>

          <a
            href={`tel:${reservation.phone.replace(/[^0-9+]/g, "")}`}
            className="mt-1 inline-flex items-center gap-1.5 text-xs font-bold text-[#184d39]/58 transition hover:text-[#184d39]"
          >
            <Phone size={12} />
            {reservation.phone}
          </a>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl bg-[#c7db95]/18 p-3 sm:grid-cols-4">
        <Info label="Ngày" value={dateLabel(reservation.reservation_date)} />
        <Info label="Giờ" value={reservation.reservation_time.slice(0, 5)} />
        <Info label="Số khách" value={`${reservation.guest_count} khách`} />
        <Info label="Khu vực" value={seatingLabel(reservation.seating_preference)} />
      </div>

      {reservation.note ? (
        <div className="mt-3 rounded-2xl border border-[#184d39]/8 bg-[#fffced] px-3.5 py-3">
          <p className="text-[9px] font-extrabold uppercase tracking-[0.11em] text-[#184d39]/42">
            Ghi chú của khách
          </p>
          <p className="mt-1 text-xs leading-5 text-[#184d39]/62">
            {reservation.note}
          </p>
        </div>
      ) : null}

      <div className="mt-4 flex flex-col gap-3 border-t border-[#184d39]/8 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[10px] font-semibold text-[#184d39]/42">
          Gửi lúc {createdLabel(reservation.created_at)} · #
          {reservation.id.slice(0, 8).toUpperCase()}
        </p>

        <div className="flex flex-wrap gap-2">
          {reservation.status === "pending" ? (
            <>
              <button
                type="button"
                disabled={updating}
                onClick={() => void onStatus(reservation, "confirmed")}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-[#184d39] px-3 text-xs font-extrabold text-white transition hover:bg-[#123e2e] disabled:opacity-50"
              >
                <Check size={14} /> Xác nhận
              </button>
              <button
                type="button"
                disabled={updating}
                onClick={() => void onStatus(reservation, "cancelled")}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-[#b74234]/16 bg-white px-3 text-xs font-extrabold text-[#9d3a30] transition hover:bg-[#b74234]/6 disabled:opacity-50"
              >
                <X size={14} /> Hủy
              </button>
            </>
          ) : null}

          {reservation.status === "confirmed" ? (
            <>
              <button
                type="button"
                disabled={updating}
                onClick={() => void onStatus(reservation, "completed")}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-[#184d39] px-3 text-xs font-extrabold text-white transition hover:bg-[#123e2e] disabled:opacity-50"
              >
                <CheckCircle2 size={14} /> Hoàn tất
              </button>
              <button
                type="button"
                disabled={updating}
                onClick={() => void onStatus(reservation, "cancelled")}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-[#b74234]/16 bg-white px-3 text-xs font-extrabold text-[#9d3a30] transition hover:bg-[#b74234]/6 disabled:opacity-50"
              >
                <X size={14} /> Hủy
              </button>
            </>
          ) : null}

          {reservation.status === "cancelled" ||
          reservation.status === "completed" ? (
            <button
              type="button"
              disabled={updating}
              onClick={() => void onStatus(reservation, "pending")}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-[#184d39]/12 bg-white px-3 text-xs font-extrabold text-[#184d39] transition hover:bg-[#c7db95]/22 disabled:opacity-50"
            >
              <RotateCcw size={13} /> Mở lại
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[9px] font-extrabold uppercase tracking-[0.1em] text-[#184d39]/40">
        {label}
      </p>
      <p className="mt-1 line-clamp-2 text-xs font-extrabold leading-5 text-[#184d39]">
        {value}
      </p>
    </div>
  );
}
