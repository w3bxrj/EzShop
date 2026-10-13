import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Minus, Plus, Trash2, Loader2, Tag, AlertCircle } from "lucide-react";
import { useCart } from "../context/CartContext";

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart, actionLoading } = useCart();
  const [localError, setLocalError] = useState(null);

  if (!item || !item.product) return null;

  const { product, quantity } = item;
  const { _id, name, price, image, stock, category } = product;

  const isCurrentAction = actionLoading[_id];
  const isUpdating = isCurrentAction === "update";
  const isRemoving = isCurrentAction === "remove";

  // Formatter for INR Currency
  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const itemTotal = (price || 0) * (quantity || 1);
  const isAtMaxStock = quantity >= stock;
  const isAtMinQuantity = quantity <= 1;

  const handleDecrease = async () => {
    if (isAtMinQuantity || isUpdating || isRemoving) return;
    setLocalError(null);
    const res = await updateQuantity(_id, quantity - 1);
    if (!res.success) {
      setLocalError(res.message);
      setTimeout(() => setLocalError(null), 3000);
    }
  };

  const handleIncrease = async () => {
    if (isAtMaxStock || isUpdating || isRemoving) return;
    setLocalError(null);
    const res = await updateQuantity(_id, quantity + 1);
    if (!res.success) {
      setLocalError(res.message);
      setTimeout(() => setLocalError(null), 3000);
    }
  };

  const handleRemove = async () => {
    if (isRemoving) return;
    setLocalError(null);
    const res = await removeFromCart(_id);
    if (!res.success) {
      setLocalError(res.message);
      setTimeout(() => setLocalError(null), 3000);
    }
  };

  return (
    <div
      className="p-5 sm:p-6 bg-white rounded-3xl border border-neutral-200 shadow-xs hover:border-black transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5"
      data-testid={`cart-item-${_id}`}
    >
      <div className="flex items-center gap-4 sm:gap-5 w-full sm:w-auto">
        <Link
          to={`/products/${_id}`}
          className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#f6f6f6] overflow-hidden shrink-0 border border-neutral-200/80 group block p-2"
        >
          <img
            src={image}
            alt={name}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://placehold.co/400x400/f6f6f6/999999?text=ezshop";
            }}
          />
        </Link>

        <div className="flex-1 min-w-0">
          {category && (
            <div className="mb-1">
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-full">
                <Tag size={9} />
                {category}
              </span>
            </div>
          )}

          <Link
            to={`/products/${_id}`}
            className="text-sm sm:text-base font-bold text-neutral-900 hover:text-neutral-600 transition-colors line-clamp-1 block"
            title={name}
          >
            {name}
          </Link>

          <div className="mt-1 text-xs text-neutral-400 font-medium flex items-center gap-2">
            <span>Unit: <strong className="text-neutral-900 font-bold">{formatCurrency(price)}</strong></span>
            <span>•</span>
            <span className={stock <= 5 ? "text-amber-600 font-bold" : "text-neutral-400"}>
              {stock <= 5 ? `Only ${stock} left` : `${stock} in stock`}
            </span>
          </div>

          {localError && (
            <div className="mt-1.5 flex items-center gap-1 text-xs font-bold text-red-600">
              <AlertCircle size={12} />
              <span>{localError}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-neutral-100">
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center bg-neutral-50 border border-neutral-200 rounded-full p-1 shadow-xs">
            <button
              onClick={handleDecrease}
              disabled={isAtMinQuantity || isUpdating || isRemoving}
              id={`decrease-qty-${_id}`}
              className={`w-7 h-7 rounded-full flex items-center justify-center text-neutral-600 transition-colors ${
                isAtMinQuantity || isUpdating || isRemoving
                  ? "opacity-30 cursor-not-allowed text-neutral-300"
                  : "hover:bg-black hover:text-white active:scale-95 cursor-pointer shadow-xs"
              }`}
              title={isAtMinQuantity ? "Minimum quantity is 1 (use remove to delete)" : "Decrease quantity"}
              aria-label="Decrease quantity"
            >
              <Minus size={13} className="stroke-[2.5]" />
            </button>

            <span
              id={`qty-display-${_id}`}
              className="w-8 text-center text-xs font-black text-neutral-900 tabular-nums flex items-center justify-center"
            >
              {isUpdating ? (
                <Loader2 size={13} className="animate-spin text-neutral-900" />
              ) : (
                quantity
              )}
            </span>

            <button
              onClick={handleIncrease}
              disabled={isAtMaxStock || isUpdating || isRemoving}
              id={`increase-qty-${_id}`}
              className={`w-7 h-7 rounded-full flex items-center justify-center text-neutral-600 transition-colors ${
                isAtMaxStock || isUpdating || isRemoving
                  ? "opacity-30 cursor-not-allowed text-neutral-300"
                  : "hover:bg-black hover:text-white active:scale-95 cursor-pointer shadow-xs"
              }`}
              title={isAtMaxStock ? `Max stock limit (${stock}) reached` : "Increase quantity"}
              aria-label="Increase quantity"
            >
              <Plus size={13} className="stroke-[2.5]" />
            </button>
          </div>
        </div>

        <div className="text-right min-w-[80px]">
          <span className="block text-[10px] uppercase font-black tracking-widest text-neutral-400">Total</span>
          <span
            id={`item-subtotal-${_id}`}
            className="text-base font-black text-neutral-900 tracking-tight"
          >
            {formatCurrency(itemTotal)}
          </span>
        </div>

        <div>
          <button
            onClick={handleRemove}
            disabled={isRemoving}
            id={`remove-item-${_id}`}
            className={`p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors cursor-pointer border border-transparent hover:border-red-200 ${
              isRemoving ? "opacity-50 cursor-not-allowed" : ""
            }`}
            title="Remove item from bag"
            aria-label={`Remove ${name} from bag`}
          >
            {isRemoving ? (
              <Loader2 size={15} className="animate-spin text-red-500" />
            ) : (
              <Trash2 size={15} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
