export const BIN_INFO: { keywords: string[]; bin: string; color: string; tip: string }[] = [
  { keywords: ["leche","yogur","jugo","tetra","caja"],    bin: "Tetra Pak", color: "#b8860b", tip: "♻️ Tetra Pak → bolsa amarilla" },
  { keywords: ["botella","gaseosa","agua","plástico"],     bin: "Plástico",  color: "#1a6bb5", tip: "🔵 Plástico PET → tacho azul"  },
  { keywords: ["lata","atún","sardina","conserva"],        bin: "Metal",     color: "#6b7280", tip: "⚪ Metal/Lata → tacho gris"    },
  { keywords: ["vidrio","frasco","mermelada"],             bin: "Vidrio",    color: "#1c7a4a", tip: "🟢 Vidrio → tacho verde"       },
  { keywords: ["pan","fruta","verdura","carne","resto"],   bin: "Orgánico",  color: "#7c4f1c", tip: "🟤 Orgánico → tacho marrón"   },
  { keywords: ["cartón","cereal","papel"],                 bin: "Cartón",    color: "#1a6bb5", tip: "📦 Cartón → tacho azul"        },
];

export function getBin(name: string) {
  const lower = name.toLowerCase();
  for (const rule of BIN_INFO) {
    if (rule.keywords.some(k => lower.includes(k))) return rule;
  }
  return null;
}
