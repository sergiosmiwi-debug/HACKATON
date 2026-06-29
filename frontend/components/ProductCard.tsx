"use client";
import { Clock, Package, ArrowBendUpRight, Trash, CheckCircle, Circle } from "@phosphor-icons/react";

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
  selectMode?: boolean;
  selected?: boolean;
  onSelect?: (id: number) => void;
}

const statusConfig = {
  fresh:   { border: "border-l-green-500",  label: "Fresco",   labelColor: "text-green-700",  labelBg: "bg-green-50" },
  warning: { border: "border-l-amber-500",  label: "Pronto",   labelColor: "text-amber-700",  labelBg: "bg-amber-50" },
  danger:  { border: "border-l-red-500",    label: "Urgente",  labelColor: "text-red-700",    labelBg: "bg-red-50" },
  expired: { border: "border-l-slate-300",  label: "Vencido",  labelColor: "text-slate-500",  labelBg: "bg-slate-100" },
};

export default function ProductCard({ product, onOpen, onDiscard, selectMode, selected, onSelect }: Props) {
  const cfg = statusConfig[product.status as keyof typeof statusConfig] ?? statusConfig.fresh;

  const daysText =
    product.days_left === null ? "Sin fecha" :
    product.days_left < 0  ? "Vencido" :
    product.days_left === 0 ? "Vence hoy" :
    product.days_left === 1 ? "Vence mañana" :
    `${product.days_left} dias`;

  return (
    <div
      onClick={() => selectMode && onSelect?.(product.id)}
      className={`bg-white rounded-2xl border-l-4 border border-slate-100 shadow-sm overflow-hidden ${cfg.border} ${
        selectMode ? "cursor-pointer active:scale-[0.98] transition-transform duration-100" : ""
      } ${selected ? "ring-2 ring-green-500 ring-offset-1" : ""}`}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          {selectMode && (
            <div className="mt-0.5 shrink-0">
              {selected
                ? <CheckCircle size={20} weight="fill" className="text-green-600" />
                : <Circle size={20} className="text-slate-300" />
              }
            </div>
          )}
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

        <div className="mt-2 flex items-center gap-1.5">
          <Clock size={13} className="text-slate-400" />
          <span className="text-xs font-medium text-slate-500">{daysText}</span>
        </div>

        {!selectMode && (
          <div className="mt-3 flex gap-1.5 justify-end">
            <button
              onClick={(e) => { e.stopPropagation(); onOpen(product.id); }}
              className="flex items-center gap-1 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 active:scale-[0.95] px-3 py-1.5 rounded-xl transition-all duration-100"
            >
              <ArrowBendUpRight size={12} />
              Abrir
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDiscard(product.id); }}
              className="flex items-center gap-1 text-xs font-semibold text-red-500 bg-red-50 hover:bg-red-100 active:scale-[0.95] px-3 py-1.5 rounded-xl transition-all duration-100"
            >
              <Trash size={12} />
              Tirar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
