"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package, Scan, ChartBar } from "@phosphor-icons/react";

const LINKS = [
  { href: "/",          label: "Inventario", Icon: Package  },
  { href: "/scan",      label: "Escanear",   Icon: Scan     },
  { href: "/dashboard", label: "Resumen",    Icon: ChartBar },
];

export default function BottomNav() {
  const path = usePathname();
  return (
    <nav style={{ position: "fixed", bottom: 16, left: 0, right: 0, display: "flex", justifyContent: "center", zIndex: 50, pointerEvents: "none" }}>
      <div style={{
        pointerEvents: "all",
        display: "flex",
        gap: 2,
        background: "var(--surface)",
        borderRadius: 99,
        padding: "6px 6px",
        boxShadow: "var(--shadow-nav)",
        border: "1px solid var(--border-lo)",
      }}>
        {LINKS.map(({ href, label, Icon }) => {
          const active = href === "/" ? path === "/" : path.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 3,
                padding: "9px 20px",
                borderRadius: 99,
                background: active ? "var(--brand)" : "transparent",
                color: active ? "var(--brand-text)" : "var(--ink-3)",
                textDecoration: "none",
                transition: "background 180ms ease, color 180ms ease",
                minWidth: 72,
              }}
            >
              <Icon size={20} weight={active ? "fill" : "regular"} />
              <span style={{ fontFamily: "var(--font-body)", fontSize: 9, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
