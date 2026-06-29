"use client";
import { useState, useRef } from "react";
import { scanReceipt, scanFridge, addProduct } from "@/lib/api";
import BottomNav from "@/components/BottomNav";
import { useRouter } from "next/navigation";
import { Receipt, Snowflake, Camera, ArrowLeft, CheckCircle, Circle, FloppyDisk, CircleNotch } from "@phosphor-icons/react";

type ScanMode = "receipt" | "fridge" | null;
type Item = { name: string; price?: number; quantity?: string };

export default function ScanPage() {
  const [mode,     setMode]     = useState<ScanMode>(null);
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
    if (!file || !mode) return;
    setLoading(true);
    try {
      const r = mode === "receipt"
        ? await scanReceipt(file, phone || undefined)
        : await scanFridge(file, phone || undefined);
      const items: Item[] = (r.detected ?? []).map((name: string) => ({ name }));
      setDetected(items);
      setSelected(new Set(items.map((_: any, i: number) => i)));
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
    setTimeout(() => router.push("/"), 1400);
  }

  function toggleSel(i: number) {
    setSelected((p) => { const n = new Set(p); n.has(i) ? n.delete(i) : n.add(i); return n; });
  }
  function reset() { setMode(null); setPreview(null); setFile(null); setDetected([]); setSelected(new Set()); }

  if (done) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100dvh", gap: 12 }}>
      <div style={{ width: 64, height: 64, background: "var(--fresh-bg)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CheckCircle size={34} weight="fill" style={{ color: "var(--fresh)" }} />
      </div>
      <p style={{ fontSize: 17, fontWeight: 700, color: "var(--ink-1)" }}>Guardado</p>
      <p style={{ fontSize: 13, color: "var(--ink-3)" }}>Volviendo al inventario…</p>
    </div>
  );

  return (
    <div className="pb-28">
      {/* Header */}
      <div className="px-5 pt-12 pb-5" style={{ background: "var(--brand)" }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--brand-text)", letterSpacing: "-0.02em" }}>FreshTrack</h1>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginTop: 2 }}>
          {mode ? (mode === "receipt" ? "Ticket de compra" : "Foto del refri") : "Elige qué escanear"}
        </p>
      </div>

      <div style={{ padding: "16px 16px 0", display: "flex", flexDirection: "column", gap: 12 }}>

        {/* Mode selection */}
        {!mode && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {([
              { key: "receipt" as ScanMode, label: "Ticket",  sub: "Detecta productos y precios", Icon: Receipt   },
              { key: "fridge"  as ScanMode, label: "Refri",   sub: "Identifica lo que tienes",    Icon: Snowflake },
            ] as const).map(({ key, label, sub, Icon }) => (
              <button
                key={key!}
                onClick={() => setMode(key)}
                className="active:scale-[0.97] anim-card"
                style={{
                  display: "flex", flexDirection: "column", alignItems: "flex-start",
                  gap: 12, padding: 18,
                  background: "var(--surface)",
                  border: "1px solid var(--border-lo)",
                  borderRadius: 20, cursor: "pointer",
                  transition: "transform 80ms ease, border-color 150ms ease",
                  textAlign: "left",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--brand)")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border-lo)")}
              >
                <div style={{ width: 40, height: 40, background: "var(--brand-bg)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={20} style={{ color: "var(--brand)" }} />
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 14, color: "var(--ink-1)" }}>{label}</p>
                  <p style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 3, lineHeight: 1.4 }}>{sub}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {mode && (
          <>
            <button
              onClick={reset}
              style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 500, color: "var(--ink-3)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
            >
              <ArrowLeft size={14} />
              Cambiar modo
            </button>

            {/* Photo zone */}
            <div
              onClick={() => inputRef.current?.click()}
              className="rounded-2xl"
              style={{
                height: 208, display: "flex", alignItems: "center", justifyContent: "center",
                background: "var(--surface)",
                border: "2px dashed var(--border)",
                overflow: "hidden", cursor: "pointer",
                transition: "border-color 150ms ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--brand-mid)")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
            >
              {preview
                ? <img src={preview} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: 24, textAlign: "center" }}>
                    <div style={{ width: 48, height: 48, background: "var(--brand-bg)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Camera size={22} style={{ color: "var(--brand)" }} />
                    </div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "var(--ink-2)" }}>Toca para subir foto</p>
                    <p style={{ fontSize: 12, color: "var(--ink-3)" }}>o tomar con la cámara</p>
                  </div>
                )
              }
            </div>
            <input ref={inputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFile} />

            {/* Phone */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--border-lo)", borderRadius: 16, padding: "12px 16px" }}>
              <label style={{ display: "block", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-3)", marginBottom: 4 }}>
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
                className="active:scale-[0.98]"
                style={{
                  height: 52, width: "100%",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  fontSize: 15, fontWeight: 700,
                  color: "var(--brand-text)",
                  background: loading ? "var(--brand-mid)" : "var(--brand)",
                  border: "none", borderRadius: 16, cursor: loading ? "default" : "pointer",
                  transition: "transform 80ms ease, background 150ms ease",
                }}
              >
                {loading ? <><CircleNotch size={16} className="animate-spin" /> Analizando con IA…</> : "Analizar foto"}
              </button>
            )}

            {/* Results */}
            {detected.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-3)" }}>
                  {detected.length} producto{detected.length !== 1 ? "s" : ""} detectado{detected.length !== 1 ? "s" : ""}
                </p>
                {detected.map((item, i) => (
                  <button
                    key={i} onClick={() => toggleSel(i)}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "12px 14px", borderRadius: 14, cursor: "pointer",
                      background: selected.has(i) ? "var(--brand-bg)" : "var(--surface)",
                      border: selected.has(i) ? "1px solid var(--brand)" : "1px solid var(--border-lo)",
                      opacity: selected.has(i) ? 1 : 0.5,
                      transition: "background 150ms ease, border-color 150ms ease, opacity 150ms ease",
                      textAlign: "left",
                    }}
                  >
                    {selected.has(i)
                      ? <CheckCircle size={18} weight="fill" style={{ color: "var(--brand)", flexShrink: 0 }} />
                      : <Circle size={18} style={{ color: "var(--ink-3)", flexShrink: 0 }} />
                    }
                    <span style={{ fontSize: 14, fontWeight: 500, color: "var(--ink-1)", flex: 1 }}>{item.name}</span>
                    {item.price != null && item.price > 0 && (
                      <span style={{ fontSize: 12, color: "var(--ink-3)" }}>S/ {item.price}</span>
                    )}
                  </button>
                ))}
                <button
                  onClick={handleSave} disabled={loading || selected.size === 0}
                  className="active:scale-[0.98]"
                  style={{
                    height: 52, width: "100%",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    fontSize: 15, fontWeight: 700,
                    color: selected.size === 0 ? "var(--ink-3)" : "var(--brand-text)",
                    background: selected.size === 0 ? "var(--surface)" : "var(--brand)",
                    border: "1px solid var(--border-lo)",
                    borderRadius: 16, marginTop: 4,
                    opacity: loading ? 0.7 : 1,
                    transition: "transform 80ms ease, background 150ms ease",
                    cursor: selected.size === 0 ? "default" : "pointer",
                  }}
                >
                  {loading
                    ? <><CircleNotch size={16} className="animate-spin" /> Guardando…</>
                    : <><FloppyDisk size={16} /> Guardar {selected.size} producto{selected.size !== 1 ? "s" : ""}</>
                  }
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
