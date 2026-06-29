"use client";
import { useEffect, useState } from "react";
import { getDashboard } from "@/lib/api";
import BottomNav from "@/components/BottomNav";
import { Leaf, Warning } from "@phosphor-icons/react";

function StatusBar({ data }: { data: any }) {
  const total = data.total_products ?? 0;
  if (!total) return null;
  const segs = [
    { key: "danger",  color: "var(--danger)", count: data.danger_count  ?? 0 },
    { key: "warning", color: "var(--warn)",   count: data.warning_count ?? 0 },
    { key: "fresh",   color: "var(--fresh)",  count: data.fresh_count   ?? 0 },
    { key: "expired", color: "var(--muted)",  count: data.expired_count ?? 0 },
  ].filter((s) => s.count > 0);

  return (
    <div>
      <div style={{ display: "flex", height: 6, gap: 3, borderRadius: 99, overflow: "hidden", background: "var(--border-lo)" }}>
        {segs.map((s) => (
          <div key={s.key} style={{ flex: s.count, background: s.color, borderRadius: 99, transition: "flex 400ms ease" }} />
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
        {[
          { label: "Urgente",  count: data.danger_count  ?? 0, color: "var(--danger-txt)" },
          { label: "Pronto",   count: data.warning_count ?? 0, color: "var(--warn-txt)"   },
          { label: "Frescos",  count: data.fresh_count   ?? 0, color: "var(--fresh-txt)"  },
          { label: "Vencidos", count: data.expired_count ?? 0, color: "var(--muted-txt)"  },
        ].map(({ label, count, color }) => (
          <div key={label} style={{ textAlign: "center" }}>
            <p style={{ fontSize: 22, fontWeight: 800, color, letterSpacing: "-0.03em", lineHeight: 1 }}>{count}</p>
            <p style={{ fontSize: 10, fontWeight: 600, color: "var(--ink-3)", marginTop: 3 }}>{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  useEffect(() => { getDashboard().then(setData); }, []);

  return (
    <div className="pb-28">
      {/* Header */}
      <div className="px-5 pt-12 pb-5" style={{ background: "var(--brand)" }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--brand-text)", letterSpacing: "-0.02em" }}>
          FreshTrack
        </h1>
        <p style={{ fontSize: 12, color: "oklch(1 0 0 / 0.55)", marginTop: 2 }}>Resumen de tu refri</p>
      </div>

      {!data ? (
        <div style={{ padding: "16px 16px 0", display: "flex", flexDirection: "column", gap: 10 }}>
          {[100, 80, 120].map((h, i) => (
            <div key={i} className="anim-card rounded-2xl" style={{ height: h, background: "var(--surface)", border: "1px solid var(--border-lo)", animationDelay: `${i * 60}ms`, opacity: 0.7 }} />
          ))}
        </div>
      ) : (
        <div style={{ padding: "16px 16px 0", display: "flex", flexDirection: "column", gap: 10 }}>

          {/* Waste */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border-lo)", borderRadius: 20, padding: 20 }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-3)" }}>
              Dinero desperdiciado
            </p>
            <p style={{ fontSize: 44, fontWeight: 800, letterSpacing: "-0.04em", color: "var(--ink-1)", lineHeight: 1.05, marginTop: 8 }}>
              S/ {data.total_wasted.toFixed(2)}
            </p>
            <p style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 6 }}>
              {data.waste_count} producto{data.waste_count !== 1 ? "s" : ""} tirado{data.waste_count !== 1 ? "s" : ""}
            </p>
            {data.total_wasted > 0 && (
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--border-lo)" }}>
                <p style={{ fontSize: 12, color: "var(--warn-txt)" }}>
                  Proyección mensual: <strong>S/ {(data.total_wasted * 4).toFixed(2)}</strong> si continúa este patrón
                </p>
              </div>
            )}
          </div>

          {/* Estado del refri */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border-lo)", borderRadius: 20, padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-3)" }}>
                Estado del refri
              </p>
              <span style={{ fontSize: 20, fontWeight: 800, color: "var(--ink-1)", letterSpacing: "-0.03em" }}>
                {data.total_products}
              </span>
            </div>
            {data.total_products > 0
              ? <StatusBar data={data} />
              : <p style={{ fontSize: 13, color: "var(--ink-3)", textAlign: "center" }}>Sin productos aún</p>
            }
          </div>

          {/* Warning próximos */}
          {data.expiring_soon > 0 && (
            <div style={{ background: "var(--warn-bg)", border: "1px solid var(--warn-bg)", borderRadius: 20, padding: 16, display: "flex", gap: 10, alignItems: "center" }}>
              <Warning size={18} style={{ color: "var(--warn)", flexShrink: 0 }} />
              <p style={{ fontSize: 13, color: "var(--warn-txt)" }}>
                <strong>{data.expiring_soon}</strong> producto{data.expiring_soon !== 1 ? "s" : ""} vence{data.expiring_soon !== 1 ? "n" : ""} en los próximos 3 días
              </p>
            </div>
          )}

          {/* Zero state */}
          {data.total_wasted === 0 && data.total_products === 0 && (
            <div style={{
              background: "var(--surface)", border: "1px solid var(--border-lo)", borderRadius: 20,
              padding: 40, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
            }}>
              <Leaf size={28} style={{ color: "var(--fresh)", marginBottom: 12 }} />
              <p style={{ fontWeight: 700, color: "var(--ink-1)" }}>Sin datos aún</p>
              <p style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 4 }}>
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
