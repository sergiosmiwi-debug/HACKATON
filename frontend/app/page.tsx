"use client";
import { useEffect, useState, useCallback } from "react";
import { getProducts, markOpened, consumeProduct, discardProduct, setProductMaterial } from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import BottomNav from "@/components/BottomNav";
import { ArrowClockwise, CheckSquare, X, Trash, Leaf, BellSlash } from "@phosphor-icons/react";
import { requestNotificationPermission, checkExpiringAndNotify, canNotify } from "@/lib/notifications";
import MusicButton from "@/components/MusicButton";

type Product = {
  id: number; name: string; category: string; quantity: string;
  days_left: number | null; status: string; purchase_price: number;
  opened_date?: string | null; changes_on_open?: boolean; material?: string | null;
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
  set(p => p.map(x => ids.includes(x.id) ? { ...x, removing: true } : x));
  setTimeout(() => { set(p => p.filter(x => !ids.includes(x.id))); after?.(); }, 370);
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState("all");
  const [selectMode, setSel]    = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [loadKey, setLoadKey]   = useState(0);
  const [notifGranted, setNotifGranted] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await getProducts();
    setProducts(data);
    setLoading(false);
    checkExpiringAndNotify(data);
  }, []);

  useEffect(() => { load(); }, [load, loadKey]);

  useEffect(() => {
    if (canNotify()) setNotifGranted(Notification.permission === "granted");
  }, []);


  async function handleEnableNotifs() {
    const granted = await requestNotificationPermission();
    setNotifGranted(granted);
    if (granted) checkExpiringAndNotify(products);
  }

  function toggle(id: number) {
    setSelected(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }
  function exitSel() { setSel(false); setSelected(new Set()); }

  async function handleOpen(id: number) { await markOpened(id); setLoadKey(k => k + 1); }
  function handleConsume(id: number) { consumeProduct(id); animateOut([id], setProducts); }
  async function handleSetMaterial(id: number, material: string) {
    setProducts(p => p.map(x => x.id === id ? { ...x, material } : x));
    await setProductMaterial(id, material);
  }
  function handleDiscard(id: number) { discardProduct(id); animateOut([id], setProducts); }
  function handleDiscardSel() { const ids = [...selected]; ids.forEach(id => discardProduct(id)); animateOut(ids, setProducts, exitSel); }
  function handleClearAll() { const ids = products.map(p => p.id); ids.forEach(id => discardProduct(id)); animateOut(ids, setProducts); }

  const visible  = products.filter(p => !p.removing);
  const filtered = filter === "all" ? visible : visible.filter(p => p.status === filter);
  const urgent   = visible.filter(p => p.status === "danger" || p.status === "expired").length;

  return (
    <div style={{ paddingBottom: 96 }}>
      {/* Header degradado */}
      <div className="sticky top-0 z-10 relative overflow-hidden px-5 pt-12 pb-12" style={{ background: "var(--gradient-header)" }}>
        <div className="flex items-center justify-between mb-1">
          <div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 300, color: "#fff", letterSpacing: "-0.3px", lineHeight: 1 }}>
              Quipu<em style={{ fontStyle: "italic", color: "rgba(255,255,255,0.75)" }}>Recicla</em>
            </h1>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 3, letterSpacing: "0.06em" }}>
              {visible.length} {visible.length === 1 ? "producto" : "productos"}
              {urgent > 0 && !selectMode && ` · ${urgent} urgente${urgent !== 1 ? "s" : ""}`}
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {!selectMode ? (
              <>
                <MusicButton />
                {canNotify() && !notifGranted && (
                  <button onClick={handleEnableNotifs} className="active:scale-[0.95]" title="Activar notificaciones de vencimiento"
                    style={{ width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", background: "rgba(255,255,255,0.15)", borderRadius: 10, border: "none", cursor: "pointer" }}>
                    <BellSlash size={15} />
                  </button>
                )}
                {visible.length > 0 && (
                  <button onClick={() => setSel(true)} className="active:scale-[0.95]" title="Seleccionar productos"
                    style={{ width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", background: "rgba(255,255,255,0.15)", borderRadius: 10, border: "none", cursor: "pointer" }}>
                    <CheckSquare size={15} />
                  </button>
                )}
                <button onClick={load} className="active:scale-[0.95]"
                  style={{ width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", background: "rgba(255,255,255,0.15)", borderRadius: 10, border: "none", cursor: "pointer" }}>
                  <ArrowClockwise size={15} />
                </button>
              </>
            ) : (
              <button onClick={exitSel} className="active:scale-[0.95]"
                style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 600, color: "#fff", background: "rgba(255,255,255,0.15)", borderRadius: 10, padding: "6px 10px", border: "none", cursor: "pointer" }}>
                <X size={13} /> Cancelar
              </button>
            )}
          </div>
        </div>

        {!selectMode ? (
          <div className="flex gap-1.5 mt-4 overflow-x-auto pb-0.5" style={{ scrollbarWidth: "none" }}>
            {FILTERS.map(({ key, label }) => {
              const active = filter === key;
              return (
                <button key={key} onClick={() => setFilter(key)}
                  style={{ flexShrink: 0, fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 600, padding: "5px 14px", borderRadius: 99, color: active ? "var(--brand)" : "rgba(255,255,255,0.7)", background: active ? "#fff" : "rgba(255,255,255,0.13)", border: "none", transition: "all 150ms ease", cursor: "pointer" }}>
                  {label}
                </button>
              );
            })}
          </div>
        ) : (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
            <span style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "rgba(255,255,255,0.55)" }}>
              {selected.size} seleccionado{selected.size !== 1 ? "s" : ""}
            </span>
            <button onClick={() => setSelected(selected.size === filtered.length ? new Set() : new Set(filtered.map(p => p.id)))}
              style={{ fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 600, color: "#fff", background: "none", border: "none", cursor: "pointer" }}>
              {selected.size === filtered.length ? "Deseleccionar todo" : "Seleccionar todo"}
            </button>
          </div>
        )}

        {/* Ola inferior */}
        <div style={{ position: "absolute", bottom: -2, left: 0, right: 0, height: 28, background: "var(--bg)", borderRadius: "50% 50% 0 0 / 24px 24px 0 0" }} />
      </div>

      {/* Leyenda de colores */}
      <div style={{ padding: "10px 16px 4px", display: "flex", gap: 12, flexWrap: "wrap" }}>
        {[
          { color: "#1c7a4a", label: "Bolsa verde · reciclables" },
          { color: "#9a6b2c", label: "Caja · cartón/papel" },
          { color: "#2b2b2b", label: "Bolsa negra · generales" },
          { color: "#b7b0a2", label: "Sin identificar" },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: color, flexShrink: 0 }} />
            <span style={{ fontFamily: "var(--font-body)", fontSize: 10, color: "var(--ink-3)", fontWeight: 500 }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Lista */}
      <div style={{ padding: "12px 16px 0" }}>
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[0,1,2].map(i => (
              <div key={i} className="anim-card" style={{ height: 88, background: "var(--surface)", border: "1px solid var(--border-lo)", borderRadius: 20, animationDelay: `${i*60}ms`, opacity: 0.6 }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="anim-scale" style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 80, textAlign: "center" }}>
            <div style={{ width: 60, height: 60, background: "var(--brand-bg)", borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <Leaf size={28} style={{ color: "var(--brand)" }} />
            </div>
            <p style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 400, color: "var(--ink-1)" }}>
              Nada por <em style={{ fontStyle: "italic", color: "var(--violet)" }}>aquí</em>
            </p>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--ink-3)", marginTop: 6 }}>
              Escanea un ticket o foto de tu refri
            </p>
          </div>
        ) : (
          filtered.map((p, i) => (
            <div key={p.id} style={{
              display: "grid",
              gridTemplateRows: p.removing ? "0fr" : "1fr",
              opacity: p.removing ? 0 : 1,
              transform: p.removing ? "translateX(16px)" : "translateX(0)",
              marginBottom: p.removing ? 0 : 10,
              transition: `grid-template-rows 340ms ${EASE}, opacity 250ms ${EASE}, transform 250ms ${EASE}, margin-bottom 340ms ${EASE}`,
            }}>
              <div style={{ overflow: "hidden" }}>
                <div className="anim-card" style={{ animationDelay: `${Math.min(i*45, 200)}ms` }}>
                  <ProductCard product={p} onOpen={handleOpen} onConsume={handleConsume} onDiscard={handleDiscard} onSetMaterial={handleSetMaterial} selectMode={selectMode} selected={selected.has(p.id)} onSelect={toggle} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {selectMode && (
        <div className="fixed left-0 right-0 max-w-md mx-auto px-4 anim-bar" style={{ bottom: 88, zIndex: 20 }}>
          <div style={{ display: "flex", gap: 8, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 18, padding: 10, boxShadow: "var(--shadow-card)" }}>
            {visible.length > 0 && (
              <button onClick={handleClearAll} className="active:scale-[0.96]"
                style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600, color: "var(--ink-2)", background: "var(--bg)", border: "1px solid var(--border-lo)", borderRadius: 12, padding: "9px 14px", cursor: "pointer" }}>
                <Trash size={12} /> Limpiar todo
              </button>
            )}
            <button onClick={handleDiscardSel} disabled={selected.size === 0} className="active:scale-[0.96]"
              style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 700, color: selected.size === 0 ? "var(--muted)" : "var(--danger-txt)", background: selected.size === 0 ? "var(--muted-bg)" : "var(--danger-bg)", border: "none", borderRadius: 12, padding: "9px 14px", cursor: selected.size === 0 ? "default" : "pointer", pointerEvents: selected.size === 0 ? "none" : "auto" }}>
              <Trash size={12} /> Tirar {selected.size > 0 ? `${selected.size} seleccionado${selected.size !== 1 ? "s" : ""}` : "seleccionados"}
            </button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
