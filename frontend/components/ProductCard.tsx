"use client";
import { useState } from "react";
import { ArrowBendUpRight, Trash, CheckCircle, Circle, X } from "@phosphor-icons/react";

interface Product {
  id: number; name: string; category: string; quantity: string;
  days_left: number | null; status: string; purchase_price: number;
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

const RECYCLE_MAP: { keywords: string[]; bin: string }[] = [
  { keywords: ["leche","yogur","jugo","tetra","caja"],   bin: "♻️ Tetra Pak → bolsa amarilla" },
  { keywords: ["botella","gaseosa","agua","plástico"],    bin: "🔵 Plástico PET → tacho azul"  },
  { keywords: ["lata","atún","sardina","conserva"],       bin: "⚪ Metal/Lata → tacho gris"    },
  { keywords: ["vidrio","frasco","mermelada"],            bin: "🟢 Vidrio → tacho verde"       },
  { keywords: ["pan","fruta","verdura","carne","resto"],  bin: "🟤 Orgánico → tacho marrón"   },
  { keywords: ["cartón","cereal","papel"],                bin: "📦 Cartón → tacho azul"        },
];

function getRecycleTip(name: string): string | null {
  const lower = name.toLowerCase();
  for (const rule of RECYCLE_MAP) {
    if (rule.keywords.some(k => lower.includes(k))) return rule.bin;
  }
  return null;
}

export default function ProductCard({ product, onOpen, onDiscard, selectMode, selected, onSelect }: Props) {
  const s = S[product.status as keyof typeof S] ?? S.expired;
  const [recycleTip, setRecycleTip] = useState<string | null>(null);

  const num  = product.days_left === null ? "–" : product.days_left < 0 ? "!" : product.days_left > 99 ? "99+" : String(product.days_left);
  const unit = product.days_left === null ? "" : product.days_left < 0 ? "vencido" : product.days_left === 0 ? "hoy" : product.days_left === 1 ? "día" : "días";

  function handleDiscard() {
    const tip = getRecycleTip(product.name);
    if (tip) {
      setRecycleTip(tip);
      setTimeout(() => { onDiscard(product.id); }, 1800);
    } else {
      onDiscard(product.id);
    }
  }

  return (
    <div
      onClick={() => selectMode && onSelect?.(product.id)}
      style={{
        background: "var(--surface)",
        border: selected ? "1.5px solid var(--violet)" : "1px solid var(--border-lo)",
        borderRadius: 20,
        boxShadow: selected ? "0 0 0 3px var(--violet-bg)" : "var(--shadow-card)",
        overflow: "hidden",
        transition: "box-shadow 150ms ease, border-color 150ms ease",
        cursor: selectMode ? "pointer" : "default",
        position: "relative",
      }}
    >
      {recycleTip && (
        <div style={{ position: "absolute", inset: 0, background: "#1a1714", borderRadius: 20, zIndex: 10, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 16px", gap: 10 }}>
          <span style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "#fff", flex: 1 }}>{recycleTip}</span>
          <button onClick={() => setRecycleTip(null)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", padding: 0 }}>
            <X size={16} />
          </button>
        </div>
      )}

      <div style={{ padding: 16 }}>
        <div style={{ display: "flex", alignItems: "stretch", gap: 14 }}>
          {selectMode ? (
            <div style={{ display: "flex", alignItems: "center", paddingRight: 2 }}>
              {selected
                ? <CheckCircle size={20} weight="fill" style={{ color: "var(--violet)" }} />
                : <Circle size={20} style={{ color: "var(--ink-3)" }} />}
            </div>
          ) : (
            <div style={{ minWidth: 52, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", paddingRight: 14, borderRight: "1px solid var(--border-lo)" }}>
              <span style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 400, lineHeight: 1, color: s.color, letterSpacing: "-0.02em" }}>{num}</span>
              <span style={{ fontFamily: "var(--font-body)", fontSize: 9, fontWeight: 600, color: s.color, marginTop: 2, letterSpacing: "0.04em", textTransform: "uppercase" }}>{unit}</span>
            </div>
          )}

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
              <p style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 15, lineHeight: 1.2, color: "var(--ink-1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                {product.name}
              </p>
              <span style={{ flexShrink: 0, fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 700, color: s.txt, background: s.bg, borderRadius: 99, padding: "2px 8px" }}>
                {s.label}
              </span>
            </div>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--ink-3)", marginTop: 4 }}>
              {product.quantity} · {product.category}
            </p>
          </div>
        </div>

        {!selectMode && (
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 6, marginTop: 12, paddingTop: 10, borderTop: "1px solid var(--border-lo)" }}>
            <button onClick={e => { e.stopPropagation(); onOpen(product.id); }} className="active:scale-[0.94]"
              style={{ display: "flex", alignItems: "center", gap: 4, fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 600, color: "var(--ink-2)", background: "var(--bg)", border: "1px solid var(--border-lo)", borderRadius: 10, padding: "5px 10px", cursor: "pointer" }}>
              <ArrowBendUpRight size={11} /> Abrir
            </button>
            <button onClick={e => { e.stopPropagation(); handleDiscard(); }} className="active:scale-[0.94]"
              style={{ display: "flex", alignItems: "center", gap: 4, fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 600, color: "var(--danger-txt)", background: "var(--danger-bg)", border: "1px solid transparent", borderRadius: 10, padding: "5px 10px", cursor: "pointer" }}>
              <Trash size={11} /> Tirar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
