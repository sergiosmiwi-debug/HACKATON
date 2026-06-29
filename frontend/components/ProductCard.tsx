"use client";
import { Clock, Package, ArrowBendUpRight, Trash } from "@phosphor-icons/react";

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
  fresh:   { border: "border-l-green-500",  dot: "bg-green-500",  label: "Fresco",    labelColor: "text-green-700",  labelBg: "bg-green-50" },
  warning: { border: "border-l-amber-500",  dot: "bg-amber-500",  label: "Pronto",    labelColor: "text-amber-700",  labelBg: "bg-amber-50" },
  danger:  { border: "border-l-red-500",    dot: "bg-red-500",    label: "Urgente",   labelColor: "text-red-700",    labelBg: "bg-red-50" },
  expired: { border: "border-l-slate-300",  dot: "bg-slate-400",  label: "Vencido",   labelColor: "text-slate-500",  labelBg: "bg-slate-100" },
};

export default function ProductCard({ product, onOpen, onDiscard }: Props) {
  const cfg = statusConfig[product.status as keyof typeof statusConfig] ?? statusConfig.fresh;

  const daysText =
    product.days_left === null ? "Sin fecha" :
    product.days_left < 0 ? "Vencido" :
    product.days_left === 0 ? "Vence hoy" :
    product.days_left === 1 ? "Vence mañana" :
    `${product.days_left} dias`;

  return (
    <div className={`bg-white rounded-2xl border-l-4 border border-slate-100 shadow-sm overflow-hidden ${cfg.border}`}>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-800 truncate text-[15px]">{product.name}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Package size={12} className="text-slate-400" />
              <p className="text-xs text-slate-500">{product.quantity} &middot; {product.category}</p>
            </div>
          </div>
          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0 ${cfg.labelColor} ${cfg.labelBg}`}>
            {cfg.label}
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Clock size={13} className="text-slate-400" />
            <span className="text-xs font-medium text-slate-500">{daysText}</span>
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={() => onOpen(product.id)}
              className="flex items-center gap-1 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-colors"
            >
              <ArrowBendUpRight size={12} />
              Abrir
            </button>
            <button
              onClick={() => onDiscard(product.id)}
              className="flex items-center gap-1 text-xs font-semibold text-red-500 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-xl transition-colors"
            >
              <Trash size={12} />
              Tirar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
