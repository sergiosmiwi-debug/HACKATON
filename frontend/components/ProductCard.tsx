"use client";
import { ArrowBendUpRight, Check, Trash, CheckCircle, Circle } from "@phosphor-icons/react";
import { getBin } from "@/lib/recycling";

interface Product {
  id: number; name: string; category: string; quantity: string;
  days_left: number | null; status: string; purchase_price: number;
  opened_date?: string | null; changes_on_open?: boolean;
}

interface Props {
  product: Product;
  onOpen: (id: number) => void;
  onConsume: (id: number) => void;
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


export default function ProductCard({ product, onOpen, onConsume, onDiscard, selectMode, selected, onSelect }: Props) {
  const s = S[product.status as keyof typeof S] ?? S.expired;
  const bin = getBin(product.name);
  const showOpenButton = product.changes_on_open && !product.opened_date;

  const num  = product.days_left === null ? "–" : product.days_left < 0 ? "!" : product.days_left > 99 ? "99+" : String(product.days_left);
  const unit = product.days_left === null ? "" : product.days_left < 0 ? "vencido" : product.days_left === 0 ? "hoy" : product.days_left === 1 ? "día" : "días";

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
      <div title={`Va a: ${bin.bin}`} style={{
        position: "absolute", top: 0, right: 0, width: 38, height: 38, zIndex: 1,
        background: bin.color,
        clipPath: "polygon(100% 0, 100% 100%, 0 0)",
        opacity: 0.92,
      }} />

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
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--border-lo)" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: bin.color, flexShrink: 0 }} />
            <span style={{ fontFamily: "var(--font-body)", fontSize: 10, color: bin.color, fontWeight: 600 }}>{bin.bin}</span>
            <span style={{ fontFamily: "var(--font-body)", fontSize: 10, color: "var(--ink-3)" }}>al tirar</span>
          </div>
        )}

        {!selectMode && (
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 6, marginTop: 8, paddingTop: 8, borderTop: "1px solid var(--border-lo)" }}>
            {showOpenButton ? (
              <button onClick={e => { e.stopPropagation(); onOpen(product.id); }} className="active:scale-[0.94]"
                style={{ display: "flex", alignItems: "center", gap: 4, fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 600, color: "var(--ink-2)", background: "var(--bg)", border: "1px solid var(--border-lo)", borderRadius: 10, padding: "5px 10px", cursor: "pointer" }}>
                <ArrowBendUpRight size={11} /> Abrir
              </button>
            ) : (
              <button onClick={e => { e.stopPropagation(); onConsume(product.id); }} className="active:scale-[0.94]"
                style={{ display: "flex", alignItems: "center", gap: 4, fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 600, color: "var(--fresh-txt)", background: "var(--fresh-bg)", border: "1px solid transparent", borderRadius: 10, padding: "5px 10px", cursor: "pointer" }}>
                <Check size={11} /> Consumido
              </button>
            )}
            <button onClick={e => { e.stopPropagation(); onDiscard(product.id); }} className="active:scale-[0.94]"
              style={{ display: "flex", alignItems: "center", gap: 4, fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 600, color: "var(--danger-txt)", background: "var(--danger-bg)", border: "1px solid transparent", borderRadius: 10, padding: "5px 10px", cursor: "pointer" }}>
              <Trash size={11} /> Tirar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
