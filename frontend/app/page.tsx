"use client";
import { useEffect, useState } from "react";
import { getProducts, markOpened, discardProduct } from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import BottomNav from "@/components/BottomNav";
import { Snowflake, Warning, ArrowClockwise } from "@phosphor-icons/react";

const FILTERS = [
  { key: "all",     label: "Todos" },
  { key: "danger",  label: "Urgente" },
  { key: "warning", label: "Pronto" },
  { key: "fresh",   label: "Frescos" },
  { key: "expired", label: "Vencidos" },
];

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

  const urgentCount = products.filter(
    (p) => p.status === "danger" || p.status === "expired"
  ).length;

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
                <p className="text-[11px] text-slate-400 leading-tight">{products.length} productos en tu refri</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {urgentCount > 0 && (
                <div className="flex items-center gap-1 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full">
                  <Warning size={12} weight="fill" className="text-red-500" />
                  <span className="text-xs font-bold text-red-600">{urgentCount}</span>
                </div>
              )}
              <button
                onClick={load}
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                <ArrowClockwise size={15} className="text-slate-500" />
              </button>
            </div>
          </div>

          {/* Filtros */}
          <div className="flex gap-1.5 mt-4 overflow-x-auto pb-1 scrollbar-none">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`shrink-0 text-[11px] font-semibold px-3 py-1.5 rounded-full transition-colors ${
                  filter === f.key
                    ? "bg-green-700 text-white"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Lista */}
      <div className="px-4 py-4 flex flex-col gap-2.5">
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
