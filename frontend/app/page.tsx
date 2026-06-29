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
  { key: "all",     label: "Todos"   },
  { key: "danger",  label: "Urgente" },
  { key: "warning", label: "Pronto"  },
  { key: "fresh",   label: "Frescos" },
  { key: "expired", label: "Vencidos"},
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
    <div style={{ paddingBottom: 100 }}>
      {/* ── Header ── */}
      <div
        className="sticky top-0 z-10 px-5 pt-12 pb-4"
        style={{
          background: "linear-gradient(170deg, #1a4a28 0%, #153d22 100%)",
          boxShadow: "0 1px 0 rgba(0,0,0,0.08)",
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1 }}>
              FreshTrack
            </h1>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 3, fontWeight: 500 }}>
              {loading ? "Cargando…" : `${visible.length} producto${visible.length !== 1 ? "s" : ""}${urgent > 0 && !selectMode ? ` · ${urgent} urgente${urgent !== 1 ? "s" : ""}` : ""}`}
            </p>
          </div>

          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {!selectMode ? (
              <>
                {visible.length > 0 && (
                  <button
                    onClick={() => setSel(true)}
                    style={{
                      display: "flex", alignItems: "center", gap: 5,
                      fontSize: 12, fontWeight: 600,
                      color: "#fff",
                      background: "rgba(255,255,255,0.12)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      borderRadius: 10, padding: "7px 12px",
                      cursor: "pointer",
                      transition: "transform 80ms ease",
                    }}
                    onMouseDown={e => (e.currentTarget.style.transform = "scale(0.95)")}
                    onMouseUp={e => (e.currentTarget.style.transform = "scale(1)")}
                    onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
                  >
                    <CheckSquare size={13} />
                    Seleccionar
                  </button>
                )}
                <button
                  onClick={load}
                  style={{
                    width: 34, height: 34,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff",
                    background: "rgba(255,255,255,0.12)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: 10,
                    cursor: "pointer",
                    transition: "transform 80ms ease",
                  }}
                  onMouseDown={e => (e.currentTarget.style.transform = "scale(0.95)")}
                  onMouseUp={e => (e.currentTarget.style.transform = "scale(1)")}
                  onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
                >
                  <ArrowClockwise size={15} />
                </button>
              </>
            ) : (
              <button
                onClick={exitSel}
                style={{
                  display: "flex", alignItems: "center", gap: 5,
                  fontSize: 12, fontWeight: 600,
                  color: "#fff",
                  background: "rgba(255,255,255,0.12)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: 10, padding: "7px 12px",
                  cursor: "pointer",
                }}
              >
                <X size={13} />
                Cancelar
              </button>
            )}
          </div>
        </div>

        {/* Filter pills */}
        {!selectMode ? (
          <div className="flex gap-1.5 overflow-x-auto pb-0.5" style={{ scrollbarWidth: "none" }}>
            {FILTERS.map(({ key, label }) => {
              const active = filter === key;
              return (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  style={{
                    flexShrink: 0, fontSize: 12, fontWeight: 600,
                    padding: "6px 14px", borderRadius: 99,
                    color: active ? "var(--brand)" : "rgba(255,255,255,0.65)",
                    background: active ? "#fff" : "rgba(255,255,255,0.1)",
                    border: active ? "none" : "1px solid rgba(255,255,255,0.12)",
                    cursor: "pointer",
                    transition: "all 150ms ease",
                    letterSpacing: "0.01em",
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        ) : (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", fontWeight: 500 }}>
              {selected.size} seleccionado{selected.size !== 1 ? "s" : ""}
            </span>
            <button
              onClick={() => setSelected(selected.size === filtered.length ? new Set() : new Set(filtered.map((p) => p.id)))}
              style={{ fontSize: 12, fontWeight: 600, color: "#fff", background: "none", border: "none", cursor: "pointer" }}
            >
              {selected.size === filtered.length ? "Deseleccionar todo" : "Seleccionar todo"}
            </button>
          </div>
        )}
      </div>

      {/* ── List ── */}
      <div style={{ padding: "14px 14px 0" }}>
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="anim-card"
                style={{
                  height: 90,
                  background: "var(--surface)",
                  border: "1px solid var(--border-lo)",
                  borderRadius: 18,
                  boxShadow: "var(--shadow-card)",
                  animationDelay: `${i * 60}ms`,
                  opacity: 0.6,
                }}
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", paddingTop: 72, textAlign: "center",
          }}>
            <div style={{
              width: 72, height: 72,
              background: "var(--brand-bg)",
              borderRadius: 22,
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: 20,
              boxShadow: "0 4px 20px rgba(26,74,40,0.10)",
            }}>
              <Leaf size={32} weight="fill" style={{ color: "var(--brand)" }} />
            </div>
            <p style={{ fontWeight: 800, fontSize: 18, color: "var(--ink-1)", letterSpacing: "-0.02em" }}>
              Nada por aquí
            </p>
            <p style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 6, lineHeight: 1.5, maxWidth: 220 }}>
              Escanea un ticket o foto de tu refri para empezar
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
                transform: p.removing ? "translateX(16px)" : "translateX(0)",
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
          style={{ bottom: 96, zIndex: 20 }}
        >
          <div style={{
            display: "flex", gap: 8,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 18, padding: 10,
            boxShadow: "var(--shadow-card-hover)",
          }}>
            {visible.length > 0 && (
              <button
                onClick={handleClearAll}
                style={{
                  display: "flex", alignItems: "center", gap: 5,
                  fontSize: 12, fontWeight: 600,
                  color: "var(--ink-2)",
                  background: "var(--surface-hi)",
                  border: "1px solid var(--border-lo)",
                  borderRadius: 12, padding: "10px 14px",
                  cursor: "pointer",
                  transition: "transform 80ms ease",
                }}
                onMouseDown={e => (e.currentTarget.style.transform = "scale(0.95)")}
                onMouseUp={e => (e.currentTarget.style.transform = "scale(1)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
              >
                <Trash size={12} />
                Limpiar todo
              </button>
            )}
            <button
              onClick={handleDiscardSel}
              disabled={selected.size === 0}
              style={{
                flex: 1,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                fontSize: 12, fontWeight: 700,
                color: selected.size === 0 ? "var(--muted)" : "var(--danger-txt)",
                background: selected.size === 0 ? "var(--muted-bg)" : "var(--danger-bg)",
                border: "none",
                borderRadius: 12, padding: "10px 14px",
                cursor: selected.size === 0 ? "default" : "pointer",
                pointerEvents: selected.size === 0 ? "none" : "auto",
                transition: "transform 80ms ease",
              }}
              onMouseDown={e => selected.size > 0 && (e.currentTarget.style.transform = "scale(0.97)")}
              onMouseUp={e => (e.currentTarget.style.transform = "scale(1)")}
              onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
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
