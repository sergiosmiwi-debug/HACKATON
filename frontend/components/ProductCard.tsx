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
  fresh:   { color: "var(--fresh)",  bg: "var(--fresh-bg)",  txt: "var(--fresh-txt)",  label: "Fresco"  },
  warning: { color: "var(--warn)",   bg: "var(--warn-bg)",   txt: "var(--warn-txt)",   label: "Pronto"  },
  danger:  { color: "var(--danger)", bg: "var(--danger-bg)", txt: "var(--danger-txt)", label: "Urgente" },
  expired: { color: "var(--muted)",  bg: "var(--muted-bg)",  txt: "var(--muted-txt)",  label: "Vencido" },
} as const;

export default function ProductCard({ product, onOpen, onDiscard, selectMode, selected, onSelect }: Props) {
  const s = S[product.status as keyof typeof S] ?? S.expired;

  const num =
    product.days_left === null ? "–"  :
    product.days_left <  0    ? "!"   :
    product.days_left > 99    ? "99+" :
    String(product.days_left);

  const unit =
    product.days_left === null ? ""       :
    product.days_left <  0    ? "vencido" :
    product.days_left === 0   ? "hoy"     :
    product.days_left === 1   ? "día"     :
    "días";

  return (
    <div
      onClick={() => selectMode && onSelect?.(product.id)}
      style={{
        background: "var(--surface)",
        border: selected
          ? "1.5px solid var(--brand)"
          : "1px solid var(--border-lo)",
        borderRadius: 18,
        overflow: "hidden",
        boxShadow: selected
          ? "0 0 0 3px var(--brand-bg), var(--shadow-card)"
          : "var(--shadow-card)",
        transition: "box-shadow 150ms ease, border-color 150ms ease",
        cursor: selectMode ? "pointer" : "default",
      }}
    >
      <div style={{ padding: "14px 16px" }}>
        <div style={{ display: "flex", alignItems: "stretch", gap: 0 }}>

          {selectMode ? (
            <div style={{ display: "flex", alignItems: "center", paddingRight: 14 }}>
              {selected
                ? <CheckCircle size={22} weight="fill" style={{ color: "var(--brand)" }} />
                : <Circle size={22} style={{ color: "var(--ink-3)" }} />
              }
            </div>
          ) : (
            /* Countdown — the visual anchor */
            <div style={{
              width: 60,
              flexShrink: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              paddingRight: 16,
              marginRight: 16,
              borderRight: "1px solid var(--border-lo)",
            }}>
              <span style={{
                fontSize: 38,
                fontWeight: 900,
                lineHeight: 1,
                color: s.color,
                letterSpacing: "-0.04em",
                fontVariantNumeric: "tabular-nums",
              }}>
                {num}
              </span>
              <span style={{
                fontSize: 9,
                fontWeight: 700,
                color: s.color,
                marginTop: 3,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                opacity: 0.85,
              }}>
                {unit || "días"}
              </span>
            </div>
          )}

          {/* Content */}
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
              <p style={{
                fontWeight: 700,
                fontSize: 15,
                lineHeight: 1.25,
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
                padding: "3px 9px",
                letterSpacing: "0.02em",
              }}>
                {s.label}
              </span>
            </div>
            <p style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 5, lineHeight: 1 }}>
              {product.quantity} · {product.category}
              {product.purchase_price > 0 && (
                <span style={{ color: "var(--ink-3)" }}> · S/ {product.purchase_price.toFixed(2)}</span>
              )}
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
              style={{
                display: "flex", alignItems: "center", gap: 5,
                fontSize: 12, fontWeight: 600,
                color: "var(--ink-2)",
                background: "var(--surface-hi)",
                border: "1px solid var(--border-lo)",
                borderRadius: 10, padding: "6px 12px",
                boxShadow: "var(--shadow-btn)",
                cursor: "pointer",
                transition: "transform 80ms ease",
              }}
              onMouseDown={e => (e.currentTarget.style.transform = "scale(0.95)")}
              onMouseUp={e => (e.currentTarget.style.transform = "scale(1)")}
              onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
            >
              <ArrowBendUpRight size={11} />
              Abrir
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDiscard(product.id); }}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                fontSize: 12, fontWeight: 600,
                color: "var(--danger-txt)",
                background: "var(--danger-bg)",
                border: "1px solid transparent",
                borderRadius: 10, padding: "6px 12px",
                cursor: "pointer",
                transition: "transform 80ms ease",
              }}
              onMouseDown={e => (e.currentTarget.style.transform = "scale(0.95)")}
              onMouseUp={e => (e.currentTarget.style.transform = "scale(1)")}
              onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
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
