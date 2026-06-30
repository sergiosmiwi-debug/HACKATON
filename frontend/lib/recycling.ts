export const BIN_INFO: { keywords: string[]; bin: string; color: string; tip: string }[] = [
  { keywords: ["leche","yogur","jugo","tetra","caja","bebida"],
    bin: "Tetra Pak", color: "#b8860b", tip: "♻️ Tetra Pak → bolsa amarilla" },
  { keywords: ["botella","gaseosa","agua","plástico","cerveza","detergente","aceite","shampoo","champú"],
    bin: "Plástico",  color: "#1a6bb5", tip: "🔵 Plástico/Botella → tacho azul"  },
  { keywords: ["lata","atún","sardina","conserva","gaseosa lata"],
    bin: "Metal",     color: "#6b7280", tip: "⚪ Metal/Lata → tacho gris"    },
  { keywords: ["vidrio","frasco","mermelada"],
    bin: "Vidrio",    color: "#0e9488", tip: "🟢 Vidrio → tacho verde"       },
  { keywords: ["pan","fruta","verdura","carne","resto","queso","huevo","mantequilla","chorizo","pollo","pescado","tomate","plátano","papa","cebolla"],
    bin: "Orgánico",  color: "#7c4f1c", tip: "🟤 Orgánico → tacho marrón"   },
  { keywords: ["cartón","cereal","papel"],
    bin: "Cartón",    color: "#9a6b2c", tip: "📦 Cartón → tacho azul"        },
];

const FALLBACK_BIN = { bin: "General", color: "#9c9384", tip: "⚫ Otros → tacho general" };

export function getBin(name: string) {
  const lower = name.toLowerCase();
  for (const rule of BIN_INFO) {
    if (rule.keywords.some(k => lower.includes(k))) return rule;
  }
  return FALLBACK_BIN;
}
