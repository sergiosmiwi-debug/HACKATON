"use client";

import { useState } from "react";
import {
  ArrowLeft,
  List,
  MapPin,
  CameraPlus,
  Image as ImageIcon,
  Camera,
  Sun,
  FileText,
  MagnifyingGlass,
  WhatsappLogo,
  CaretRight,
  Package,
  ScanBarcode,
  ChartBar,
} from "@phosphor-icons/react";
import { ScanCard } from "@/components/ScanCard";

type Tab = "ticket" | "refri";
type NavTab = "inventario" | "escanear" | "resumen";

export default function EscanearPage() {
  const [activeTab, setActiveTab] = useState<Tab>("ticket");
  const [navTab, setNavTab] = useState<NavTab>("escanear");

  return (
    <main
      className="min-h-screen flex flex-col"
      style={{ background: "var(--color-bg)", fontFamily: "var(--font-body)" }}
    >
      {/* ── HEADER con degradado ── */}
      <div
        className="relative overflow-hidden px-6 pb-14 pt-5"
        style={{ background: "var(--gradient-header)" }}
      >
        {/* Nav */}
        <div className="flex items-center justify-between mb-5">
          <button className="text-white/80 hover:text-white transition-colors">
            <ArrowLeft size={22} />
          </button>
          <button className="text-white/80 hover:text-white transition-colors">
            <List size={22} />
          </button>
        </div>

        {/* Perfil / título */}
        <div className="flex flex-col items-center gap-2">
          {/* Avatar placeholder */}
          <div className="w-[68px] h-[68px] rounded-full bg-white/20 border-[2.5px] border-white/40 flex items-center justify-center">
            <ScanBarcode size={32} className="text-white/60" />
          </div>

          <h1
            className="text-white leading-none"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "36px",
              fontWeight: 300,
              letterSpacing: "-0.3px",
            }}
          >
            Esc<em className="italic text-white/75">anear</em>
          </h1>

          <p
            className="flex items-center gap-1 text-white/50"
            style={{ fontSize: "10px", letterSpacing: "0.1em" }}
          >
            <MapPin size={11} />
            Tu inventario
          </p>

          {/* Stats */}
          <div className="flex items-center gap-6 mt-3">
            {[
              { n: "12", l: "Tickets" },
              { n: "3", l: "Esta semana" },
              { n: "47", l: "Productos" },
            ].map((s, i, arr) => (
              <div key={s.l} className="flex items-center gap-6">
                <div className="text-center">
                  <p
                    className="text-white leading-none"
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "22px",
                      fontWeight: 400,
                    }}
                  >
                    {s.n}
                  </p>
                  <p
                    className="text-white/45 mt-0.5"
                    style={{
                      fontSize: "9px",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                    }}
                  >
                    {s.l}
                  </p>
                </div>
                {i < arr.length - 1 && (
                  <div className="w-px h-6 bg-white/15" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Ola de transición */}
        <div
          className="absolute bottom-[-2px] left-0 right-0 h-12 rounded-t-[50%]"
          style={{ background: "var(--color-bg)" }}
        />
      </div>

      {/* ── BODY ── */}
      <div className="flex-1 flex flex-col gap-3.5 px-4 pt-1.5 pb-4">

        {/* Segment control */}
        <div
          className="flex rounded-2xl p-1 gap-1"
          style={{ background: "#ece8df" }}
        >
          {(["ticket", "refri"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className="flex-1 h-9 rounded-xl text-[13px] font-medium transition-all duration-200 tracking-wide"
              style={{
                fontFamily: "var(--font-body)",
                letterSpacing: "0.03em",
                background:
                  activeTab === t ? "var(--color-forest)" : "transparent",
                color:
                  activeTab === t ? "var(--color-bg)" : "var(--color-text-muted)",
              }}
            >
              {t === "ticket" ? "Ticket de compra" : "Foto del refri"}
            </button>
          ))}
        </div>

        {/* Section label */}
        <h2
          className="px-0.5"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "22px",
            fontWeight: 400,
            color: "var(--color-text-primary)",
          }}
        >
          Elige cómo{" "}
          <em className="italic" style={{ color: "#5b2da8" }}>
            subir
          </em>
        </h2>

        {/* Card grande — acción principal */}
        <ScanCard
          variant="violet"
          icon={<CameraPlus size={26} />}
          title="Subir foto"
          titleItalic="del ticket"
          subtitle="Detectamos productos automáticamente"
          rankNumber={1}
          size="large"
        />

        {/* Cards pequeñas — galería y cámara */}
        <div className="grid grid-cols-2 gap-2.5">
          <ScanCard
            variant="green"
            icon={<ImageIcon size={24} />}
            title="Desde"
            titleItalic="galería"
            subtitle="Fotos guardadas"
            size="small"
          />
          <ScanCard
            variant="amber"
            icon={<Camera size={24} />}
            title="Usar"
            titleItalic="cámara"
            subtitle="Foto directa"
            size="small"
          />
        </div>

        {/* Tips */}
        <div className="flex gap-2">
          {[
            { icon: <Sun size={15} />, label: "Buena luz", color: "var(--color-violet-bg)", iconColor: "var(--color-violet)" },
            { icon: <FileText size={15} />, label: "Sin dobleces", color: "var(--color-forest-light)", iconColor: "var(--color-forest-mid)" },
            { icon: <MagnifyingGlass size={15} />, label: "Completo", color: "var(--color-amber-bg)", iconColor: "var(--color-amber)" },
          ].map((tip) => (
            <div
              key={tip.label}
              className="flex-1 rounded-2xl border flex flex-col items-center gap-1.5 py-2.5 px-2 text-center"
              style={{
                background: "var(--color-surface)",
                borderColor: "var(--color-border-soft)",
              }}
            >
              <div
                className="w-[30px] h-[30px] rounded-[10px] flex items-center justify-center"
                style={{ background: tip.color }}
              >
                <span style={{ color: tip.iconColor }}>{tip.icon}</span>
              </div>
              <p
                className="leading-tight"
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "10px",
                  fontWeight: 400,
                  color: "var(--color-text-muted)",
                }}
              >
                {tip.label}
              </p>
            </div>
          ))}
        </div>

        {/* WhatsApp field */}
        <div
          className="rounded-2xl border flex items-center gap-3 px-4 py-3.5"
          style={{
            background: "var(--color-surface)",
            borderColor: "var(--color-border-soft)",
          }}
        >
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: "var(--color-forest-light)" }}
          >
            <WhatsappLogo
              size={18}
              style={{ color: "var(--color-forest-mid)" }}
            />
          </div>
          <div className="flex-1">
            <div
              className="flex items-center gap-1.5 mb-0.5"
              style={{ fontSize: "9px", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-text-muted)" }}
            >
              <span style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>WhatsApp</span>
              <span
                className="rounded px-1 py-px"
                style={{
                  fontSize: "8px",
                  background: "var(--color-forest-light)",
                  color: "var(--color-forest-mid)",
                  fontWeight: 500,
                }}
              >
                Opcional
              </span>
            </div>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "14px",
                fontWeight: 300,
                color: "var(--color-text-faint)",
                letterSpacing: "0.02em",
              }}
            >
              +51 999 999 999
            </p>
          </div>
          <CaretRight size={15} style={{ color: "var(--color-border)" }} />
        </div>
      </div>

      {/* ── TAB BAR ── */}
      <nav
        className="mx-4 mb-4 rounded-[20px] border p-1.5 flex"
        style={{
          background: "var(--color-surface)",
          borderColor: "var(--color-border)",
        }}
      >
        {(
          [
            { id: "inventario", label: "Inventario", icon: <Package size={19} /> },
            { id: "escanear", label: "Escanear", icon: <ScanBarcode size={19} />, pip: true },
            { id: "resumen", label: "Resumen", icon: <ChartBar size={19} /> },
          ] as { id: NavTab; label: string; icon: React.ReactNode; pip?: boolean }[]
        ).map((tab) => {
          const active = navTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setNavTab(tab.id)}
              className="flex-1 flex flex-col items-center gap-0.5 py-2 rounded-2xl transition-all duration-150"
              style={{
                background: active ? "var(--color-forest)" : "transparent",
              }}
            >
              <span
                style={{ color: active ? "var(--color-bg)" : "var(--color-text-faint)" }}
              >
                {tab.icon}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "9px",
                  fontWeight: 500,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: active ? "rgba(245,242,235,0.7)" : "var(--color-text-faint)",
                }}
              >
                {tab.label}
              </span>
              {tab.pip && active && (
                <span
                  className="w-1 h-1 rounded-full"
                  style={{ background: "#8dc89e" }}
                />
              )}
            </button>
          );
        })}
      </nav>
    </main>
  );
}
