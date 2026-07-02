type BinRule = { bin: string; color: string; tip: string };

// Segregación doméstica real en Perú: 3 grupos prácticos, no el código técnico NTP 900.058
export const MATERIAL_BINS: Record<string, BinRule> = {
  plastico: { bin: "Plástico (reciclable)", color: "#1c7a4a", tip: "🟢 Plástico → bolsa verde de reciclables" },
  vidrio:   { bin: "Vidrio (reciclable)",   color: "#1c7a4a", tip: "🟢 Vidrio → bolsa verde de reciclables" },
  metal:    { bin: "Metal/Lata (reciclable)", color: "#1c7a4a", tip: "🟢 Metal/Lata → bolsa verde de reciclables" },
  carton:   { bin: "Cartón/Papel",          color: "#9a6b2c", tip: "📦 Cartón/Papel → aparte, en caja o atado (no en bolsa)" },
  papel:    { bin: "Cartón/Papel",          color: "#9a6b2c", tip: "📦 Papel → aparte, en caja o atado (no en bolsa)" },
  organico: { bin: "Orgánico",              color: "#2b2b2b", tip: "⚫ Orgánico → bolsa negra (o compost si tienes)" },
  general:  { bin: "General",               color: "#2b2b2b", tip: "⚫ No reciclable → bolsa negra de residuos generales" },
};

const UNKNOWN_BIN: BinRule = { bin: "Sin identificar", color: "#b7b0a2", tip: "No se identificó el empaque — revisa el envase" };

// Solo para casos obvios donde el alimento no lleva empaque (frutas/verduras sueltas, pan suelto)
const OBVIOUS_ORGANIC = [
  "fruta","verdura","pan","carne","pollo","pescado","huevo",
  "tomate","plátano","platano","banana","papa","cebolla","choclo","palta",
  "manzana","naranja","mandarina","uva","pera","durazno","fresa","piña","pina",
  "sandia","sandía","melon","melón","limon","limón","zanahoria","lechuga",
  "pepino","brócoli","brocoli","espinaca","acelga","apio","betarraga","camote",
];

export function getBin(material: string | null | undefined, name?: string) {
  if (material && MATERIAL_BINS[material]) return MATERIAL_BINS[material];
  if (name) {
    const lower = name.toLowerCase();
    if (OBVIOUS_ORGANIC.some(k => lower.includes(k))) return MATERIAL_BINS.organico;
  }
  return UNKNOWN_BIN;
}

// Opciones más probables según el tipo de producto, para que el usuario elija rápido
// cuando no se pudo identificar el empaque automáticamente.
const CANDIDATE_RULES: { keywords: string[]; options: string[] }[] = [
  { keywords: ["cerveza", "vino", "champaña"], options: ["vidrio", "metal"] },
  { keywords: ["gaseosa", "agua", "refresco", "soda", "bebida"], options: ["plastico", "metal", "vidrio"] },
  { keywords: ["leche", "jugo", "néctar", "nectar"], options: ["carton", "plastico", "vidrio"] },
  { keywords: ["atún", "atun", "sardina", "conserva", "durazno en lata"], options: ["metal", "vidrio"] },
  { keywords: ["mermelada", "salsa", "aceituna"], options: ["vidrio", "plastico"] },
];
// Para envases en general (sin pista de qué bebida/alimento es): solo materiales de empaque,
// no "orgánico" (eso es para alimento sin envase) ni "general" (eso es para empaques mixtos no separables).
const DEFAULT_CANDIDATES = ["plastico", "vidrio", "metal", "carton"];

export function getCandidateMaterials(name: string): string[] {
  const lower = name.toLowerCase();
  for (const rule of CANDIDATE_RULES) {
    if (rule.keywords.some(k => lower.includes(k))) return rule.options;
  }
  return DEFAULT_CANDIDATES;
}
