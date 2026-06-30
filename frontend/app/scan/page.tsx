"use client";
import { useState, useRef, useEffect } from "react";
import { scanImage, addProduct } from "@/lib/api";
import { getBin } from "@/lib/recycling";
import BottomNav from "@/components/BottomNav";
import { ScanCard } from "@/components/ScanCard";
import { useRouter } from "next/navigation";
import {
  CameraPlus, Microphone, CheckCircle, Circle,
  FloppyDisk, CircleNotch, X, ArrowCounterClockwise, MapPin,
} from "@phosphor-icons/react";

type Item = { name: string; price?: number; quantity?: string };
type VoiceItem = { name: string; quantity: string; material: string | null };
type InputMode = "photo" | "voice" | null;

const NUM_WORDS: Record<string, number> = {
  un: 1, una: 1, uno: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5,
  seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10, media: 1,
};

// Orden importa: palabras específicas (vidrio, lata) priman sobre genéricas (botella)
const MATERIAL_WORDS: { words: string[]; material: string }[] = [
  { words: ["vidrio", "frasco"], material: "vidrio" },
  { words: ["lata", "tarro", "envase metálico"], material: "metal" },
  { words: ["caja", "cartón", "carton", "tetra pak"], material: "carton" },
  { words: ["botella", "plástico", "plastico", "bolsa"], material: "plastico" },
];

function detectMaterial(text: string): string | null {
  const lower = text.toLowerCase();
  for (const rule of MATERIAL_WORDS) {
    if (rule.words.some(w => lower.includes(w))) return rule.material;
  }
  return null;
}

function parseVoiceTranscript(transcript: string): VoiceItem[] {
  const raw = transcript
    .replace(/\b(y seguido|seguido|también|luego|después|más)\b/gi, ",")
    .replace(/\s+y\s+/gi, ",");
  const segments = raw.split(/[,\n·;]+/)
    .map(s => s.trim())
    .filter(Boolean);

  return segments.map(seg => {
    const words = seg.split(/\s+/);
    let qty = "1";
    let nameStart = 0;
    const first = words[0]?.toLowerCase() ?? "";
    if (/^\d+$/.test(first)) {
      qty = first; nameStart = 1;
    } else if (NUM_WORDS[first] !== undefined) {
      qty = String(NUM_WORDS[first]); nameStart = 1;
    }
    const name = words.slice(nameStart).join(" ").trim();
    return name ? { name, quantity: qty, material: detectMaterial(seg) } : null;
  }).filter(Boolean) as VoiceItem[];
}

function getRecycleTip(name: string): string | null {
  return getBin(null, name)?.tip ?? null;
}

