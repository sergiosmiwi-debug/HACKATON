"use client";
import { useEffect, useState } from "react";
import { getDashboard, resetWaste, removeWasteEntry } from "@/lib/api";
import BottomNav from "@/components/BottomNav";
import { Leaf, Warning, ArrowCounterClockwise, ChartBar, X, ListBullets } from "@phosphor-icons/react";
import MusicButton from "@/components/MusicButton";

function StatusBar({ data }: { data: any }) {
  const total = data.total_products ?? 0;
  if (!total) return null;
  const segs = [
    { key: "danger",  color: "var(--danger)", count: data.danger_count  ?? 0 },
    { key: "warning", color: "var(--warn)",   count: data.warning_count ?? 0 },
    { key: "fresh",   color: "var(--fresh)",  count: data.fresh_count   ?? 0 },
    { key: "expired", color: "var(--muted)",  count: data.expired_count ?? 0 },
  ].filter(s => s.count > 0);

  return (
    <div>
      <div style={{ display: "flex", height: 7, gap: 3, borderRadius: 99, overflow: "hidden", background: "var(--border-lo)" }}>
        {segs.map(s => (
          <div key={s.key} style={{ flex: s.count, background: s.color, borderRadius: 99, transition: "flex 400ms ease" }} />
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14 }}>
        {[
          { label: "Urgente",  count: data.danger_count  ?? 0, color: "var(--danger-txt)" },
          { label: "Pronto",   count: data.warning_count ?? 0, color: "var(--warn-txt)"   },
          { label: "Frescos",  count: data.fresh_count   ?? 0, color: "var(--fresh-txt)"  },
          { label: "Vencidos", count: data.expired_count ?? 0, color: "var(--muted-txt)"  },
        ].map(({ label, count, color }) => (
          <div key={label} style={{ textAlign: "center" }}>
            <p style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 400, color, letterSpacing: "-0.03em", lineHeight: 1 }}>{count}</p>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 9, fontWeight: 600, color: "var(--ink-3)", marginTop: 3, letterSpacing: "0.06em", textTransform: "uppercase" }}>{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData]         = useState<any>(null);
  const [resetting, setResetting] = useState(false);
  const [showList, setShowList] = useState(false);
  const [removingId, setRemovingId] = useState<number | null>(null);

  useEffect(() => {
    getDashboard("all").then(setData);
  }, []);

  async function handleReset() {
    if (!confirm("¿Reiniciar el contador de desperdicio?")) return;
    setResetting(true);
    await resetWaste();
    const fresh = await getDashboard("all");
    setData(fresh);
    setResetting(false);
  }

  async function handleRemoveEntry(id: number) {
    setRemovingId(id);
    await removeWasteEntry(id);
    const fresh = await getDashboard("all");
    setData(fresh);
    setRemovingId(null);
  }

  return (
    <div style={{ paddingBottom: 96 }}>
      {/* Header */}
      <div className="relative overflow-hidden px-5 pt-12 pb-12" style={{ background: "var(--gradient-header)" }}>
        <div className="flex items-center justify-between mb-1">
          <div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 300, color: "#fff", letterSpacing: "-0.3px", lineHeight: 1 }}>
              Quipu<em style={{ fontStyle: "italic", color: "rgba(255,255,255,0.65)" }}>Recicla</em>
            </h1>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 3, letterSpacing: "0.06em" }}>Tu resumen de desperdicio</p>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <MusicButton />
            <div style={{ width: 40, height: 40, background: "rgba(255,255,255,0.15)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ChartBar size={18} style={{ color: "#fff" }} weight="fill" />
            </div>
          </div>
        </div>
        <div style={{ position: "absolute", bottom: -2, left: 0, right: 0, height: 28, background: "var(--bg)", borderRadius: "50% 50% 0 0 / 24px 24px 0 0" }} />
      </div>

      <div style={{ padding: "12px 16px 0", display: "flex", flexDirection: "column", gap: 12 }}>
        {!data ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[100, 80, 120].map((h, i) => (
              <div key={i} className="anim-card" style={{ height: h, background: "var(--surface)", border: "1px solid var(--border-lo)", borderRadius: 20, opacity: 0.5, animationDelay: `${i*60}ms` }} />
            ))}
          </div>
        ) : (
          <>
            {/* Card desperdicio */}
            <div className="anim-card" style={{ background: "var(--surface)", border: "1px solid var(--border-lo)", borderRadius: 20, padding: 20, boxShadow: "var(--shadow-card)" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
                <p style={{ fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-3)" }}>
                  Desperdicio total
                </p>
                <button onClick={handleReset} disabled={resetting}
                  style={{ display: "flex", alignItems: "center", gap: 4, fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 600, color: "var(--ink-3)", background: "var(--bg)", border: "1px solid var(--border-lo)", borderRadius: 8, padding: "3px 8px", cursor: "pointer", opacity: resetting ? 0.5 : 1 }}>
                  <ArrowCounterClockwise size={11} /> Reiniciar
                </button>
              </div>
              <p style={{ fontFamily: "var(--font-display)", fontSize: 52, fontWeight: 400, letterSpacing: "-0.04em", color: "var(--ink-1)", lineHeight: 1 }}>
                S/ {data.total_wasted.toFixed(2)}
              </p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 6 }}>
                <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--ink-3)" }}>
                  {data.waste_count} producto{data.waste_count !== 1 ? "s" : ""} tirado{data.waste_count !== 1 ? "s" : ""}
                </p>
                {data.waste_count > 0 && (
                  <button onClick={() => setShowList(v => !v)}
                    style={{ display: "flex", alignItems: "center", gap: 4, fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 600, color: "var(--violet)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                    <ListBullets size={13} /> {showList ? "Ocultar" : "Ver detalle"}
                  </button>
                )}
              </div>

              {showList && data.waste_items?.length > 0 && (
                <div className="anim-bar" style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border-lo)", display: "flex", flexDirection: "column", gap: 6 }}>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: 10, color: "var(--ink-3)", marginBottom: 2 }}>
                    ¿Se escaneó algo por error? Quítalo del cuadre:
                  </p>
                  {data.waste_items.map((w: any) => (
                    <div key={w.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", background: "var(--bg)", borderRadius: 10 }}>
                      <span style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--ink-1)", flex: 1 }}>{w.name}</span>
                      <span style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--ink-3)" }}>S/ {w.price.toFixed(2)}</span>
                      <button onClick={() => handleRemoveEntry(w.id)} disabled={removingId === w.id}
                        title="Quitar del cuadre (no contar como pérdida)"
                        style={{ background: "var(--danger-bg)", border: "none", borderRadius: 8, width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", opacity: removingId === w.id ? 0.4 : 1 }}>
                        <X size={12} style={{ color: "var(--danger-txt)" }} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Card estado del refri */}
            <div className="anim-card" style={{ background: "var(--surface)", border: "1px solid var(--border-lo)", borderRadius: 20, padding: 20, boxShadow: "var(--shadow-card)", animationDelay: "60ms" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <p style={{ fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-3)" }}>
                  Inventario actual
                </p>
                <span style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 400, color: "var(--ink-1)", letterSpacing: "-0.03em" }}>
                  {data.total_products}
                </span>
              </div>
              {data.total_products > 0
                ? <StatusBar data={data} />
                : (
                  <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--ink-3)", textAlign: "center", padding: "12px 0" }}>
                    Sin productos aún
                  </p>
                )
              }
            </div>

            {/* Alerta próximos a vencer */}
            {data.expiring_soon > 0 && (
              <div className="anim-card" style={{ background: "var(--warn-bg)", border: "1px solid rgba(201,122,26,0.2)", borderRadius: 20, padding: 16, display: "flex", gap: 10, alignItems: "center", animationDelay: "120ms" }}>
                <Warning size={18} style={{ color: "var(--warn)", flexShrink: 0 }} />
                <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--warn-txt)" }}>
                  <strong>{data.expiring_soon}</strong> producto{data.expiring_soon !== 1 ? "s" : ""} {data.expiring_soon !== 1 ? "vencen" : "vence"} en los próximos 3 días
                </p>
              </div>
            )}

            {/* Zero state */}
            {data.total_wasted === 0 && data.total_products === 0 && (
              <div className="anim-scale" style={{ background: "var(--surface)", border: "1px solid var(--border-lo)", borderRadius: 20, padding: 40, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", boxShadow: "var(--shadow-card)" }}>
                <Leaf size={28} style={{ color: "var(--fresh)", marginBottom: 12 }} />
                <p style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 400, color: "var(--ink-1)" }}>
                  Sin <em style={{ fontStyle: "italic", color: "var(--fresh)" }}>datos</em> aún
                </p>
                <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--ink-3)", marginTop: 4 }}>
                  Escanea tu primer ticket para empezar
                </p>
              </div>
            )}
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
