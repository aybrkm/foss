"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { label: "Panel", href: "/dashboard" },
  { label: "Varlıklar", href: "/assets" },
  { label: "Yükümlülükler", href: "/obligations" },
  { label: "Hatırlatmalar", href: "/reminders" },
  { label: "Günlük", href: "/journal" },
  { label: "Yerleşimler", href: "/layouts" },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap items-center gap-2 text-sm text-slate-300">
      {links.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-full px-4 py-2 transition ${
              isActive
                ? "bg-white text-black"
                : "border border-transparent hover:border-white/30 hover:text-white"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
