"use client";
import { ArrowBendUpRight, Trash, CheckCircle, Circle } from "@phosphor-icons/react";

interface Product {
  id: number;
  name: string;
  category: string;
  quantity: string;
  days_left: number | null;
  status: string;
  purchase_price: number;
}

interface Props {
  product: Product;
  onOpen: (id: number) => void;
  onDiscard: (id: number) => void;
  selectMode?: boolean;
  selected?: boolean;
  onSelect?: (id: number) => void;
}

const STATUS = {
  fresh:   { dot: "var(--fresh)",  text: "var(--fresh-text)",  bg: "var(--fresh-bg)",  label: "Fresco"  },
  warning: { dot: "var(--warn)",   text: "var(--warn-text)",   bg: "var(--warn-bg)",   label: "Pronto"  },
  danger:  { dot: "var(--danger)", text: "var(--danger-text)", bg: "var(--danger-bg)", label: "Urgente" },
  expired: { dot: "var(--muted)",  text: "var(--muted-text)",  bg: "var(--muted-bg)",  label: "Vencido" },
} as const;

export default function ProductCard({ product, onOpen, onDiscard, selectMode, selected, onSelect }: Props) {
  const cfg = STATUS[product.status as keyof typeof STATUS] ?? STATUS.expired;

  const daysText =
    product.days_left === null ? "Sin fecha" :
    product.days_left < 0     ? "Vencido"   :
    product.days_left === 0   ? "Vence hoy" :
    product.days_left === 1   ? "Mañana"    :
    `${product.days_left} días`;

  return (
    <div
      onClick={() => selectMode && onSelect?.(product.id)}
      className={`rounded-2xl overflow-hidden ${selectMode ? "cursor-pointer" : ""}`}
      style={{
        background: "var(--surface)",
        border: selected
          ? "1px solid var(--brand)"
          : "1px solid var(--border-lo)",
        boxShadow: selected ? "0 0 0 3px var(--brand-bg)" : "none",
        transition: "box-shadow 150ms ease, border-color 150ms ease",
      }}
    >
      <div className="p-4">
        {/* Top row */}
        <div className="flex items-start gap-3">
          {/* Leading indicator */}
          <div className="mt-1.5 shrink-0">
            {selectMode
              ? selected
                ? <CheckCircle size={18} weight="fill" style={{ color: "var(--brand)" }} />
                : <Circle size={18} style={{ color: "var(--ink-3)" }} />
              : <div
                  className="w-2 h-2 rounded-full mt-0.5"
                  style={{ background: cfg.dot }}
                />
            }
          </div>

          {/* Name + meta */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <p
                className="font-semibold text-[15px] leading-tight truncate"
                style={{ color: "var(--ink-1)" }}
              >
                {product.name}
              </p>
              <span
                className="shrink-0 rounded-full"
                style={{
                  color: cfg.text,
                  background: cfg.bg,
                  fontSize: 10,
                  fontWeight: 700,
                  padding: "2px 8px",
                  lineHeight: "16px",
                }}
              >
                {cfg.label}
              </span>
            </div>
            <p className="text-xs mt-0.5" style={{ color: "var(--ink-3)" }}>
              {product.quantity} · {product.category}
            </p>
          </div>
        </div>

        {/* Bottom row */}
        <div className="flex items-center justify-between mt-3" style={{ paddingLeft: 20 }}>
          <span className="text-xs font-semibold" style={{ color: cfg.dot }}>
            {daysText}
          </span>

          {!selectMode && (
            <div className="flex gap-1.5">
              <button
                onClick={(e) => { e.stopPropagation(); onOpen(product.id); }}
                className="flex items-center gap-1 text-xs font-semibold rounded-xl active:scale-[0.94]"
                style={{
                  color: "var(--ink-2)",
                  background: "var(--surface-hi)",
                  padding: "5px 10px",
                  transition: "transform 80ms ease, background 120ms ease",
                }}
              >
                <ArrowBendUpRight size={11} />
                Abrir
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDiscard(product.id); }}
                className="flex items-center gap-1 text-xs font-semibold rounded-xl active:scale-[0.94]"
                style={{
                  color: "var(--danger-text)",
                  background: "var(--danger-bg)",
                  padding: "5px 10px",
                  transition: "transform 80ms ease, background 120ms ease",
                }}
              >
                <Trash size={11} />
                Tirar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
