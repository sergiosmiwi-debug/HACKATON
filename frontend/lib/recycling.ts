type BinRule = { bin: string; color: string; tip: string };

// Colores según código de segregación de residuos sólidos de Perú (NTP 900.058)
export const MATERIAL_BINS: Record<string, BinRule> = {
  plastico:  { bin: "Plástico",        color: "#0e8fb5", tip: "⚪ Plástico → contenedor blanco" },
  vidrio:    { bin: "Vidrio",          color: "#1c7a4a", tip: "🟢 Vidrio → contenedor verde" },
  metal:     { bin: "Metal (lata)",    color: "#c9962a", tip: "🟡 Metal/Lata → contenedor amarillo" },
  carton:    { bin: "Papel y cartón",  color: "#1a6bb5", tip: "🔵 Cartón/Papel → contenedor azul" },
  tetra_pak: { bin: "Tetra Pak",       color: "#3a7bc8", tip: "🔵 Tetra Pak → junto con cartón, contenedor azul" },
  papel:     { bin: "Papel y cartón",  color: "#1a6bb5", tip: "🔵 Papel → contenedor azul" },
  organico:  { bin: "Orgánico",        color: "#7c4f1c", tip: "🟤 Orgánico → contenedor marrón" },
  general:   { bin: "General",         color: "#3a3a3a", tip: "⚫ No reciclable → bolsa de residuos generales" },
};

const UNKNOWN_BIN: BinRule = { bin: "Sin identificar", color: "#b7b0a2", tip: "No se identificó el empaque — revisa el envase" };

// Solo para casos obvios donde el alimento no lleva empaque (frutas/verduras sueltas, pan suelto)
const OBVIOUS_ORGANIC = ["fruta","verdura","pan","carne","pollo","pescado","huevo","tomate","plátano","papa","cebolla","choclo","palta"];

export function getBin(material: string | null | undefined, name?: string) {
  if (material && MATERIAL_BINS[material]) return MATERIAL_BINS[material];
  if (name) {
    const lower = name.toLowerCase();
    if (OBVIOUS_ORGANIC.some(k => lower.includes(k))) return MATERIAL_BINS.organico;
  }
  return UNKNOWN_BIN;
}
