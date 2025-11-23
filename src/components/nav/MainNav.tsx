"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { label: "Özet", href: "/dashboard" },
  { label: "Workspace", href: "/workspace" },
  { label: "Varlıklar", href: "/assets" },
  { label: "Yükümlülükler", href: "/obligations" },
  { label: "Dijital Hesaplar", href: "/digital-accounts" },
  { label: "Nakit Akış", href: "/cashflow" },
  { label: "Yatırımlar", href: "/investments" },
  { label: "Hatırlatmalar", href: "/reminders" },
  { label: "Günlük", href: "/journal" },
];

const accentStyles: Record<string, string> = {
  "/dashboard":
    "border border-indigo-300/60 text-indigo-100 shadow-[0_0_15px_rgba(129,140,248,0.25)] bg-[repeating-linear-gradient(120deg,rgba(129,140,248,0.28)_0,rgba(129,140,248,0.28)_14px,rgba(59,7,100,0.4)_14px,rgba(59,7,100,0.4)_28px)] hover:border-indigo-200 hover:shadow-[0_0_25px_rgba(129,140,248,0.35)]",
  "/workspace":
    "border border-cyan-300/60 text-cyan-100 shadow-[0_0_15px_rgba(34,211,238,0.25)] bg-[repeating-linear-gradient(120deg,rgba(34,211,238,0.22)_0,rgba(34,211,238,0.22)_14px,rgba(8,47,73,0.35)_14px,rgba(8,47,73,0.35)_28px)] hover:border-cyan-200 hover:shadow-[0_0_25px_rgba(34,211,238,0.35)]",
  "/assets":
    "border border-emerald-400/60 text-emerald-100 bg-emerald-900/30 shadow-[0_0_12px_rgba(52,211,153,0.2)] hover:border-emerald-300",
  "/obligations":
    "border border-rose-400/60 text-rose-100 bg-rose-900/25 shadow-[0_0_12px_rgba(244,114,182,0.2)] hover:border-rose-200",
  "/digital-accounts":
    "border border-fuchsia-300/60 text-fuchsia-100 bg-fuchsia-900/25 shadow-[0_0_12px_rgba(217,70,239,0.2)] hover:border-fuchsia-200",
  "/cashflow":
    "border border-amber-300/50 text-amber-100 bg-amber-900/20 hover:border-amber-200",
  "/investments":
    "border border-sky-300/50 text-sky-100 bg-sky-900/20 hover:border-sky-200",
  "/reminders":
    "border border-white/15 text-slate-300 bg-white/5 hover:border-white/30",
  "/journal":
    "border border-white/10 text-slate-400 bg-white/0 hover:border-white/20",
};

const groupSize = 2;
const groupedLinks = Array.from({ length: Math.ceil(links.length / groupSize) }).map((_, index) =>
  links.slice(index * groupSize, index * groupSize + groupSize),
);

export function MainNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap items-center justify-center gap-3 text-base text-slate-200 lg:justify-start">
      {groupedLinks.map((group, groupIndex) => (
        <div key={`group-${groupIndex}`} className="flex items-center gap-2">
          {group.map((link) => {
            const isActive = pathname === link.href;
            const accentStyle = accentStyles[link.href];
            const baseInactive = "border border-transparent hover:border-white/30 hover:text-white";
            const className = isActive
              ? "bg-white text-black"
              : accentStyle
                ? accentStyle
                : baseInactive;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-4 py-2 transition ${className}`}
              >
                {link.label}
              </Link>
            );
          })}
          {groupIndex < groupedLinks.length - 1 && (
            <span
              aria-hidden="true"
              className="ml-3 h-6 w-px bg-white/30 opacity-70"
            />
          )}
        </div>
      ))}
    </nav>
  );
}
