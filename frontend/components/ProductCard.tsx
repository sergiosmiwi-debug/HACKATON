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

const S = {
  fresh:   { color: "var(--fresh)",   bg: "var(--fresh-bg)",  txt: "var(--fresh-txt)",  label: "Fresco"  },
  warning: { color: "var(--warn)",    bg: "var(--warn-bg)",   txt: "var(--warn-txt)",   label: "Pronto"  },
  danger:  { color: "var(--danger)",  bg: "var(--danger-bg)", txt: "var(--danger-txt)", label: "Urgente" },
  expired: { color: "var(--muted)",   bg: "var(--muted-bg)",  txt: "var(--muted-txt)",  label: "Vencido" },
} as const;

export default function ProductCard({ product, onOpen, onDiscard, selectMode, selected, onSelect }: Props) {
  const s = S[product.status as keyof typeof S] ?? S.expired;

  const num =
    product.days_left === null ? "–"   :
    product.days_left <  0    ? "!"    :
    product.days_left > 99    ? "99+"  :
    String(product.days_left);

  const unit =
    product.days_left === null ? ""        :
    product.days_left <  0    ? "vencido"  :
    product.days_left === 0   ? "hoy"      :
    product.days_left === 1   ? "día"      :
    "días";

  return (
    <div
      onClick={() => selectMode && onSelect?.(product.id)}
      className={`rounded-2xl overflow-hidden ${selectMode ? "cursor-pointer" : ""}`}
      style={{
        background: "var(--surface)",
        border: selected ? "1.5px solid var(--brand)" : "1px solid var(--border-lo)",
        boxShadow: selected ? "0 0 0 3px var(--brand-bg)" : "none",
        transition: "box-shadow 150ms ease, border-color 150ms ease",
      }}
    >
      <div style={{ padding: 16 }}>
        {/* Main row */}
        <div style={{ display: "flex", alignItems: "stretch", gap: 14 }}>

          {/* Select checkbox / countdown column */}
          {selectMode ? (
            <div style={{ display: "flex", alignItems: "center", paddingRight: 2 }}>
              {selected
                ? <CheckCircle size={20} weight="fill" style={{ color: "var(--brand)" }} />
                : <Circle size={20} style={{ color: "var(--ink-3)" }} />
              }
            </div>
          ) : (
            /* Countdown — the hero element */
            <div style={{
              minWidth: 52,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              paddingRight: 14,
              borderRight: "1px solid var(--border-lo)",
            }}>
              <span style={{
                fontSize: 32,
                fontWeight: 800,
                lineHeight: 1,
                color: s.color,
                letterSpacing: "-0.03em",
              }}>
                {num}
              </span>
              <span style={{
                fontSize: 10,
                fontWeight: 600,
                color: s.color,
                marginTop: 2,
                letterSpacing: "0.02em",
              }}>
                {unit}
              </span>
            </div>
          )}

          {/* Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
              <p style={{
                fontWeight: 700,
                fontSize: 15,
                lineHeight: 1.2,
                color: "var(--ink-1)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                flex: 1,
              }}>
                {product.name}
              </p>
              <span style={{
                flexShrink: 0,
                fontSize: 10,
                fontWeight: 700,
                color: s.txt,
                background: s.bg,
                borderRadius: 99,
                padding: "2px 8px",
              }}>
                {s.label}
              </span>
            </div>
            <p style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 4 }}>
              {product.quantity} · {product.category}
            </p>
          </div>
        </div>

        {/* Actions */}
        {!selectMode && (
          <div style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 6,
            marginTop: 12,
            paddingTop: 10,
            borderTop: "1px solid var(--border-lo)",
          }}>
            <button
              onClick={(e) => { e.stopPropagation(); onOpen(product.id); }}
              className="active:scale-[0.94]"
              style={{
                display: "flex", alignItems: "center", gap: 4,
                fontSize: 12, fontWeight: 600,
                color: "var(--ink-2)",
                background: "var(--surface-hi)",
                border: "1px solid var(--border-lo)",
                borderRadius: 10, padding: "5px 10px",
                transition: "transform 80ms ease",
                cursor: "pointer",
              }}
            >
              <ArrowBendUpRight size={11} />
              Abrir
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDiscard(product.id); }}
              className="active:scale-[0.94]"
              style={{
                display: "flex", alignItems: "center", gap: 4,
                fontSize: 12, fontWeight: 600,
                color: "var(--danger-txt)",
                background: "var(--danger-bg)",
                border: "1px solid transparent",
                borderRadius: 10, padding: "5px 10px",
                transition: "transform 80ms ease",
                cursor: "pointer",
              }}
            >
              <Trash size={11} />
              Tirar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
