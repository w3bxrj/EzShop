import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Trash2, Tag, Box, AlertTriangle, CheckCircle2 } from "lucide-react";
import API from "../services/api";

const WishlistCard = ({ product, onRemove }) => {
  const [removing, setRemoving] = useState(false);
  const [removeError, setRemoveError] = useState(null);

  if (!product) return null;

  const { _id, name, price, category, image, stock } = product;

  const formattedPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price || 0);

  const isOutOfStock = stock <= 0;
  const isLowStock = stock > 0 && stock <= 5;

  const handleRemove = async () => {
    try {
      setRemoving(true);
      setRemoveError(null);

      const response = await API.delete(`/wishlist/${_id}`);
      if (response.data && response.data.success) {
        // Dispatch custom event so Navbar updates wishlist count badge dynamically
        window.dispatchEvent(new CustomEvent("wishlistUpdated"));
        if (onRemove) {
          onRemove(_id);
        }
      }
    } catch (err) {
      setRemoveError(
        err.response?.data?.message || "Failed to remove item. Please try again."
      );
      setRemoving(false);
    }
  };

  return (
    <div
      className="group bg-white rounded-3xl border border-neutral-200 overflow-hidden shadow-xs hover:border-black transition-all duration-300 flex flex-col h-full"
      data-testid={`wishlist-card-${_id}`}
    >
      <div className="relative w-full pt-[85%] bg-[#f6f6f6] overflow-hidden flex items-center justify-center">
        <img
          src={image}
          alt={name}
          className="absolute inset-0 w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500 ease-out"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://placehold.co/600x400/f6f6f6/999999?text=ezshop";
          }}
        />

        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-full bg-white/95 backdrop-blur-md text-neutral-800 border border-neutral-200 shadow-xs">
            <Tag size={10} className="text-neutral-500" />
            {category}
          </span>
        </div>

        <div className="absolute top-3 right-3">
          {isOutOfStock ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-full bg-red-600 text-white shadow-xs">
              <AlertTriangle size={10} /> Out of Stock
            </span>
          ) : isLowStock ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-full bg-amber-500 text-white shadow-xs">
              Only {stock} Left
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-full bg-neutral-900 text-white shadow-xs">
              <CheckCircle2 size={10} className="text-emerald-400" /> In Stock
            </span>
          )}
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3
            className="font-bold text-neutral-900 text-sm leading-snug line-clamp-2 hover:text-neutral-600 transition-colors"
            title={name}
          >
            {name}
          </h3>

          <div className="mt-2 flex items-center gap-1.5 text-xs text-neutral-400 font-medium">
            <Box size={13} className="text-neutral-400" />
            <span>
              {isOutOfStock ? "Currently unavailable" : `${stock} units left in stock`}
            </span>
          </div>

          {removeError && (
            <p className="mt-2 text-xs text-red-600 font-bold">
              {removeError}
            </p>
          )}
        </div>

        <div className="mt-5 pt-4 border-t border-neutral-100 flex flex-col gap-3">
          <div className="flex items-baseline justify-between">
            <span className="text-[10px] uppercase font-black tracking-widest text-neutral-400">
              Price
            </span>
            <span className="text-lg font-black text-neutral-900 tracking-tight">
              {formattedPrice}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Link
              to={`/products/${_id}`}
              id={`wishlist-view-${_id}`}
              className="inline-flex items-center justify-center gap-1 px-3 py-2 text-xs font-extrabold uppercase tracking-wider text-white bg-black hover:bg-neutral-800 rounded-full transition-colors text-center cursor-pointer shadow-xs"
            >
              <span>View</span>
              <ArrowRight size={13} strokeWidth={2.5} />
            </Link>

            <button
              id={`wishlist-remove-${_id}`}
              onClick={handleRemove}
              disabled={removing}
              className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-extrabold uppercase tracking-wider rounded-full transition-colors border cursor-pointer ${
                removing
                  ? "bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed"
                  : "text-neutral-600 hover:text-red-600 hover:bg-red-50 border-neutral-200 hover:border-red-200"
              }`}
            >
              {removing ? (
                <>
                  <div className="w-3 h-3 border-2 border-neutral-300 border-t-black rounded-full animate-spin"></div>
                  <span>Removing</span>
                </>
              ) : (
                <>
                  <Trash2 size={13} />
                  <span>Remove</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WishlistCard;
