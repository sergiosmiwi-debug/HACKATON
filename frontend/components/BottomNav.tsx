"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Snowflake, Camera, ChartBar } from "@phosphor-icons/react";

const tabs = [
  { href: "/", label: "Inventario", Icon: Snowflake },
  { href: "/scan", label: "Escanear", Icon: Camera },
  { href: "/dashboard", label: "Resumen", Icon: ChartBar },
];

export default function BottomNav() {
  const path = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-slate-200">
      <div className="flex">
        {tabs.map((tab) => {
          const active = path === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex-1 flex flex-col items-center pt-3 pb-5 gap-1 transition-colors ${
                active ? "text-green-700" : "text-slate-400"
              }`}
            >
              <tab.Icon size={22} weight={active ? "fill" : "regular"} />
              <span className="text-[10px] font-semibold tracking-wide">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
