"use client";
import { Check, Trash, CheckCircle, Circle, X, Lock } from "@phosphor-icons/react";
import { getBin, getCandidateMaterials, MATERIAL_BINS } from "@/lib/recycling";

interface Product {
  id: number; name: string; category: string; quantity: string;
  days_left: number | null; status: string; purchase_price: number;
  opened_date?: string | null; changes_on_open?: boolean;
  opened_life_days?: number | null; material?: string | null;
}

interface Props {
  product: Product;
  onOpen: (id: number) => void;
  onConsume: (id: number) => void;
  onDiscard: (id: number) => void;
  onSetMaterial?: (id: number, material: string) => void;
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

export default function ProductCard({ product, onOpen, onConsume, onDiscard, onSetMaterial, selectMode, selected, onSelect }: Props) {
  const s = S[product.status as keyof typeof S] ?? S.expired;
  const bin = getBin(product.material, product.name);
  const isOrganic = bin.bin === MATERIAL_BINS.organico.bin;
  const isSealed  = !!product.changes_on_open && !product.opened_date && !isOrganic;
  const isOpened  = !!product.opened_date;
  const needsMaterial = !product.material && bin.bin === "Sin identificar";

  const num  = product.days_left === null ? "–" : product.days_left < 0 ? "!" : product.days_left > 99 ? "99+" : String(product.days_left);
  const unit = product.days_left === null ? "" : product.days_left < 0 ? "vencido" : product.days_left === 0 ? "hoy" : product.days_left === 1 ? "día" : "días";

  // Días una vez abierto (para el tachado)
  const openedDays = product.opened_life_days ?? null;

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
      {/* Triángulo de color de residuo — más grande, cubre más esquina */}
      <div title={`Va a: ${bin.bin}`} style={{
        position: "absolute", top: 0, right: 0, width: 72, height: 72, zIndex: 1,
        background: bin.color,
        clipPath: "polygon(100% 0, 100% 100%, 0 0)",
        opacity: 0.88,
        pointerEvents: "none",
      }} />

      <div style={{ padding: 16, paddingTop: 14 }}>

        {/* ── Fila principal: días | info | X ── */}
        <div style={{ display: "flex", alignItems: "stretch", gap: 14 }}>
          {selectMode ? (
            <div style={{ display: "flex", alignItems: "center", paddingRight: 2 }}>
              {selected
                ? <CheckCircle size={20} weight="fill" style={{ color: "var(--violet)" }} />
                : <Circle size={20} style={{ color: "var(--ink-3)" }} />}
            </div>
          ) : (
            /* Columna de días */
            <div style={{ minWidth: 52, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", paddingRight: 14, borderRight: "1px solid var(--border-lo)", flexShrink: 0 }}>
              <span style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 400, lineHeight: 1, color: s.color, letterSpacing: "-0.02em" }}>{num}</span>
              <span style={{ fontFamily: "var(--font-body)", fontSize: 9, fontWeight: 600, color: s.color, marginTop: 2, letterSpacing: "0.04em", textTransform: "uppercase" }}>{unit}</span>
              {/* Tachado: vida útil una vez abierto, solo para sellados */}
              {isSealed && openedDays !== null && (
                <span style={{
                  fontFamily: "var(--font-body)", fontSize: 9, color: "var(--ink-3)",
                  marginTop: 5, textDecoration: "line-through", lineHeight: 1.2, textAlign: "center",
                }}>
                  {openedDays > 99 ? "99+" : openedDays} {openedDays === 1 ? "día" : "días"}{"\n"}abierto
                </span>
              )}
            </div>
          )}

          {/* Info: nombre, cantidad, badge de estado */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Nombre con margen derecho para no solapar el triángulo */}
            <p style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 15, lineHeight: 1.2, color: "var(--ink-1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: 36 }}>
              {product.name}
            </p>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--ink-3)", marginTop: 3 }}>
              {product.quantity} · {product.category}
            </p>
            {/* Badge de estado debajo del nombre, separado del triángulo */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 5 }}>
              <span style={{ fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 700, color: s.txt, background: s.bg, borderRadius: 99, padding: "2px 8px" }}>
                {s.label}
              </span>
              {isOpened && (
                <span style={{ fontFamily: "var(--font-body)", fontSize: 10, color: "var(--ink-3)", fontWeight: 500 }}>
                  · abierto
                </span>
              )}
            </div>
          </div>

          {/* X para eliminar del listado */}
          {!selectMode && (
            <button
              onClick={e => { e.stopPropagation(); onConsume(product.id); }}
              title="Eliminar del listado"
              style={{
                alignSelf: "flex-start",
                width: 24, height: 24, borderRadius: 8,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "var(--bg)", border: "1px solid var(--border-lo)",
                color: "var(--ink-3)", cursor: "pointer", flexShrink: 0,
                zIndex: 2,
              }}
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* ── Fila de material / picker ── */}
        {!selectMode && !needsMaterial && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--border-lo)" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: bin.color, flexShrink: 0 }} />
            <span style={{ fontFamily: "var(--font-body)", fontSize: 10, color: bin.color, fontWeight: 600 }}>{bin.bin}</span>
            <span style={{ fontFamily: "var(--font-body)", fontSize: 10, color: "var(--ink-3)" }}>al tirar</span>
          </div>
        )}

        {!selectMode && needsMaterial && onSetMaterial && (
          <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--border-lo)" }}>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 10, color: "var(--ink-3)", marginBottom: 6 }}>
              ¿De qué es el envase?
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {getCandidateMaterials(product.name).map(m => (
                <button key={m} onClick={e => { e.stopPropagation(); onSetMaterial(product.id, m); }} className="active:scale-[0.94]"
                  style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 600, color: "var(--ink-2)", background: "var(--bg)", border: "1px solid var(--border-lo)", borderRadius: 99, padding: "5px 10px", cursor: "pointer" }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: MATERIAL_BINS[m].color, flexShrink: 0 }} />
                  {MATERIAL_BINS[m].bin}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Acciones ── */}
        {!selectMode && (
          <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--border-lo)" }}>
            {isSealed ? (
              /* Producto sellado: botón "No abierto" grande + Tirar */
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <button
                  onClick={e => { e.stopPropagation(); onOpen(product.id); }}
                  className="active:scale-[0.98]"
                  style={{
                    width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 700,
                    color: "#4a4a55",
                    background: "linear-gradient(135deg, #e8e8ef 0%, #d4d4de 100%)",
                    border: "1px solid #c8c8d4",
                    borderRadius: 12, padding: "10px 16px", cursor: "pointer",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                  }}>
                  <Lock size={13} weight="fill" style={{ color: "#7a7a8a" }} /> No abierto
                </button>
                <button onClick={e => { e.stopPropagation(); onDiscard(product.id); }} className="active:scale-[0.94]"
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 600, color: "var(--danger-txt)", background: "var(--danger-bg)", border: "1px solid transparent", borderRadius: 10, padding: "6px 10px", cursor: "pointer" }}>
                  <Trash size={11} /> Tirar
                </button>
              </div>
            ) : (
              /* Producto abierto u orgánico: Consumido + Tirar */
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
                <button onClick={e => { e.stopPropagation(); onConsume(product.id); }} className="active:scale-[0.94]"
                  style={{ display: "flex", alignItems: "center", gap: 4, fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 600, color: "var(--fresh-txt)", background: "var(--fresh-bg)", border: "1px solid transparent", borderRadius: 10, padding: "5px 10px", cursor: "pointer" }}>
                  <Check size={11} /> Consumido
                </button>
                <button onClick={e => { e.stopPropagation(); onDiscard(product.id); }} className="active:scale-[0.94]"
                  style={{ display: "flex", alignItems: "center", gap: 4, fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 600, color: "var(--danger-txt)", background: "var(--danger-bg)", border: "1px solid transparent", borderRadius: 10, padding: "5px 10px", cursor: "pointer" }}>
                  <Trash size={11} /> Tirar
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
