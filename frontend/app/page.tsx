"use client";
import { useEffect, useState, useCallback } from "react";
import { getProducts, markOpened, discardProduct } from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import BottomNav from "@/components/BottomNav";
import { ArrowClockwise, CheckSquare, X, Trash, Leaf } from "@phosphor-icons/react";

type Product = {
  id: number; name: string; category: string; quantity: string;
  days_left: number | null; status: string; purchase_price: number;
  removing?: boolean;
};

const FILTERS = [
  { key: "all",     label: "Todos"    },
  { key: "danger",  label: "Urgente"  },
  { key: "warning", label: "Pronto"   },
  { key: "fresh",   label: "Frescos"  },
  { key: "expired", label: "Vencidos" },
];

const EASE = "cubic-bezier(0.23, 1, 0.32, 1)";

function animateOut(ids: number[], set: React.Dispatch<React.SetStateAction<Product[]>>, after?: () => void) {
  set((p) => p.map((x) => (ids.includes(x.id) ? { ...x, removing: true } : x)));
  setTimeout(() => { set((p) => p.filter((x) => !ids.includes(x.id))); after?.(); }, 370);
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState("all");
  const [selectMode, setSel]    = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [loadKey, setLoadKey]   = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await getProducts();
    setProducts(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load, loadKey]);

  function toggle(id: number) {
    setSelected((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }
  function exitSel() { setSel(false); setSelected(new Set()); }

  async function handleOpen(id: number) { await markOpened(id); setLoadKey((k) => k + 1); }
  function handleDiscard(id: number) { discardProduct(id); animateOut([id], setProducts); }
  function handleDiscardSel() { const ids = [...selected]; ids.forEach((id) => discardProduct(id)); animateOut(ids, setProducts, exitSel); }
  function handleClearAll() { const ids = products.map((p) => p.id); ids.forEach((id) => discardProduct(id)); animateOut(ids, setProducts); }

  const visible  = products.filter((p) => !p.removing);
  const filtered = filter === "all" ? visible : visible.filter((p) => p.status === filter);
  const urgent   = visible.filter((p) => p.status === "danger" || p.status === "expired").length;

  return (
    <div className="pb-28">
      {/* ── Header (brand green) ── */}
      <div
        className="sticky top-0 z-10 px-5 pt-12 pb-4"
        style={{ background: "var(--brand)" }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--brand-text)", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
              FreshTrack
            </h1>
            <p style={{ fontSize: 12, color: "oklch(1 0 0 / 0.55)", marginTop: 2 }}>
              {visible.length} {visible.length === 1 ? "producto" : "productos"}
              {urgent > 0 && !selectMode && ` · ${urgent} urgente${urgent !== 1 ? "s" : ""}`}
            </p>
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {!selectMode ? (
              <>
                {visible.length > 0 && (
                  <button
                    onClick={() => setSel(true)}
                    className="active:scale-[0.95]"
                    style={{
                      display: "flex", alignItems: "center", gap: 5,
                      fontSize: 12, fontWeight: 600,
                      color: "var(--brand-text)",
                      background: "oklch(1 0 0 / 0.15)",
                      borderRadius: 10, padding: "6px 10px",
                      transition: "transform 80ms ease",
                      cursor: "pointer",
                      border: "none",
                    }}
                  >
                    <CheckSquare size={13} />
                    Seleccionar
                  </button>
                )}
                <button
                  onClick={load}
                  className="active:scale-[0.95]"
                  style={{
                    width: 34, height: 34,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "var(--brand-text)",
                    background: "oklch(1 0 0 / 0.15)",
                    borderRadius: 10,
                    transition: "transform 80ms ease",
                    cursor: "pointer",
                    border: "none",
                  }}
                >
                  <ArrowClockwise size={15} />
                </button>
              </>
            ) : (
              <button
                onClick={exitSel}
                className="active:scale-[0.95]"
                style={{
                  display: "flex", alignItems: "center", gap: 5,
                  fontSize: 12, fontWeight: 600,
                  color: "var(--brand-text)",
                  background: "oklch(1 0 0 / 0.15)",
                  borderRadius: 10, padding: "6px 10px",
                  transition: "transform 80ms ease",
                  cursor: "pointer",
                  border: "none",
                }}
              >
                <X size={13} />
                Cancelar
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        {!selectMode ? (
          <div className="flex gap-1.5 mt-3 overflow-x-auto pb-0.5" style={{ scrollbarWidth: "none" }}>
            {FILTERS.map(({ key, label }) => {
              const active = filter === key;
              return (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  style={{
                    flexShrink: 0, fontSize: 11, fontWeight: 600,
                    padding: "5px 12px", borderRadius: 99,
                    color: active ? "var(--brand)" : "oklch(1 0 0 / 0.65)",
                    background: active ? "var(--brand-text)" : "oklch(1 0 0 / 0.12)",
                    border: "none",
                    transition: "background 150ms ease, color 150ms ease",
                    cursor: "pointer",
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        ) : (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
            <span style={{ fontSize: 12, color: "oklch(1 0 0 / 0.55)" }}>
              {selected.size} seleccionado{selected.size !== 1 ? "s" : ""}
            </span>
            <button
              onClick={() => setSelected(selected.size === filtered.length ? new Set() : new Set(filtered.map((p) => p.id)))}
              style={{ fontSize: 12, fontWeight: 600, color: "var(--brand-text)", background: "none", border: "none", cursor: "pointer" }}
            >
              {selected.size === filtered.length ? "Deseleccionar todo" : "Seleccionar todo"}
            </button>
          </div>
        )}
      </div>

      {/* ── List ── */}
      <div style={{ padding: "16px 16px 0" }}>
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="anim-card rounded-2xl"
                style={{
                  height: 88,
                  background: "var(--surface)",
                  border: "1px solid var(--border-lo)",
                  animationDelay: `${i * 60}ms`,
                  opacity: 0.7,
                }}
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", paddingTop: 80, textAlign: "center" }}>
            <div style={{
              width: 56, height: 56,
              background: "var(--brand-bg)",
              borderRadius: 16,
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: 16,
            }}>
              <Leaf size={26} style={{ color: "var(--brand)" }} />
            </div>
            <p style={{ fontWeight: 700, fontSize: 15, color: "var(--ink-1)" }}>Nada por aquí</p>
            <p style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 4 }}>
              Escanea un ticket o foto de tu refri
            </p>
          </div>
        ) : (
          filtered.map((p, i) => (
            <div
              key={p.id}
              style={{
                display: "grid",
                gridTemplateRows: p.removing ? "0fr" : "1fr",
                opacity: p.removing ? 0 : 1,
                transform: p.removing ? "translateX(14px)" : "translateX(0)",
                marginBottom: p.removing ? 0 : 10,
                transition: `grid-template-rows 340ms ${EASE}, opacity 250ms ${EASE}, transform 250ms ${EASE}, margin-bottom 340ms ${EASE}`,
              }}
            >
              <div style={{ overflow: "hidden" }}>
                <div className="anim-card" style={{ animationDelay: `${Math.min(i * 45, 200)}ms` }}>
                  <ProductCard
                    product={p}
                    onOpen={handleOpen}
                    onDiscard={handleDiscard}
                    selectMode={selectMode}
                    selected={selected.has(p.id)}
                    onSelect={toggle}
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Select action bar ── */}
      {selectMode && (
        <div
          className="fixed left-0 right-0 max-w-md mx-auto px-4 anim-bar"
          style={{ bottom: 72, zIndex: 20 }}
        >
          <div style={{
            display: "flex", gap: 8,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 18, padding: 10,
            boxShadow: "0 4px 24px oklch(0.18 0.02 250 / 0.10)",
          }}>
            {visible.length > 0 && (
              <button
                onClick={handleClearAll}
                className="active:scale-[0.96]"
                style={{
                  display: "flex", alignItems: "center", gap: 5,
                  fontSize: 12, fontWeight: 600,
                  color: "var(--ink-2)",
                  background: "var(--surface-hi)",
                  border: "1px solid var(--border-lo)",
                  borderRadius: 12, padding: "9px 14px",
                  transition: "transform 80ms ease",
                  cursor: "pointer",
                }}
              >
                <Trash size={12} />
                Limpiar todo
              </button>
            )}
            <button
              onClick={handleDiscardSel}
              disabled={selected.size === 0}
              className="active:scale-[0.96]"
              style={{
                flex: 1,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                fontSize: 12, fontWeight: 700,
                color: selected.size === 0 ? "var(--muted)" : "var(--danger-txt)",
                background: selected.size === 0 ? "var(--muted-bg)" : "var(--danger-bg)",
                border: "none",
                borderRadius: 12, padding: "9px 14px",
                transition: "transform 80ms ease, background 150ms ease",
                cursor: selected.size === 0 ? "default" : "pointer",
                pointerEvents: selected.size === 0 ? "none" : "auto",
              }}
            >
              <Trash size={12} />
              Tirar {selected.size > 0 ? `${selected.size} seleccionado${selected.size !== 1 ? "s" : ""}` : "seleccionados"}
            </button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
