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

const variantStyles: Record<
  CardVariant,
  { base: string; shine: string; circle: string }
> = {
  violet: {
    base: "bg-[#7c3fbf]",
    shine:
      "bg-gradient-to-br from-[#9b5fd4] to-[#5b2a90]",
    circle: "bg-white",
  },
  green: {
    base: "bg-[#1c7a4a]",
    shine:
      "bg-gradient-to-br from-[#2ea05f] to-[#0f5533]",
    circle: "bg-white",
  },
  amber: {
    base: "bg-[#c97a1a]",
    shine:
      "bg-gradient-to-br from-[#e8951f] to-[#9a5a0e]",
    circle: "bg-white",
  },
};

export function ScanCard({
  variant,
  icon,
  title,
  titleItalic,
  subtitle,
  rankNumber,
  onClick,
  size = "large",
}: ScanCardProps) {
  const styles = variantStyles[variant];
  const isSmall = size === "small";

  return (
    <div
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-[22px] cursor-pointer
        transition-transform duration-150 hover:-translate-y-0.5 active:scale-[0.98]
        ${styles.base}
        ${isSmall ? "p-[18px]" : "p-5"}
      `}
    >
      {/* Capa de gradiente 3D — da el efecto de volumen */}
      <div className={`absolute inset-0 rounded-[22px] ${styles.shine}`} />

      {/* Círculo decorativo grande — esquina superior derecha */}
      <div
        className={`absolute -top-8 -right-8 w-28 h-28 rounded-full ${styles.circle} opacity-[0.18]`}
      />
      {/* Círculo decorativo pequeño — esquina inferior derecha */}
      <div
        className={`absolute -bottom-5 right-5 w-16 h-16 rounded-full ${styles.circle} opacity-[0.12]`}
      />

      {/* Tres puntos — esquina superior derecha */}
      <div className="absolute top-3.5 right-3.5 z-10 flex gap-[3px]">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1 h-1 rounded-full bg-white opacity-50 block"
          />
        ))}
      </div>

      {/* Contenido */}
      <div
        className={`relative z-10 flex gap-3.5 ${
          isSmall ? "flex-col items-start" : "items-center"
        }`}
      >
        {/* Ícono */}
        <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/25 flex items-center justify-center flex-shrink-0">
          <span className="text-white text-2xl">{icon}</span>
        </div>

        {/* Texto */}
        <div className="flex-1">
          <p
            className="text-white leading-tight mb-1"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: isSmall ? "17px" : "20px",
              fontWeight: 400,
            }}
          >
            {title}{" "}
            {titleItalic && <em className="italic">{titleItalic}</em>}
          </p>
          <p
            className="text-white/60 leading-snug"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "10px",
              fontWeight: 300,
              letterSpacing: "0.03em",
            }}
          >
            {subtitle}
          </p>
        </div>

        {/* Número de ranking decorativo */}
        {rankNumber !== undefined && (
          <span
            className="text-white/20 flex-shrink-0 leading-none"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "42px",
              fontWeight: 300,
              letterSpacing: "-1px",
            }}
          >
            {rankNumber}
          </span>
        )}
      </div>
    </div>
  );
}
