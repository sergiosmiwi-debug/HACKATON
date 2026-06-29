"use client";
import { useState, useRef } from "react";
import { scanReceipt, scanFridge, addProduct } from "@/lib/api";
import BottomNav from "@/components/BottomNav";
import { useRouter } from "next/navigation";
import {
  Receipt, Snowflake, Camera, ArrowLeft,
  CheckCircle, Circle, FloppyDisk, Spinner,
} from "@phosphor-icons/react";

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
      <div className="flex flex-col items-center justify-center min-h-[100dvh] gap-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle size={36} weight="fill" className="text-green-600" />
        </div>
        <p className="text-lg font-bold text-slate-800">Guardado</p>
        <p className="text-sm text-slate-400">Redirigiendo al inventario...</p>
      </div>
    );
  }

  return (
    <div className="pb-24">
      <div className="bg-white px-5 pt-12 pb-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-green-700 rounded-xl flex items-center justify-center">
            <Camera size={18} weight="fill" className="text-white" />
          </div>
          <div>
            <h1 className="text-[17px] font-bold text-slate-900">Escanear</h1>
            <p className="text-[11px] text-slate-400">Sube una foto de tu ticket o refri</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-5 flex flex-col gap-4">
        {!mode && (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setMode("receipt")}
              className="flex flex-col items-start gap-3 p-5 bg-white rounded-2xl border border-slate-200 hover:border-green-400 hover:bg-green-50 transition-colors active:scale-[0.98]"
            >
              <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                <Receipt size={20} className="text-slate-600" />
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm">Ticket</p>
                <p className="text-xs text-slate-400 mt-0.5 leading-snug">Detecta productos y precios automaticamente</p>
              </div>
            </button>
            <button
              onClick={() => setMode("fridge")}
              className="flex flex-col items-start gap-3 p-5 bg-white rounded-2xl border border-slate-200 hover:border-green-400 hover:bg-green-50 transition-colors active:scale-[0.98]"
            >
              <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                <Snowflake size={20} className="text-slate-600" />
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm">Refri</p>
                <p className="text-xs text-slate-400 mt-0.5 leading-snug">Identifica lo que tienes guardado</p>
              </div>
            </button>
          </div>
        )}

        {mode && (
          <>
            <button
              onClick={() => { setMode(null); setPreview(null); setFile(null); setDetected([]); }}
              className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors -mb-1"
            >
              <ArrowLeft size={15} />
              Cambiar modo
            </button>

            <div
              onClick={() => inputRef.current?.click()}
              className="relative bg-white border-2 border-dashed border-slate-200 rounded-2xl h-52 flex items-center justify-center cursor-pointer overflow-hidden hover:border-green-400 transition-colors"
            >
              {preview ? (
                <img src={preview} alt="preview" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-center px-6">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                    <Camera size={22} className="text-slate-400" />
                  </div>
                  <p className="text-sm font-medium text-slate-500">Toca para subir foto</p>
                  <p className="text-xs text-slate-400">o tomar con la camara</p>
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

            <div className="bg-white rounded-2xl border border-slate-200 px-4 py-3">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">WhatsApp (opcional)</label>
              <input
                type="tel"
                placeholder="+51 999 999 999"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full mt-1 text-sm text-slate-700 outline-none placeholder:text-slate-300"
              />
            </div>

            {file && detected.length === 0 && (
              <button
                onClick={handleScan}
                disabled={loading}
                className="w-full bg-green-700 text-white font-bold py-4 rounded-2xl hover:bg-green-800 disabled:opacity-60 transition-colors flex items-center justify-center gap-2 active:scale-[0.99]"
              >
                {loading ? (
                  <>
                    <Spinner size={16} className="animate-spin" />
                    Analizando con IA...
                  </>
                ) : (
                  "Analizar foto"
                )}
              </button>
            )}

            {detected.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
                  {detected.length} productos detectados
                </p>
                {detected.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => toggleSelect(i)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors ${
                      selected.has(i)
                        ? "bg-green-50 border-green-300"
                        : "bg-white border-slate-200 opacity-50"
                    }`}
                  >
                    {selected.has(i)
                      ? <CheckCircle size={18} weight="fill" className="text-green-600 shrink-0" />
                      : <Circle size={18} className="text-slate-300 shrink-0" />
                    }
                    <span className="text-sm font-medium text-slate-700 text-left flex-1">{item.name}</span>
                    {item.price != null && item.price > 0 && (
                      <span className="text-xs text-slate-400 ml-auto shrink-0">S/ {item.price}</span>
                    )}
                  </button>
                ))}
                <button
                  onClick={handleSave}
                  disabled={loading || selected.size === 0}
                  className="w-full bg-green-700 text-white font-bold py-4 rounded-2xl hover:bg-green-800 disabled:opacity-60 transition-colors flex items-center justify-center gap-2 mt-1 active:scale-[0.99]"
                >
                  {loading ? (
                    <>
                      <Spinner size={16} className="animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <FloppyDisk size={16} />
                      Guardar {selected.size} producto{selected.size !== 1 ? "s" : ""}
                    </>
                  )}
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
