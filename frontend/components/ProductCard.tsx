"use client";

interface Product {
  id: number;
  name: string;
  category: string;
  quantity: string;
  days_left: number | null;
  status: string;
  purchase_price: number;
}

interface Props {
  product: Product;
  onOpen: (id: number) => void;
  onDiscard: (id: number) => void;
}

const statusConfig = {
  fresh:   { bg: "bg-green-50",  border: "border-green-200", badge: "bg-green-100 text-green-700",  label: "Fresco" },
  warning: { bg: "bg-yellow-50", border: "border-yellow-200", badge: "bg-yellow-100 text-yellow-700", label: "Pronto" },
  danger:  { bg: "bg-red-50",   border: "border-red-200",   badge: "bg-red-100 text-red-700",     label: "¡Urgente!" },
  expired: { bg: "bg-gray-50",  border: "border-gray-200",  badge: "bg-gray-200 text-gray-600",   label: "Vencido" },
};

export default function ProductCard({ product, onOpen, onDiscard }: Props) {
  const cfg = statusConfig[product.status as keyof typeof statusConfig] ?? statusConfig.fresh;
  const daysText =
    product.days_left === null ? "Sin fecha" :
    product.days_left < 0 ? "Vencido" :
    product.days_left === 0 ? "Vence hoy" :
    product.days_left === 1 ? "Vence mañana" :
    `${product.days_left} días`;

  return (
    <div className={`rounded-2xl border p-4 ${cfg.bg} ${cfg.border}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-800 truncate">{product.name}</p>
          <p className="text-sm text-slate-500">{product.quantity} · {product.category}</p>
        </div>
        <span className={`text-xs font-semibold px-2 py-1 rounded-full shrink-0 ${cfg.badge}`}>
          {cfg.label}
        </span>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-600">{daysText}</span>
        <div className="flex gap-2">
          <button
            onClick={() => onOpen(product.id)}
            className="text-xs bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-xl hover:bg-slate-50 transition"
          >
            Abrir
          </button>
          <button
            onClick={() => onDiscard(product.id)}
            className="text-xs bg-white border border-red-200 text-red-500 px-3 py-1.5 rounded-xl hover:bg-red-50 transition"
          >
            Tirar
          </button>
        </div>
      </div>
    </div>
  );
}
