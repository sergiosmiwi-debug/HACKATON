"use client";
import { useEffect, useState } from "react";
import { getDashboard } from "@/lib/api";
import BottomNav from "@/components/BottomNav";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    getDashboard().then(setData);
  }, []);

  if (!data) return (
    <div className="flex items-center justify-center min-h-screen text-slate-400">Cargando...</div>
  );

  return (
    <div className="pb-24">
      <div className="bg-white px-5 pt-12 pb-5 border-b border-slate-100 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-800">📊 Resumen</h1>
        <p className="text-sm text-slate-400 mt-1">Tu impacto alimentario</p>
      </div>

      <div className="px-4 py-5 flex flex-col gap-4">
        {/* Dinero desperdiciado */}
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-center">
          <p className="text-sm text-red-500 font-medium uppercase tracking-wide mb-1">Dinero desperdiciado</p>
          <p className="text-5xl font-bold text-red-600">S/ {data.total_wasted.toFixed(2)}</p>
          <p className="text-sm text-red-400 mt-2">{data.waste_count} producto{data.waste_count !== 1 ? "s" : ""} tirado{data.waste_count !== 1 ? "s" : ""}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center">
            <p className="text-3xl font-bold text-slate-800">{data.total_products}</p>
            <p className="text-xs text-slate-400 mt-1">Productos en refri</p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 text-center">
            <p className="text-3xl font-bold text-yellow-600">{data.expiring_soon}</p>
            <p className="text-xs text-yellow-500 mt-1">Vencen en 3 días</p>
          </div>
        </div>

        {/* Tip */}
        {data.total_wasted > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
            <p className="text-sm font-semibold text-green-700 mb-1">💡 Dato</p>
            <p className="text-sm text-green-600">
              En un mes, podrías desperdiciar hasta{" "}
              <strong>S/ {(data.total_wasted * 4).toFixed(2)}</strong> si continúas
              con este patrón. ¡Usa FreshTrack para evitarlo!
            </p>
          </div>
        )}

        {data.total_wasted === 0 && data.total_products === 0 && (
          <div className="text-center py-10">
            <p className="text-4xl mb-3">🌱</p>
            <p className="text-slate-500 font-medium">Sin datos aún</p>
            <p className="text-sm text-slate-400 mt-1">Escanea tu primer ticket para empezar</p>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
