"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Snowflake, Camera, ChartBar } from "@phosphor-icons/react";

const tabs = [
  { href: "/",          label: "Inventario", Icon: Snowflake },
  { href: "/scan",      label: "Escanear",   Icon: Camera    },
  { href: "/dashboard", label: "Resumen",    Icon: ChartBar  },
];

export default function BottomNav() {
  const path = usePathname();
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 max-w-md mx-auto flex"
      style={{
        background: "var(--surface)",
        borderTop: "1px solid var(--border-lo)",
      }}
    >
      {tabs.map(({ href, label, Icon }) => {
        const active = path === href;
        return (
          <Link
            key={href}
            href={href}
            className="flex-1 flex flex-col items-center pt-3 pb-6 gap-1"
            style={{
              color: active ? "var(--brand)" : "var(--ink-3)",
              transition: "color 150ms ease",
            }}
          >
            <Icon size={22} weight={active ? "fill" : "regular"} />
            <span style={{ fontSize: 10, fontWeight: 600 }}>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