export default function ScanPage() {
  const [inputMode, setInputMode] = useState<InputMode>(null);
  const [preview,   setPreview]   = useState<string | null>(null);
  const [file,      setFile]      = useState<File | null>(null);
  const [loading,   setLoading]   = useState(false);
  const [detected,  setDetected]  = useState<Item[]>([]);
  const [selected,  setSelected]  = useState<Set<number>>(new Set());
  const [done,      setDone]      = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript,setTranscript]= useState("");
  const [voiceItems,setVoiceItems]= useState<VoiceItem[]>([]);
  const [recycleTip,setRecycleTip]= useState<string | null>(null);
  const [stats,     setStats]     = useState({ scans: 0, week: 0, products: 0 });

  const inputRef = useRef<HTMLInputElement>(null);
  const recogRef = useRef<any>(null);
  const router   = useRouter();

  useEffect(() => {
    const s = parseInt(localStorage.getItem("qr_scans") || "0");
    const p = parseInt(localStorage.getItem("qr_products") || "0");
    setStats({ scans: s, week: Math.min(s, 3), products: p });
  }, []);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f); setPreview(URL.createObjectURL(f));
    setDetected([]); setSelected(new Set());
  }

  async function handleScan() {
    if (!file) return;
    setLoading(true);
    try {
      const r = await scanImage(file);
      const items: Item[] = (r.detected ?? []).map((name: string) => ({ name }));
      setDetected(items);
      setSelected(new Set(items.map((_: any, i: number) => i)));
      localStorage.setItem("qr_scans", String(stats.scans + 1));
    } catch { alert("Error al escanear."); }
    setLoading(false);
  }

  async function handleSave() {
    setLoading(true);
    const items = inputMode === "voice"
      ? voiceItems.map(v => ({ name: v.name, quantity: v.quantity, price: 0, material: v.material }))
      : [...selected].map(i => ({ name: detected[i].name, quantity: detected[i].quantity ?? "1", price: detected[i].price ?? 0, material: null as string | null }));
    for (const item of items) {
      await addProduct(item.name, item.quantity, item.price, item.material);
    }
    const prev = parseInt(localStorage.getItem("qr_products") || "0");
    localStorage.setItem("qr_products", String(prev + items.length));
    setDone(true); setLoading(false);
    setTimeout(() => router.push("/"), 1600);
  }

  function startVoice() {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert("Usa Chrome para reconocimiento de voz."); return; }
    const recog = new SR();
    recog.lang = "es-PE";
    recog.continuous = true;
    recog.interimResults = true;
    recog.onresult = (e: any) => {
      const t = Array.from(e.results).map((r: any) => r[0].transcript).join(" ");
      setTranscript(t);
    };
    recog.onend = () => setListening(false);
    recog.start();
    recogRef.current = recog;
    setListening(true);
  }

  function stopVoice() {
    recogRef.current?.stop();
    setListening(false);
    if (transcript.trim()) {
      const items = parseVoiceTranscript(transcript);
      setVoiceItems(items);
      setTranscript("");
    }
  }

  function reset() {
    setInputMode(null); setPreview(null); setFile(null);
    setDetected([]); setSelected(new Set()); setVoiceItems([]); setTranscript("");
  }

  function toggleSel(i: number) {
    setSelected(p => { const n = new Set(p); n.has(i) ? n.delete(i) : n.add(i); return n; });
  }

  if (done) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100dvh", gap: 12, background: "var(--bg)" }}>
      <div style={{ width: 72, height: 72, background: "var(--brand-bg)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CheckCircle size={38} weight="fill" style={{ color: "var(--brand)" }} />
      </div>
      <p style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 400, color: "var(--ink-1)" }}>
        ¡<em style={{ fontStyle: "italic", color: "var(--violet)" }}>Guardado</em>!
      </p>
      <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--ink-3)" }}>Volviendo al inventario…</p>
    </div>
  );

  return (
    <div style={{ minHeight: "100dvh", background: "var(--bg)" }}>

      {/* Toast reciclaje */}
      {recycleTip && (
        <div className="fixed left-0 right-0 max-w-md mx-auto px-4 anim-bar" style={{ top: 16, zIndex: 100 }}>
          <div style={{ background: "#1a1714", borderRadius: 16, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "#fff", flex: 1 }}>{recycleTip}</span>
            <button onClick={() => setRecycleTip(null)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", padding: 0 }}>
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="relative overflow-hidden px-6 pb-14 pt-5" style={{ background: "var(--gradient-header)" }}>
        <div className="flex items-center justify-between mb-5">
          {inputMode
            ? <button onClick={reset} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.8)", cursor: "pointer" }}><ArrowCounterClockwise size={20} /></button>
            : <div style={{ width: 28 }} />}
        </div>
        <div className="flex flex-col items-center gap-2">
          <div style={{ width: 68, height: 68, borderRadius: "50%", background: "rgba(255,255,255,0.2)", border: "2.5px solid rgba(255,255,255,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CameraPlus size={30} style={{ color: "rgba(255,255,255,0.7)" }} />
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 34, fontWeight: 300, color: "#fff", letterSpacing: "-0.3px", lineHeight: 1 }}>
            Esc<em style={{ fontStyle: "italic", color: "rgba(255,255,255,0.75)" }}>anear</em>
          </h1>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 10, color: "rgba(255,255,255,0.5)", letterSpacing: "0.1em", display: "flex", alignItems: "center", gap: 4 }}>
            <MapPin size={11} /> Tu inventario
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 22, marginTop: 8 }}>
            {[{ n: String(stats.scans), l: "Escaneos" }, { n: String(stats.week), l: "Esta semana" }, { n: String(stats.products), l: "Productos" }].map((s, i, arr) => (
              <div key={s.l} style={{ display: "flex", alignItems: "center", gap: 22 }}>
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 400, color: "#fff", lineHeight: 1 }}>{s.n}</p>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: 9, color: "rgba(255,255,255,0.45)", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 2 }}>{s.l}</p>
                </div>
                {i < arr.length - 1 && <div style={{ width: 1, height: 24, background: "rgba(255,255,255,0.15)" }} />}
              </div>
            ))}
          </div>
        </div>
        <div style={{ position: "absolute", bottom: -2, left: 0, right: 0, height: 28, background: "var(--bg)", borderRadius: "50% 50% 0 0 / 24px 24px 0 0" }} />
      </div>

      {/* Body */}
      <div style={{ padding: "16px 16px 96px", display: "flex", flexDirection: "column", gap: 12 }}>

        {/* Selección modo */}
        {!inputMode && (
          <>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 400, color: "var(--ink-1)", padding: "0 2px" }}>
              Añadir <em style={{ fontStyle: "italic", color: "var(--violet)" }}>productos</em>
            </h2>

            <ScanCard variant="violet" icon={<CameraPlus size={26} />} title="Foto o ticket" titleItalic="de compra" subtitle="La IA detecta productos automáticamente" rankNumber={1} size="large"
              onClick={() => { setInputMode("photo"); setTimeout(() => inputRef.current?.click(), 100); }} />

            <ScanCard variant="green" icon={<Microphone size={24} />} title="Dictado" titleItalic="por voz" subtitle="Nombra tus productos hablando" rankNumber={2} size="large"
              onClick={() => setInputMode("voice")} />

            <div style={{ display: "flex", gap: 8 }}>
              {[{ label: "Buena luz", bg: "var(--violet-bg)", ico: "💡" }, { label: "Sin dobleces", bg: "var(--brand-bg)", ico: "📄" }, { label: "Completo", bg: "var(--amber-bg)", ico: "🔍" }].map(tip => (
                <div key={tip.label} style={{ flex: 1, background: "var(--surface)", border: "1px solid var(--border-lo)", borderRadius: 16, padding: "10px 8px", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, textAlign: "center" }}>
                  <div style={{ width: 30, height: 30, borderRadius: 10, background: tip.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>{tip.ico}</div>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: 10, color: "var(--ink-3)" }}>{tip.label}</p>
                </div>
              ))}
            </div>

          </>
        )}

        {/* Modo FOTO */}
        {inputMode === "photo" && (
          <>
            <input ref={inputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFile} />
            {!preview ? (
              <div onClick={() => inputRef.current?.click()} style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--surface)", border: "2px dashed var(--border)", borderRadius: 20, cursor: "pointer" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, textAlign: "center" }}>
                  <div style={{ width: 48, height: 48, background: "var(--violet-bg)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <CameraPlus size={22} style={{ color: "var(--violet)" }} />
                  </div>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 500, color: "var(--ink-2)" }}>Toca para subir foto</p>
                </div>
              </div>
            ) : (
              <div style={{ borderRadius: 20, overflow: "hidden", height: 200, position: "relative" }}>
                <img src={preview} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <button onClick={() => { setPreview(null); setFile(null); setDetected([]); }} style={{ position: "absolute", top: 10, right: 10, background: "rgba(0,0,0,0.5)", border: "none", borderRadius: 99, width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  <X size={14} style={{ color: "#fff" }} />
                </button>
              </div>
            )}

            {file && detected.length === 0 && (
              <button onClick={handleScan} disabled={loading} className="active:scale-[0.98]"
                style={{ height: 52, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "var(--font-body)", fontSize: 15, fontWeight: 600, color: "#fff", background: "var(--gradient-header)", border: "none", borderRadius: 16, cursor: loading ? "default" : "pointer" }}>
                {loading ? <><CircleNotch size={16} className="animate-spin" /> Analizando…</> : "Analizar foto"}
              </button>
            )}

            {detected.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <p style={{ fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-3)" }}>
                  {detected.length} detectado{detected.length !== 1 ? "s" : ""}
                </p>
                {detected.map((item, i) => {
                  const tip = getRecycleTip(item.name);
                  return (
                    <button key={i} onClick={() => toggleSel(i)}
                      style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 14, cursor: "pointer", background: selected.has(i) ? "var(--violet-bg)" : "var(--surface)", border: selected.has(i) ? "1px solid var(--violet)" : "1px solid var(--border-lo)", opacity: selected.has(i) ? 1 : 0.55, transition: "all 150ms ease", textAlign: "left" }}>
                      {selected.has(i) ? <CheckCircle size={18} weight="fill" style={{ color: "var(--violet)", flexShrink: 0 }} /> : <Circle size={18} style={{ color: "var(--ink-3)", flexShrink: 0 }} />}
                      <span style={{ fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 500, color: "var(--ink-1)", flex: 1 }}>{item.name}</span>
                      {tip && (
                        <span onClick={e => { e.stopPropagation(); setRecycleTip(tip); }}
                          style={{ fontSize: 11, background: "var(--border-lo)", borderRadius: 8, padding: "2px 8px", color: "var(--ink-3)", flexShrink: 0, cursor: "pointer" }}>♻️</span>
                      )}
                    </button>
                  );
                })}
                <button onClick={handleSave} disabled={loading || selected.size === 0} className="active:scale-[0.98]"
                  style={{ height: 52, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "var(--font-body)", fontSize: 15, fontWeight: 600, color: selected.size === 0 ? "var(--ink-3)" : "#fff", background: selected.size === 0 ? "var(--surface)" : "var(--gradient-header)", border: "1px solid var(--border-lo)", borderRadius: 16, marginTop: 4, cursor: selected.size === 0 ? "default" : "pointer" }}>
                  {loading ? <><CircleNotch size={16} className="animate-spin" /> Guardando…</> : <><FloppyDisk size={16} /> Guardar {selected.size} producto{selected.size !== 1 ? "s" : ""}</>}
                </button>
              </div>
            )}
          </>
        )}

        {/* Modo VOZ */}
        {inputMode === "voice" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <p style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 400, color: "var(--ink-1)" }}>
              Dicta tus <em style={{ fontStyle: "italic", color: "var(--violet)" }}>productos</em>
            </p>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--ink-3)", lineHeight: 1.5 }}>
              Habla con naturalidad: <em>"leche, pan, yogur, manzanas"</em>
            </p>
            <div style={{ display: "flex", justifyContent: "center", padding: "20px 0" }}>
              <button onClick={listening ? stopVoice : startVoice}
                style={{ width: 100, height: 100, borderRadius: "50%", border: "none", cursor: "pointer", background: listening ? "linear-gradient(145deg, #5b2da8, #1c7a4a)" : "var(--brand-bg)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: listening ? "0 0 0 14px rgba(91,45,168,0.12)" : "none", transition: "all 200ms ease" }}>
                <Microphone size={40} style={{ color: listening ? "#fff" : "var(--brand)" }} weight={listening ? "fill" : "regular"} />
              </button>
            </div>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--ink-3)", textAlign: "center" }}>
              {listening ? "Toca para detener" : "Toca para hablar"}
            </p>
            {listening && transcript && (
              <div style={{ background: "var(--surface)", border: "1px solid var(--border-lo)", borderRadius: 16, padding: "12px 16px" }}>
                <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--ink-3)", fontStyle: "italic" }}>{transcript}</p>
              </div>
            )}
            {voiceItems.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <p style={{ fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-3)" }}>
                  {voiceItems.length} producto{voiceItems.length !== 1 ? "s" : ""} detectado{voiceItems.length !== 1 ? "s" : ""}
                </p>
                {voiceItems.map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 14, background: "var(--brand-bg)", border: "1px solid var(--brand-mid)" }}>
                    <CheckCircle size={18} weight="fill" style={{ color: "var(--brand)", flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <span style={{ fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 500, color: "var(--ink-1)" }}>{item.name}</span>
                      {item.quantity !== "1" && (
                        <span style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--fresh-txt)", background: "var(--fresh-bg)", borderRadius: 6, padding: "1px 6px", marginLeft: 8, fontWeight: 600 }}>×{item.quantity}</span>
                      )}
                    </div>
                    <button onClick={() => setVoiceItems(v => v.filter((_, j) => j !== i))} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink-3)", padding: 0 }}>
                      <X size={14} />
                    </button>
                  </div>
                ))}
                <button onClick={handleSave} disabled={loading} className="active:scale-[0.98]"
                  style={{ height: 52, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "var(--font-body)", fontSize: 15, fontWeight: 600, color: "#fff", background: "var(--gradient-header)", border: "none", borderRadius: 16, marginTop: 4, cursor: "pointer" }}>
                  {loading ? <><CircleNotch size={16} className="animate-spin" /> Guardando…</> : <><FloppyDisk size={16} /> Guardar {voiceItems.length} producto{voiceItems.length !== 1 ? "s" : ""}</>}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
