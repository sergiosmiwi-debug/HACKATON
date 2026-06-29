"use client";
import { useState, useRef } from "react";
import { scanReceipt, scanFridge, addProduct } from "@/lib/api";
import BottomNav from "@/components/BottomNav";
import { useRouter } from "next/navigation";
import {
  Receipt, Snowflake, Camera, ArrowLeft,
  CheckCircle, Circle, FloppyDisk, CircleNotch,
} from "@phosphor-icons/react";

type ScanMode = "receipt" | "fridge" | null;
type DetectedItem = { name: string; price?: number; quantity?: string };

export default function ScanPage() {
  const [mode,     setMode]     = useState<ScanMode>(null);
  const [preview,  setPreview]  = useState<string | null>(null);
  const [file,     setFile]     = useState<File | null>(null);
  const [loading,  setLoading]  = useState(false);
  const [detected, setDetected] = useState<DetectedItem[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [phone,    setPhone]    = useState("");
  const [done,     setDone]     = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router   = useRouter();

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setDetected([]);
    setSelected(new Set());
    setDone(false);
  }

  async function handleScan() {
    if (!file || !mode) return;
    setLoading(true);
    try {
      const result = mode === "receipt"
        ? await scanReceipt(file, phone || undefined)
        : await scanFridge(file, phone || undefined);
      const items: DetectedItem[] = (result.detected ?? []).map((name: string) => ({ name }));
      setDetected(items);
      setSelected(new Set(items.map((_: any, i: number) => i)));
    } catch {
      alert("Error al escanear. Intenta de nuevo.");
    }
    setLoading(false);
  }

  async function handleSave() {
    setLoading(true);
    for (const i of selected) {
      const item = detected[i];
      await addProduct(item.name, item.quantity ?? "1", item.price ?? 0, phone || undefined);
    }
    setDone(true);
    setLoading(false);
    setTimeout(() => router.push("/"), 1400);
  }

  function toggleSelect(i: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }

  function reset() {
    setMode(null);
    setPreview(null);
    setFile(null);
    setDetected([]);
    setSelected(new Set());
  }

  /* Done state */
  if (done) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[100dvh] gap-4">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{ background: "var(--fresh-bg)" }}
        >
          <CheckCircle size={34} weight="fill" style={{ color: "var(--fresh)" }} />
        </div>
        <p className="text-lg font-bold" style={{ color: "var(--ink-1)" }}>Guardado</p>
        <p className="text-sm" style={{ color: "var(--ink-3)" }}>Volviendo al inventario…</p>
      </div>
    );
  }

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
        <p className="text-sm mt-0.5" style={{ color: "var(--ink-3)" }}>
          {mode ? (mode === "receipt" ? "Ticket de compra" : "Foto del refri") : "Elige qué escanear"}
        </p>
      </div>

      <div className="px-4 py-5 flex flex-col gap-3">

        {/* Mode selection */}
        {!mode && (
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: "receipt" as ScanMode, label: "Ticket",    sub: "Detecta productos y precios", Icon: Receipt  },
              { key: "fridge"  as ScanMode, label: "Refri",     sub: "Identifica lo que tienes",    Icon: Snowflake },
            ].map(({ key, label, sub, Icon }) => (
              <button
                key={key!}
                onClick={() => setMode(key)}
                className="flex flex-col items-start gap-3 p-5 rounded-2xl text-left active:scale-[0.97]"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border-lo)",
                  transition: "transform 80ms ease, border-color 150ms ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--brand)")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border-lo)")}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: "var(--surface-hi)" }}
                >
                  <Icon size={20} style={{ color: "var(--ink-2)" }} />
                </div>
                <div>
                  <p className="font-bold text-sm" style={{ color: "var(--ink-1)" }}>{label}</p>
                  <p className="text-xs mt-0.5 leading-snug" style={{ color: "var(--ink-3)" }}>{sub}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {mode && (
          <>
            {/* Back */}
            <button
              onClick={reset}
              className="flex items-center gap-1.5 text-sm font-medium -mb-1"
              style={{ color: "var(--ink-3)", transition: "color 120ms ease" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--ink-1)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--ink-3)")}
            >
              <ArrowLeft size={14} />
              Cambiar modo
            </button>

            {/* Photo zone */}
            <div
              onClick={() => inputRef.current?.click()}
              className="relative rounded-2xl h-52 flex items-center justify-center cursor-pointer overflow-hidden"
              style={{
                background: "var(--surface)",
                border: "2px dashed var(--border)",
                transition: "border-color 150ms ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--brand)")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
            >
              {preview ? (
                <img src={preview} alt="preview" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-center px-6">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: "var(--surface-hi)" }}
                  >
                    <Camera size={22} style={{ color: "var(--ink-3)" }} />
                  </div>
                  <p className="text-sm font-medium" style={{ color: "var(--ink-2)" }}>Toca para subir foto</p>
                  <p className="text-xs" style={{ color: "var(--ink-3)" }}>o tomar con la cámara</p>
                </div>
              )}
            </div>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFile}
            />

            {/* Phone (WhatsApp) */}
            <div
              className="rounded-2xl px-4 py-3"
              style={{ background: "var(--surface)", border: "1px solid var(--border-lo)" }}
            >
              <label
                className="block text-[10px] font-bold uppercase tracking-widest mb-1"
                style={{ color: "var(--ink-3)" }}
              >
                WhatsApp (opcional)
              </label>
              <input
                type="tel"
                placeholder="+51 999 999 999"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full text-sm outline-none bg-transparent"
                style={{ color: "var(--ink-1)" }}
              />
            </div>

            {/* Scan button */}
            {file && detected.length === 0 && (
              <button
                onClick={handleScan}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 text-sm font-bold rounded-2xl active:scale-[0.98]"
                style={{
                  height: 52,
                  color: "var(--bg)",
                  background: loading ? "var(--brand-bg)" : "var(--brand)",
                  opacity: loading ? 0.75 : 1,
                  transition: "transform 80ms ease, opacity 150ms ease",
                }}
              >
                {loading
                  ? <><CircleNotch size={16} className="animate-spin" /> Analizando con IA…</>
                  : "Analizar foto"
                }
              </button>
            )}

            {/* Results */}
            {detected.length > 0 && (
              <div className="flex flex-col gap-2">
                <p
                  className="text-[10px] font-bold uppercase tracking-widest px-1"
                  style={{ color: "var(--ink-3)" }}
                >
                  {detected.length} producto{detected.length !== 1 ? "s" : ""} detectado{detected.length !== 1 ? "s" : ""}
                </p>

                {detected.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => toggleSelect(i)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-left"
                    style={{
                      background: selected.has(i) ? "var(--brand-bg)" : "var(--surface)",
                      border: selected.has(i) ? "1px solid var(--brand)" : "1px solid var(--border-lo)",
                      opacity: selected.has(i) ? 1 : 0.5,
                      transition: "background 150ms ease, border-color 150ms ease, opacity 150ms ease",
                    }}
                  >
                    {selected.has(i)
                      ? <CheckCircle size={18} weight="fill" style={{ color: "var(--brand)", flexShrink: 0 }} />
                      : <Circle size={18} style={{ color: "var(--ink-3)", flexShrink: 0 }} />
                    }
                    <span className="text-sm font-medium flex-1" style={{ color: "var(--ink-1)" }}>
                      {item.name}
                    </span>
                    {item.price != null && item.price > 0 && (
                      <span className="text-xs ml-auto" style={{ color: "var(--ink-3)" }}>
                        S/ {item.price}
                      </span>
                    )}
                  </button>
                ))}

                <button
                  onClick={handleSave}
                  disabled={loading || selected.size === 0}
                  className="w-full flex items-center justify-center gap-2 text-sm font-bold rounded-2xl mt-1 active:scale-[0.98]"
                  style={{
                    height: 52,
                    color: selected.size === 0 ? "var(--ink-3)" : "var(--bg)",
                    background: selected.size === 0 ? "var(--surface)" : "var(--brand)",
                    border: "1px solid var(--border-lo)",
                    opacity: loading ? 0.7 : 1,
                    transition: "transform 80ms ease, background 150ms ease",
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
