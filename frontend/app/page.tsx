"use client";
import { useEffect, useState, useCallback } from "react";
import { getProducts, markOpened, discardProduct } from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import BottomNav from "@/components/BottomNav";
import { ArrowClockwise, CheckSquare, X, Trash } from "@phosphor-icons/react";

type Product = {
  id: number;
  name: string;
  category: string;
  quantity: string;
  days_left: number | null;
  status: string;
  purchase_price: number;
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

function animateOut(
  ids: number[],
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>,
  after?: () => void
) {
  setProducts((p) => p.map((x) => (ids.includes(x.id) ? { ...x, removing: true } : x)));
  setTimeout(() => {
    setProducts((p) => p.filter((x) => !ids.includes(x.id)));
    after?.();
  }, 370);
}

/* ─── Skeleton loader ─────────────────────────── */
function CardSkeleton({ delay }: { delay: number }) {
  return (
    <div
      className="rounded-2xl anim-card"
      style={{
        height: 96,
        background: "var(--surface)",
        border: "1px solid var(--border-lo)",
        animationDelay: `${delay}ms`,
        opacity: 0.6,
      }}
    />
  );
}

export default function Home() {
  const [products, setProducts]   = useState<Product[]>([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState("all");
  const [selectMode, setSelect]   = useState(false);
  const [selected, setSelected]   = useState<Set<number>>(new Set());
  const [loadKey, setLoadKey]     = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await getProducts();
    setProducts(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load, loadKey]);

  function toggleId(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function exitSelect() {
    setSelect(false);
    setSelected(new Set());
  }

  async function handleOpen(id: number) {
    await markOpened(id);
    setLoadKey((k) => k + 1);
  }

  function handleDiscard(id: number) {
    discardProduct(id);
    animateOut([id], setProducts);
  }

  function handleDiscardSelected() {
    const ids = [...selected];
    ids.forEach((id) => discardProduct(id));
    animateOut(ids, setProducts, exitSelect);
  }

  function handleClearAll() {
    const ids = products.map((p) => p.id);
    ids.forEach((id) => discardProduct(id));
    animateOut(ids, setProducts);
  }

  const visible = products.filter((p) => !p.removing);
  const filtered = filter === "all" ? visible : visible.filter((p) => p.status === filter);
  const urgentCount = visible.filter((p) => p.status === "danger" || p.status === "expired").length;

  return (
    <div className="pb-28">
      {/* ── Header ── */}
      <div
        className="sticky top-0 z-10 px-5 pt-12 pb-4"
        style={{ background: "var(--bg)", borderBottom: "1px solid var(--border-lo)" }}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full inline-block" style={{ background: "var(--brand)" }} />
              <h1 className="text-xl font-bold tracking-tight" style={{ color: "var(--ink-1)" }}>
                FreshTrack
              </h1>
              {urgentCount > 0 && !selectMode && (
                <span
                  className="text-[10px] font-bold rounded-full px-2 py-0.5"
                  style={{ color: "var(--danger-text)", background: "var(--danger-bg)" }}
                >
                  {urgentCount} urgente{urgentCount !== 1 ? "s" : ""}
                </span>
              )}
            </div>
            <p className="text-sm mt-0.5" style={{ color: "var(--ink-3)" }}>
              {visible.length} {visible.length === 1 ? "producto" : "productos"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!selectMode ? (
              <>
                {visible.length > 0 && (
                  <button
                    onClick={() => setSelect(true)}
                    className="flex items-center gap-1.5 text-xs font-semibold rounded-xl active:scale-[0.95]"
                    style={{
                      color: "var(--ink-2)",
                      background: "var(--surface)",
                      border: "1px solid var(--border-lo)",
                      padding: "6px 10px",
                      transition: "transform 80ms ease",
                    }}
                  >
                    <CheckSquare size={13} />
                    Seleccionar
                  </button>
                )}
                <button
                  onClick={load}
                  className="flex items-center justify-center rounded-xl active:scale-[0.95]"
                  style={{
                    width: 34, height: 34,
                    color: "var(--ink-2)",
                    background: "var(--surface)",
                    border: "1px solid var(--border-lo)",
                    transition: "transform 80ms ease",
                  }}
                >
                  <ArrowClockwise size={15} />
                </button>
              </>
            ) : (
              <button
                onClick={exitSelect}
                className="flex items-center gap-1.5 text-xs font-semibold rounded-xl active:scale-[0.95]"
                style={{
                  color: "var(--ink-2)",
                  background: "var(--surface)",
                  border: "1px solid var(--border-lo)",
                  padding: "6px 10px",
                  transition: "transform 80ms ease",
                }}
              >
                <X size={13} />
                Cancelar
              </button>
            )}
          </div>
        </div>

        {/* Filters / Select-all row */}
        {!selectMode ? (
          <div className="flex gap-1.5 mt-4 overflow-x-auto pb-0.5" style={{ scrollbarWidth: "none" }}>
            {FILTERS.map(({ key, label }) => {
              const active = filter === key;
              return (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className="shrink-0 text-xs font-semibold rounded-full"
                  style={{
                    padding: "5px 12px",
                    color: active ? "var(--bg)" : "var(--ink-3)",
                    background: active ? "var(--brand)" : "var(--surface)",
                    border: active ? "1px solid transparent" : "1px solid var(--border-lo)",
                    transition: "background 150ms ease, color 150ms ease",
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs" style={{ color: "var(--ink-3)" }}>
              {selected.size} seleccionado{selected.size !== 1 ? "s" : ""}
            </span>
            <button
              onClick={() => {
                const all = new Set(filtered.map((p) => p.id));
                setSelected(selected.size === filtered.length ? new Set() : all);
              }}
              className="text-xs font-semibold"
              style={{ color: "var(--brand)" }}
            >
              {selected.size === filtered.length ? "Deseleccionar todo" : "Seleccionar todo"}
            </button>
          </div>
        )}
      </div>

      {/* ── List ── */}
      <div className="px-4 py-4 flex flex-col" style={{ gap: 0 }}>
        {loading ? (
          <div className="flex flex-col gap-2.5">
            {[0, 1, 2].map((i) => <CardSkeleton key={i} delay={i * 60} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: "var(--surface)" }}
            >
              <span style={{ fontSize: 24 }}>🧊</span>
            </div>
            <p className="font-semibold" style={{ color: "var(--ink-1)" }}>Nada por aquí</p>
            <p className="text-sm mt-1" style={{ color: "var(--ink-3)" }}>
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
                transform: p.removing ? "translateX(16px)" : "translateX(0)",
                marginBottom: p.removing ? 0 : 10,
                transition: `grid-template-rows 340ms ${EASE}, opacity 260ms ${EASE}, transform 260ms ${EASE}, margin-bottom 340ms ${EASE}`,
              }}
            >
              <div style={{ overflow: "hidden" }}>
                <div
                  className="anim-card"
                  style={{ animationDelay: `${Math.min(i * 50, 200)}ms` }}
                >
                  <ProductCard
                    product={p}
                    onOpen={handleOpen}
                    onDiscard={handleDiscard}
                    selectMode={selectMode}
                    selected={selected.has(p.id)}
                    onSelect={toggleId}
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Select mode action bar ── */}
      {selectMode && (
        <div
          className="fixed left-0 right-0 max-w-md mx-auto px-4 anim-bar"
          style={{ bottom: 72, zIndex: 20 }}
        >
          <div
            className="flex gap-2 rounded-2xl p-3"
            style={{
              background: "var(--surface-hi)",
              border: "1px solid var(--border)",
            }}
          >
            {visible.length > 0 && (
              <button
                onClick={handleClearAll}
                className="flex items-center gap-1.5 text-xs font-semibold rounded-xl active:scale-[0.96]"
                style={{
                  color: "var(--ink-2)",
                  background: "var(--surface)",
                  border: "1px solid var(--border-lo)",
                  padding: "9px 14px",
                  transition: "transform 80ms ease",
                }}
              >
                <Trash size={13} />
                Limpiar todo
              </button>
            )}
            <button
              onClick={handleDiscardSelected}
              disabled={selected.size === 0}
              className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold rounded-xl active:scale-[0.96]"
              style={{
                color: selected.size === 0 ? "var(--muted-text)" : "var(--danger-text)",
                background: selected.size === 0 ? "var(--muted-bg)" : "var(--danger-bg)",
                border: `1px solid ${selected.size === 0 ? "transparent" : "var(--danger-bg)"}`,
                padding: "9px 14px",
                transition: "transform 80ms ease, background 150ms ease",
                pointerEvents: selected.size === 0 ? "none" : "auto",
              }}
            >
              <Trash size={13} />
              Tirar {selected.size > 0
                ? `${selected.size} seleccionado${selected.size !== 1 ? "s" : ""}`
                : "seleccionados"}
            </button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
