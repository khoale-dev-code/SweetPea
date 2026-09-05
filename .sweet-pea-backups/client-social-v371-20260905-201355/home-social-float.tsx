const socialLinks = [
  {
    label: "Zalo",
    description: "Nhắn Zalo cho Sweet Pea",
    href: "https://zalo.me/0328243949",
    type: "zalo",
  },
  {
    label: "Facebook",
    description: "Xem Facebook Sweet Pea",
    href: "https://www.facebook.com/profile.php?id=100066603590627",
    type: "facebook",
  },
] as const;

export function HomeSocialFloat() {
  return (
    <aside
      aria-label="Kết nối với Sweet Pea"
      data-home-social-version="3.7"
      className="
        fixed z-40
        right-3 bottom-[92px]
        flex flex-col gap-2.5

        sm:right-4 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2
        lg:right-5
      "
    >
      {socialLinks.map((item) => (
        <a
          key={item.type}
          href={item.href}
          target="_blank"
          rel="noreferrer"
          aria-label={item.description}
          title={item.description}
          className="
            group relative flex h-[54px] w-[54px] items-center justify-center
            rounded-full border border-[#e7aa49]
            bg-[#fffced]
            shadow-[0_9px_28px_rgba(24,77,57,0.12)]
            transition-all duration-300
            hover:-translate-y-0.5 hover:scale-[1.045]
            hover:shadow-[0_14px_34px_rgba(24,77,57,0.17)]
            focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#c7db95]/60

            sm:h-[58px] sm:w-[58px]
          "
        >
          <span
            aria-hidden="true"
            className="
              pointer-events-none absolute inset-[4px] rounded-full
              border border-[#184d39]/[0.035]
            "
          />

          {item.type === "zalo" ? (
            <span
              aria-hidden="true"
              className="
                grid h-9 w-9 place-items-center rounded-full
                bg-[#0788e8] text-[10px] font-black tracking-[-0.04em] text-white
                shadow-[inset_0_-2px_4px_rgba(0,0,0,0.08)]
                sm:h-10 sm:w-10 sm:text-[11px]
              "
            >
              Zalo
            </span>
          ) : (
            <span
              aria-hidden="true"
              className="
                grid h-9 w-9 place-items-center rounded-full
                bg-[#1877f2] text-white
                shadow-[inset_0_-2px_4px_rgba(0,0,0,0.08)]
                sm:h-10 sm:w-10
              "
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-[22px] w-[22px] sm:h-6 sm:w-6"
              >
                <path d="M13.72 21v-8.2h2.75l.41-3.2h-3.16V7.56c0-.93.26-1.56 1.59-1.56H17V3.15c-.29-.04-1.29-.12-2.45-.12-2.42 0-4.08 1.48-4.08 4.2V9.6H7.73v3.2h2.74V21h3.25Z" />
              </svg>
            </span>
          )}

          <span
            className="
              pointer-events-none absolute right-[calc(100%+10px)] top-1/2
              hidden -translate-y-1/2 whitespace-nowrap
              rounded-full border border-[#184d39]/10
              bg-[#184d39] px-3 py-2
              text-[11px] font-bold text-[#fffced]
              opacity-0 shadow-lg
              transition-all duration-200
              group-hover:-translate-x-1 group-hover:opacity-100
              group-focus-visible:-translate-x-1 group-focus-visible:opacity-100

              lg:block
            "
          >
            {item.label}
          </span>
        </a>
      ))}
    </aside>
  );
}
