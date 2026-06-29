"use client";
import { useEffect, useState } from "react";
import { getDashboard } from "@/lib/api";
import BottomNav from "@/components/BottomNav";
import { ChartBar, Trash, Package, WarningCircle, Leaf } from "@phosphor-icons/react";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    getDashboard().then(setData);
  }, []);

  if (!data) {
    return (
      <div className="pb-24">
        <div className="bg-white px-5 pt-12 pb-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-green-700 rounded-xl flex items-center justify-center">
              <ChartBar size={18} weight="fill" className="text-white" />
            </div>
            <div>
              <h1 className="text-[17px] font-bold text-slate-900">Resumen</h1>
              <p className="text-[11px] text-slate-400">Tu impacto alimentario</p>
            </div>
          </div>
        </div>
        <div className="px-4 py-5 flex flex-col gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl h-28 animate-pulse border border-slate-100" />
          ))}
        </div>
        <BottomNav />
      </div>
    );
  }

  const monthlyProjection = (data.total_wasted * 4).toFixed(2);

  return (
    <div className="pb-24">
      <div className="bg-white px-5 pt-12 pb-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-green-700 rounded-xl flex items-center justify-center">
            <ChartBar size={18} weight="fill" className="text-white" />
          </div>
          <div>
            <h1 className="text-[17px] font-bold text-slate-900">Resumen</h1>
            <p className="text-[11px] text-slate-400">Tu impacto alimentario</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-5 flex flex-col gap-3">
        <div className="bg-slate-900 rounded-2xl p-5 text-white">
          <div className="flex items-center gap-2 mb-3">
            <Trash size={14} className="text-red-400" />
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Dinero desperdiciado</span>
          </div>
          <p className="text-5xl font-bold tracking-tight">S/ {data.total_wasted.toFixed(2)}</p>
          <p className="text-sm text-slate-400 mt-2">
            {data.waste_count} producto{data.waste_count !== 1 ? "s" : ""} tirado{data.waste_count !== 1 ? "s" : ""}
          </p>
          {data.total_wasted > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-800">
              <p className="text-xs text-slate-400">
                A este ritmo, desperdicias hasta{" "}
                <span className="text-red-400 font-bold">S/ {monthlyProjection}</span> al mes
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 border border-slate-100">
            <div className="flex items-center gap-1.5 mb-2">
              <Package size={14} className="text-slate-400" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">En refri</span>
            </div>
            <p className="text-4xl font-bold text-slate-900">{data.total_products}</p>
            <p className="text-xs text-slate-400 mt-1">productos activos</p>
          </div>

          <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
            <div className="flex items-center gap-1.5 mb-2">
              <WarningCircle size={14} className="text-amber-500" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-600">Proximos</span>
            </div>
            <p className="text-4xl font-bold text-amber-700">{data.expiring_soon}</p>
            <p className="text-xs text-amber-500 mt-1">vencen en 3 dias</p>
          </div>
        </div>

        {data.total_wasted === 0 && data.total_products === 0 && (
          <div className="bg-green-50 border border-green-100 rounded-2xl p-6 flex flex-col items-center text-center">
            <Leaf size={32} className="text-green-500 mb-3" />
            <p className="font-semibold text-green-800">Sin desperdicios aun</p>
            <p className="text-sm text-green-600 mt-1">Escanea tu primer ticket para empezar a trackear</p>
          </div>
        )}

        {data.total_wasted === 0 && data.total_products > 0 && (
          <div className="bg-green-50 border border-green-100 rounded-2xl p-4">
            <p className="text-sm font-semibold text-green-800 mb-1">Todo bajo control</p>
            <p className="text-sm text-green-700">
              Ningun desperdicio registrado. Sigue usando FreshTrack para mantener este ritmo.
            </p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
