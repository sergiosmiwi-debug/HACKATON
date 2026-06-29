"use client";
import { useEffect, useState } from "react";
import { getDashboard } from "@/lib/api";
import BottomNav from "@/components/BottomNav";
import { ChartBar, Leaf } from "@phosphor-icons/react";

/* Mini status bar segments */
function StatusBar({ data }: { data: any }) {
  const total = (data.total_products ?? 0);
  if (!total) return null;

  const segments = [
    { key: "danger",  color: "var(--danger)", count: data.danger_count  ?? 0 },
    { key: "warning", color: "var(--warn)",   count: data.warning_count ?? 0 },
    { key: "fresh",   color: "var(--fresh)",  count: data.fresh_count   ?? 0 },
    { key: "expired", color: "var(--muted)",  count: data.expired_count ?? 0 },
  ].filter((s) => s.count > 0);

  return (
    <div>
      <div className="flex rounded-full overflow-hidden" style={{ height: 6, background: "var(--border-lo)", gap: 2 }}>
        {segments.map((s) => (
          <div
            key={s.key}
            style={{
              flex: s.count,
              background: s.color,
              borderRadius: 99,
              transition: "flex 400ms ease",
            }}
          />
        ))}
      </div>
      <div className="flex justify-between mt-2">
        {[
          { label: "Urgente",  count: data.danger_count  ?? 0, color: "var(--danger-text)" },
          { label: "Pronto",   count: data.warning_count ?? 0, color: "var(--warn-text)"   },
          { label: "Frescos",  count: data.fresh_count   ?? 0, color: "var(--fresh-text)"  },
          { label: "Vencidos", count: data.expired_count ?? 0, color: "var(--muted-text)"  },
        ].map(({ label, count, color }) => (
          <div key={label} className="text-center">
            <p className="text-base font-bold" style={{ color }}>{count}</p>
            <p className="text-[10px]" style={{ color: "var(--ink-3)" }}>{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="px-4 py-5 flex flex-col gap-3">
      {[96, 80, 120].map((h, i) => (
        <div
          key={i}
          className="rounded-2xl"
          style={{ height: h, background: "var(--surface)", opacity: 0.5 }}
        />
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => { getDashboard().then(setData); }, []);

  return (
    <div className="pb-28">
      {/* Header */}
      <div
        className="px-5 pt-12 pb-5"
        style={{ borderBottom: "1px solid var(--border-lo)" }}
      >
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: "var(--brand)" }} />
          <h1 className="text-xl font-bold tracking-tight" style={{ color: "var(--ink-1)" }}>
            FreshTrack
          </h1>
        </div>
        <p className="text-sm mt-0.5" style={{ color: "var(--ink-3)" }}>Resumen de tu refri</p>
      </div>

      {!data ? (
        <Skeleton />
      ) : (
        <div className="px-4 py-5 flex flex-col gap-3">

          {/* Waste card */}
          <div
            className="rounded-2xl p-5"
            style={{ background: "var(--surface)", border: "1px solid var(--border-lo)" }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--ink-3)" }}>
              Dinero desperdiciado
            </p>
            <p className="text-5xl font-bold tracking-tighter" style={{ color: "var(--ink-1)" }}>
              S/ {data.total_wasted.toFixed(2)}
            </p>
            <p className="text-sm mt-2" style={{ color: "var(--ink-3)" }}>
              {data.waste_count} producto{data.waste_count !== 1 ? "s" : ""} tirado{data.waste_count !== 1 ? "s" : ""}
            </p>
            {data.total_wasted > 0 && (
              <p className="text-xs mt-3 pt-3" style={{ color: "var(--warn-text)", borderTop: "1px solid var(--border-lo)" }}>
                Proyección mensual: <strong>S/ {(data.total_wasted * 4).toFixed(2)}</strong> si continúa este patrón
              </p>
            )}
          </div>

          {/* Estado del refri */}
          <div
            className="rounded-2xl p-5"
            style={{ background: "var(--surface)", border: "1px solid var(--border-lo)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--ink-3)" }}>
                Estado del refri
              </p>
              <span className="text-sm font-bold" style={{ color: "var(--ink-1)" }}>
                {data.total_products} total
              </span>
            </div>

            {data.total_products > 0 ? (
              <StatusBar data={data} />
            ) : (
              <p className="text-sm text-center py-2" style={{ color: "var(--ink-3)" }}>
                Sin productos aún
              </p>
            )}
          </div>

          {/* Próximos a vencer */}
          {data.expiring_soon > 0 && (
            <div
              className="rounded-2xl p-4 flex items-center gap-3"
              style={{ background: "var(--warn-bg)", border: "1px solid var(--warn-bg)" }}
            >
              <ChartBar size={18} style={{ color: "var(--warn-text)", flexShrink: 0 }} />
              <p className="text-sm" style={{ color: "var(--warn-text)" }}>
                <strong>{data.expiring_soon}</strong> producto{data.expiring_soon !== 1 ? "s" : ""} vence{data.expiring_soon !== 1 ? "n" : ""} en los próximos 3 días
              </p>
            </div>
          )}

          {/* Zero state */}
          {data.total_wasted === 0 && data.total_products === 0 && (
            <div
              className="rounded-2xl p-8 flex flex-col items-center text-center"
              style={{ background: "var(--surface)", border: "1px solid var(--border-lo)" }}
            >
              <Leaf size={28} style={{ color: "var(--fresh)", marginBottom: 12 }} />
              <p className="font-semibold" style={{ color: "var(--ink-1)" }}>Sin datos aún</p>
              <p className="text-sm mt-1" style={{ color: "var(--ink-3)" }}>
                Escanea tu primer ticket para empezar
              </p>
            </div>
          )}
        </div>
      )}

      <BottomNav />
    </div>
  );
}
