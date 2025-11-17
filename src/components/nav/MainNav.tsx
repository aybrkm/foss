"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { label: "OZET", href: "/dashboard" },
  { label: "Varliklar", href: "/assets" },
  { label: "Yukumlulukler", href: "/obligations" },
  { label: "Nakit Aks", href: "/cashflow" },
  { label: "Yatirimlar", href: "/investments" },
  { label: "Isler", href: "/projects" },
  { label: "Hatirlatmalar", href: "/reminders" },
  { label: "Gunluk", href: "/journal" },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap items-center justify-center gap-2 text-base text-slate-200 lg:justify-start">
      {links.map((link) => {
        const isActive = pathname === link.href;
        const isOverview = link.href === "/dashboard";
        const baseInactive = "border border-transparent hover:border-white/30 hover:text-white";
        const overviewInactive =
          "border border-indigo-400/40 bg-indigo-500/20 text-indigo-100 hover:border-indigo-300";
        const className = isActive
          ? "bg-white text-black"
          : isOverview
            ? overviewInactive
            : baseInactive;
        return (
          <Link key={link.href} href={link.href} className={`rounded-full px-4 py-2 transition ${className}`}>
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
