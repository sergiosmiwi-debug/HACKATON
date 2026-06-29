"use client";
import { useState, useRef } from "react";
import { scanReceipt, scanFridge, addProduct } from "@/lib/api";
import BottomNav from "@/components/BottomNav";
import { useRouter } from "next/navigation";
import { Camera, CheckCircle, Circle, FloppyDisk, CircleNotch, ArrowCounterClockwise } from "@phosphor-icons/react";

type ScanMode = "receipt" | "fridge";
type Item = { name: string; price?: number; quantity?: string };

export default function ScanPage() {
  const [mode,     setMode]     = useState<ScanMode>("receipt");
  const [preview,  setPreview]  = useState<string | null>(null);
  const [file,     setFile]     = useState<File | null>(null);
  const [loading,  setLoading]  = useState(false);
  const [detected, setDetected] = useState<Item[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [phone,    setPhone]    = useState("");
  const [done,     setDone]     = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router   = useRouter();

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f); setPreview(URL.createObjectURL(f));
    setDetected([]); setSelected(new Set()); setDone(false);
  }

  async function handleScan() {
    if (!file) return;
    setLoading(true);
    try {
      const r = mode === "receipt"
        ? await scanReceipt(file, phone || undefined)
        : await scanFridge(file, phone || undefined);
      const items: Item[] = (r.detected ?? []).map((name: string) => ({ name }));
      setDetected(items);
      setSelected(new Set(items.map((_: Item, i: number) => i)));
    } catch { alert("Error al escanear. Intenta de nuevo."); }
    setLoading(false);
  }

  async function handleSave() {
    setLoading(true);
    for (const i of selected) {
      const item = detected[i];
      await addProduct(item.name, item.quantity ?? "1", item.price ?? 0, phone || undefined);
    }
    setDone(true); setLoading(false);
    setTimeout(() => router.push("/"), 1200);
  }

  function reset() {
    setPreview(null); setFile(null);
    setDetected([]); setSelected(new Set()); setDone(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  function toggleSel(i: number) {
    setSelected((p) => { const n = new Set(p); n.has(i) ? n.delete(i) : n.add(i); return n; });
  }

  if (done) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100dvh", gap: 12, background: "var(--bg)" }}>
      <div style={{ width: 72, height: 72, background: "var(--fresh-bg)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 20px rgba(46,125,68,0.20)" }}>
        <CheckCircle size={38} weight="fill" style={{ color: "var(--fresh)" }} />
      </div>
      <p style={{ fontSize: 18, fontWeight: 800, color: "var(--ink-1)", letterSpacing: "-0.02em" }}>Guardado</p>
      <p style={{ fontSize: 13, color: "var(--ink-3)" }}>Volviendo al inventario…</p>
    </div>
  );

  return (
    <div style={{ paddingBottom: 100, background: "var(--bg)", minHeight: "100dvh" }}>
      {/* Header */}
      <div
        className="px-5 pt-12 pb-5"
        style={{ background: "linear-gradient(170deg, #1a4a28 0%, #153d22 100%)" }}
      >
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#fff", letterSpacing: "-0.03em" }}>
          Escanear
        </h1>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 3, fontWeight: 500 }}>
          Ticket de compra o foto del refri
        </p>
      </div>

      <div style={{ padding: "16px 14px 0", display: "flex", flexDirection: "column", gap: 12 }}>

        {/* Mode toggle */}
        <div style={{
          display: "flex",
          background: "var(--surface)",
          border: "1px solid var(--border-lo)",
          borderRadius: 14,
          padding: 4,
          boxShadow: "var(--shadow-card)",
          gap: 4,
        }}>
          {(["receipt", "fridge"] as ScanMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                flex: 1,
                fontSize: 13, fontWeight: 600,
                padding: "9px 0",
                borderRadius: 10,
                border: "none",
                background: mode === m ? "var(--brand)" : "transparent",
                color: mode === m ? "#fff" : "var(--ink-3)",
                cursor: "pointer",
                transition: "all 180ms ease",
              }}
            >
              {m === "receipt" ? "Ticket" : "Refri"}
            </button>
          ))}
        </div>

        {/* Photo zone */}
        <div
          onClick={() => inputRef.current?.click()}
          style={{
            height: 200,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "var(--surface)",
            border: "2px dashed var(--border)",
            borderRadius: 18,
            overflow: "hidden",
            cursor: "pointer",
            transition: "border-color 150ms ease",
            boxShadow: "var(--shadow-card)",
            position: "relative",
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--brand-mid)")}
          onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}
        >
          {preview ? (
            <>
              <img src={preview} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <button
                onClick={e => { e.stopPropagation(); reset(); }}
                style={{
                  position: "absolute", top: 10, right: 10,
                  width: 32, height: 32,
                  background: "rgba(0,0,0,0.55)",
                  border: "none",
                  borderRadius: 99,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", cursor: "pointer",
                }}
              >
                <ArrowCounterClockwise size={14} weight="bold" />
              </button>
            </>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: 24, textAlign: "center" }}>
              <div style={{ width: 52, height: 52, background: "var(--brand-bg)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 12px rgba(26,74,40,0.12)" }}>
                <Camera size={24} style={{ color: "var(--brand)" }} />
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: "var(--ink-2)" }}>Subir foto</p>
                <p style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>o tomar con la cámara</p>
              </div>
            </div>
          )}
        </div>
        <input ref={inputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFile} />

        {/* Phone */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border-lo)", borderRadius: 14, padding: "12px 16px", boxShadow: "var(--shadow-card)" }}>
          <label style={{ display: "block", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-3)", marginBottom: 6 }}>
            WhatsApp (opcional)
          </label>
          <input
            type="tel" placeholder="+51 999 999 999"
            value={phone} onChange={(e) => setPhone(e.target.value)}
            style={{ width: "100%", fontSize: 14, color: "var(--ink-1)", background: "none", border: "none", outline: "none" }}
          />
        </div>

        {/* Scan CTA */}
        {file && detected.length === 0 && (
          <button
            onClick={handleScan} disabled={loading}
            style={{
              height: 54, width: "100%",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              fontSize: 15, fontWeight: 700,
              color: "#fff",
              background: loading ? "var(--brand-mid)" : "var(--brand)",
              border: "none", borderRadius: 16,
              cursor: loading ? "default" : "pointer",
              boxShadow: "0 4px 16px rgba(26,74,40,0.25)",
              transition: "transform 80ms ease, background 150ms ease",
            }}
            onMouseDown={e => !loading && (e.currentTarget.style.transform = "scale(0.98)")}
            onMouseUp={e => (e.currentTarget.style.transform = "scale(1)")}
            onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
          >
            {loading
              ? <><CircleNotch size={18} className="animate-spin" /> Analizando…</>
              : "Analizar foto"
            }
          </button>
        )}

        {/* Results */}
        {detected.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-3)" }}>
                {detected.length} detectado{detected.length !== 1 ? "s" : ""}
              </p>
              <button onClick={reset} style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-3)", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                <ArrowCounterClockwise size={12} />
                Nueva foto
              </button>
            </div>
            {detected.map((item, i) => (
              <button
                key={i} onClick={() => toggleSel(i)}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "13px 14px", borderRadius: 14, cursor: "pointer",
                  background: selected.has(i) ? "var(--brand-bg)" : "var(--surface)",
                  border: selected.has(i) ? "1px solid var(--brand)" : "1px solid var(--border-lo)",
                  boxShadow: selected.has(i) ? "none" : "var(--shadow-card)",
                  opacity: selected.has(i) ? 1 : 0.55,
                  transition: "all 150ms ease",
                  textAlign: "left",
                }}
              >
                {selected.has(i)
                  ? <CheckCircle size={18} weight="fill" style={{ color: "var(--brand)", flexShrink: 0 }} />
                  : <Circle size={18} style={{ color: "var(--ink-3)", flexShrink: 0 }} />
                }
                <span style={{ fontSize: 14, fontWeight: 600, color: "var(--ink-1)", flex: 1 }}>{item.name}</span>
                {item.price != null && item.price > 0 && (
                  <span style={{ fontSize: 12, color: "var(--ink-3)", fontVariantNumeric: "tabular-nums" }}>S/ {item.price}</span>
                )}
              </button>
            ))}
            <button
              onClick={handleSave} disabled={loading || selected.size === 0}
              style={{
                height: 54, width: "100%",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                fontSize: 15, fontWeight: 700,
                color: selected.size === 0 ? "var(--ink-3)" : "#fff",
                background: selected.size === 0 ? "var(--surface)" : "var(--brand)",
                border: "1px solid var(--border-lo)",
                borderRadius: 16, marginTop: 4,
                opacity: loading ? 0.7 : 1,
                boxShadow: selected.size > 0 ? "0 4px 16px rgba(26,74,40,0.25)" : "none",
                transition: "all 150ms ease",
                cursor: selected.size === 0 ? "default" : "pointer",
              }}
              onMouseDown={e => selected.size > 0 && !loading && (e.currentTarget.style.transform = "scale(0.98)")}
              onMouseUp={e => (e.currentTarget.style.transform = "scale(1)")}
              onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
            >
              {loading
                ? <><CircleNotch size={16} className="animate-spin" /> Guardando…</>
                : <><FloppyDisk size={16} /> Guardar {selected.size > 0 ? `${selected.size} producto${selected.size !== 1 ? "s" : ""}` : ""}</>
              }
            </button>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
