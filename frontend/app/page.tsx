"use client";
import { useEffect, useState } from "react";
import { getProducts, markOpened, discardProduct } from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import BottomNav from "@/components/BottomNav";

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  async function load() {
    setLoading(true);
    const data = await getProducts();
    setProducts(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleOpen(id: number) {
    await markOpened(id);
    load();
  }

  async function handleDiscard(id: number) {
    await discardProduct(id);
    load();
  }

  const filtered = filter === "all"
    ? products
    : products.filter((p) => p.status === filter);

  const counts = {
    danger: products.filter((p) => p.status === "danger" || p.status === "expired").length,
    warning: products.filter((p) => p.status === "warning").length,
  };

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="bg-white px-5 pt-12 pb-5 sticky top-0 z-10 border-b border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl font-bold text-slate-800">🧊 ¿Qué nombre le ponemos, Valentina?</h1>
          {counts.danger > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
              {counts.danger} urgente{counts.danger > 1 ? "s" : ""}
            </span>
          )}
        </div>
        <p className="text-sm text-slate-400">{products.length} productos en tu refri</p>

        {/* Filtros */}
        <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
          {[
            { key: "all", label: "Todos" },
            { key: "danger", label: "🔴 Urgente" },
            { key: "warning", label: "🟡 Pronto" },
            { key: "fresh", label: "🟢 Frescos" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`shrink-0 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                filter === f.key
                  ? "bg-green-600 text-white border-green-600"
                  : "bg-white text-slate-500 border-slate-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista */}
      <div className="px-4 py-4 flex flex-col gap-3">
        {loading ? (
          <div className="text-center py-16 text-slate-400">Cargando...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🎉</p>
            <p className="text-slate-500 font-medium">No hay productos aquí</p>
            <p className="text-sm text-slate-400 mt-1">Escanea un ticket o tu refri</p>
          </div>
        ) : (
          filtered.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onOpen={handleOpen}
              onDiscard={handleDiscard}
            />
          ))
        )}
      </div>
      <BottomNav />
    </div>
  );
}
