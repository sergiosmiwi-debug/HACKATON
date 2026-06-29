"use client";
import { useEffect, useState, useCallback } from "react";
import { getProducts, markOpened, discardProduct } from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import BottomNav from "@/components/BottomNav";
import { Snowflake, Warning, ArrowClockwise, CheckSquare, X, Trash, ArrowSquareOut } from "@phosphor-icons/react";

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
  { key: "all",     label: "Todos" },
  { key: "danger",  label: "Urgente" },
  { key: "warning", label: "Pronto" },
  { key: "fresh",   label: "Frescos" },
  { key: "expired", label: "Vencidos" },
];

const EASE_OUT = "cubic-bezier(0.23, 1, 0.32, 1)";

function removeWithAnimation(
  id: number | number[],
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>,
  onRemoved?: () => void
) {
  const ids = Array.isArray(id) ? id : [id];
  setProducts((prev) =>
    prev.map((p) => (ids.includes(p.id) ? { ...p, removing: true } : p))
  );
  setTimeout(() => {
    setProducts((prev) => prev.filter((p) => !ids.includes(p.id)));
    onRemoved?.();
  }, 370);
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [loadKey, setLoadKey] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await getProducts();
    setProducts(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load, loadKey]);

  function toggleSelect(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function exitSelectMode() {
    setSelectMode(false);
    setSelectedIds(new Set());
  }

  async function handleOpen(id: number) {
    await markOpened(id);
    setLoadKey((k) => k + 1);
  }

  async function handleDiscard(id: number) {
    discardProduct(id);
    removeWithAnimation(id, setProducts);
  }

  async function handleDiscardSelected() {
    const ids = [...selectedIds];
    for (const id of ids) discardProduct(id);
    removeWithAnimation(ids, setProducts, exitSelectMode);
  }

  async function handleClearAll() {
    const ids = products.map((p) => p.id);
    for (const id of ids) discardProduct(id);
    removeWithAnimation(ids, setProducts);
  }

  const filtered = filter === "all"
    ? products
    : products.filter((p) => p.status === filter);

  const urgentCount = products.filter(
    (p) => (p.status === "danger" || p.status === "expired") && !p.removing
  ).length;

  const visibleCount = products.filter((p) => !p.removing).length;

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="bg-white sticky top-0 z-10 border-b border-slate-100">
        <div className="px-5 pt-12 pb-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-green-700 rounded-xl flex items-center justify-center">
                <Snowflake size={18} weight="fill" className="text-white" />
              </div>
              <div>
                <h1 className="text-[17px] font-bold text-slate-900 leading-tight">FreshTrack</h1>
                <p className="text-[11px] text-slate-400 leading-tight">{visibleCount} productos en tu refri</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {urgentCount > 0 && !selectMode && (
                <div className="flex items-center gap-1 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full">
                  <Warning size={12} weight="fill" className="text-red-500" />
                  <span className="text-xs font-bold text-red-600">{urgentCount}</span>
                </div>
              )}

              {!selectMode ? (
                <>
                  {visibleCount > 0 && (
                    <button
                      onClick={() => setSelectMode(true)}
                      className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-100 hover:bg-slate-200 active:scale-[0.96] px-2.5 py-1.5 rounded-xl transition-all duration-100"
                    >
                      <CheckSquare size={13} />
                      Seleccionar
                    </button>
                  )}
                  <button
                    onClick={load}
                    className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-[0.96] transition-all duration-100"
                  >
                    <ArrowClockwise size={15} className="text-slate-500" />
                  </button>
                </>
              ) : (
                <button
                  onClick={exitSelectMode}
                  className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-100 hover:bg-slate-200 active:scale-[0.96] px-2.5 py-1.5 rounded-xl transition-all duration-100"
                >
                  <X size={13} />
                  Cancelar
                </button>
              )}
            </div>
          </div>

          {/* Filtros */}
          {!selectMode && (
            <div className="flex gap-1.5 mt-4 overflow-x-auto pb-1 scrollbar-none">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`shrink-0 text-[11px] font-semibold px-3 py-1.5 rounded-full transition-colors duration-150 ${
                    filter === f.key
                      ? "bg-green-700 text-white"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}

          {/* Select mode: select all / deselect all */}
          {selectMode && (
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-slate-500 font-medium">
                {selectedIds.size} seleccionado{selectedIds.size !== 1 ? "s" : ""}
              </span>
              <button
                onClick={() => {
                  if (selectedIds.size === filtered.length) {
                    setSelectedIds(new Set());
                  } else {
                    setSelectedIds(new Set(filtered.map((p) => p.id)));
                  }
                }}
                className="text-xs font-semibold text-green-700 hover:text-green-800 transition-colors"
              >
                {selectedIds.size === filtered.length ? "Deseleccionar todo" : "Seleccionar todo"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Lista */}
      <div className="px-4 py-4 flex flex-col gap-0">
        {loading ? (
          <div className="flex flex-col gap-2.5">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-24 animate-pulse border border-slate-100" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mb-4">
              <Snowflake size={28} className="text-green-400" />
            </div>
            <p className="font-semibold text-slate-700">Nada por aqui</p>
            <p className="text-sm text-slate-400 mt-1">Escanea un ticket o foto de tu refri</p>
          </div>
        ) : (
          filtered.map((p, i) => (
            /* Wrapper con grid-trick para colapso suave al eliminar */
            <div
              key={p.id}
              style={{
                display: "grid",
                gridTemplateRows: p.removing ? "0fr" : "1fr",
                transition: `grid-template-rows 350ms ${EASE_OUT}, opacity 280ms ${EASE_OUT}, transform 280ms ${EASE_OUT}`,
                opacity: p.removing ? 0 : 1,
                transform: p.removing ? "translateX(20px)" : "translateX(0)",
                marginBottom: p.removing ? 0 : "10px",
              }}
            >
              <div style={{ overflow: "hidden" }}>
                <div
                  className="card-enter"
                  style={{ animationDelay: `${Math.min(i * 45, 250)}ms` }}
                >
                  <ProductCard
                    product={p}
                    onOpen={handleOpen}
                    onDiscard={handleDiscard}
                    selectMode={selectMode}
                    selected={selectedIds.has(p.id)}
                    onSelect={toggleSelect}
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Barra de accion flotante en select mode */}
      {selectMode && (
        <div
          className="fixed bottom-20 left-0 right-0 max-w-md mx-auto px-4 z-20"
          style={{
            animation: `fadeSlideUp 220ms ${EASE_OUT} both`,
          }}
        >
          <div className="bg-slate-900 rounded-2xl p-3 flex gap-2 shadow-xl">
            {visibleCount > 0 && (
              <button
                onClick={handleClearAll}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 active:scale-[0.97] px-3 py-2.5 rounded-xl transition-all duration-100"
              >
                <Trash size={13} />
                Limpiar todo
              </button>
            )}
            <button
              onClick={handleDiscardSelected}
              disabled={selectedIds.size === 0}
              className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold text-white bg-red-500 hover:bg-red-600 active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none px-3 py-2.5 rounded-xl transition-all duration-100"
            >
              <Trash size={13} />
              Tirar {selectedIds.size > 0 ? `${selectedIds.size} seleccionado${selectedIds.size !== 1 ? "s" : ""}` : "seleccionados"}
            </button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
