"use client";
import React from "react";

type CardVariant = "violet" | "green" | "amber";

interface ScanCardProps {
  variant: CardVariant;
  icon: React.ReactNode;
  title: string;
  titleItalic?: string;
  subtitle: string;
  rankNumber?: number;
  onClick?: () => void;
  size?: "large" | "small";
}

const variants: Record<CardVariant, { base: string; shine: string }> = {
  violet: { base: "#7c3fbf", shine: "linear-gradient(135deg, #9b5fd4 0%, #5b2a90 100%)" },
  green:  { base: "#1c7a4a", shine: "linear-gradient(135deg, #2ea05f 0%, #0f5533 100%)" },
  amber:  { base: "#c97a1a", shine: "linear-gradient(135deg, #e8951f 0%, #9a5a0e 100%)" },
};

export function ScanCard({ variant, icon, title, titleItalic, subtitle, rankNumber, onClick, size = "large" }: ScanCardProps) {
  const v = variants[variant];
  const small = size === "small";

  return (
    <div
      onClick={onClick}
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 22,
        padding: small ? 18 : 20,
        cursor: "pointer",
        background: v.base,
        transition: "transform 140ms ease",
      }}
      onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-2px)")}
      onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}
      className="active:scale-[0.98]"
    >
      {/* Gradiente 3D */}
      <div style={{ position: "absolute", inset: 0, borderRadius: 22, background: v.shine }} />
      {/* Círculo grande */}
      <div style={{ position: "absolute", top: -32, right: -32, width: 110, height: 110, borderRadius: "50%", background: "rgba(255,255,255,0.18)" }} />
      {/* Círculo pequeño */}
      <div style={{ position: "absolute", bottom: -20, right: 20, width: 64, height: 64, borderRadius: "50%", background: "rgba(255,255,255,0.12)" }} />
      {/* Tres puntos */}
      <div style={{ position: "absolute", top: 14, right: 14, zIndex: 2, display: "flex", gap: 3 }}>
        {[0,1,2].map(i => <span key={i} style={{ width: 4, height: 4, borderRadius: "50%", background: "rgba(255,255,255,0.45)", display: "block" }} />)}
      </div>

      {/* Contenido */}
      <div style={{ position: "relative", zIndex: 1, display: "flex", gap: 14, flexDirection: small ? "column" : "row", alignItems: small ? "flex-start" : "center" }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span style={{ color: "#fff", fontSize: 24, display: "flex" }}>{icon}</span>
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontFamily: "var(--font-display)", fontSize: small ? 17 : 20, fontWeight: 400, color: "#fff", lineHeight: 1.05, marginBottom: 4 }}>
            {title}{titleItalic && <em className="italic"> {titleItalic}</em>}
          </p>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 300, color: "rgba(255,255,255,0.6)", letterSpacing: "0.03em", lineHeight: 1.45 }}>
            {subtitle}
          </p>
        </div>
        {rankNumber !== undefined && (
          <span style={{ fontFamily: "var(--font-display)", fontSize: 42, fontWeight: 300, color: "rgba(255,255,255,0.18)", lineHeight: 1, flexShrink: 0, letterSpacing: -1 }}>
            {rankNumber}
          </span>
        )}
      </div>
    </div>
  );
}
