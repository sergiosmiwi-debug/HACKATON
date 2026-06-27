"use client";
import { useState, useRef } from "react";
import { scanReceipt, scanFridge, addProduct } from "@/lib/api";
import BottomNav from "@/components/BottomNav";
import { useRouter } from "next/navigation";

type ScanMode = "receipt" | "fridge" | null;
type DetectedItem = { name: string; price?: number; quantity?: string; category?: string };

export default function ScanPage() {
  const [mode, setMode] = useState<ScanMode>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [detected, setDetected] = useState<DetectedItem[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [phone, setPhone] = useState("");
  const [done, setDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

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
      const items: DetectedItem[] = result.detected
        ? result.detected.map((name: string) => ({ name }))
        : [];
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
    setTimeout(() => router.push("/"), 1500);
  }

  function toggleSelect(i: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-5xl">✅</p>
        <p className="text-lg font-semibold text-slate-700">¡Guardado!</p>
        <p className="text-sm text-slate-400">Redirigiendo...</p>
      </div>
    );
  }

  return (
    <div className="pb-24">
      <div className="bg-white px-5 pt-12 pb-5 border-b border-slate-100 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-800">📷 Escanear</h1>
        <p className="text-sm text-slate-400 mt-1">Sube una foto de tu ticket o refri</p>
      </div>

      <div className="px-4 py-5 flex flex-col gap-4">
        {/* Modo */}
        {!mode && (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setMode("receipt")}
              className="flex flex-col items-center gap-3 p-6 bg-white rounded-2xl border-2 border-slate-200 hover:border-green-400 transition"
            >
              <span className="text-4xl">🧾</span>
              <span className="font-semibold text-slate-700">Ticket de compra</span>
              <span className="text-xs text-slate-400 text-center">Detecta productos y precios automáticamente</span>
            </button>
            <button
              onClick={() => setMode("fridge")}
              className="flex flex-col items-center gap-3 p-6 bg-white rounded-2xl border-2 border-slate-200 hover:border-green-400 transition"
            >
              <span className="text-4xl">🧊</span>
              <span className="font-semibold text-slate-700">Foto del refri</span>
              <span className="text-xs text-slate-400 text-center">Identifica lo que tienes guardado</span>
            </button>
          </div>
        )}

        {mode && (
          <>
            <button
              onClick={() => { setMode(null); setPreview(null); setFile(null); setDetected([]); }}
              className="text-sm text-slate-400 flex items-center gap-1 -mb-1"
            >
              ← Cambiar modo
            </button>

            {/* Foto */}
            <div
              onClick={() => inputRef.current?.click()}
              className="relative bg-white border-2 border-dashed border-slate-300 rounded-2xl h-52 flex items-center justify-center cursor-pointer overflow-hidden hover:border-green-400 transition"
            >
              {preview ? (
                <img src={preview} alt="preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center">
                  <p className="text-3xl mb-2">📸</p>
                  <p className="text-sm text-slate-500">Toca para subir foto</p>
                </div>
              )}
            </div>
            <input ref={inputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFile} />

            {/* Teléfono */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">WhatsApp (opcional)</label>
              <input
                type="tel"
                placeholder="+51 999 999 999"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full mt-2 text-sm outline-none text-slate-700 placeholder:text-slate-300"
              />
            </div>

            {/* Escanear */}
            {file && detected.length === 0 && (
              <button
                onClick={handleScan}
                disabled={loading}
                className="w-full bg-green-600 text-white font-semibold py-4 rounded-2xl hover:bg-green-700 disabled:opacity-50 transition"
              >
                {loading ? "Analizando con IA..." : "Analizar foto"}
              </button>
            )}

            {/* Resultados */}
            {detected.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-sm font-semibold text-slate-600">Selecciona qué guardar:</p>
                {detected.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => toggleSelect(i)}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition ${
                      selected.has(i) ? "bg-green-50 border-green-300" : "bg-white border-slate-200 opacity-50"
                    }`}
                  >
                    <span className="text-lg">{selected.has(i) ? "✅" : "⬜"}</span>
                    <span className="text-sm font-medium text-slate-700">{item.name}</span>
                    {item.price && <span className="ml-auto text-sm text-slate-400">S/ {item.price}</span>}
                  </button>
                ))}
                <button
                  onClick={handleSave}
                  disabled={loading || selected.size === 0}
                  className="w-full bg-green-600 text-white font-semibold py-4 rounded-2xl hover:bg-green-700 disabled:opacity-50 transition mt-2"
                >
                  {loading ? "Guardando..." : `Guardar ${selected.size} producto${selected.size !== 1 ? "s" : ""}`}
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
