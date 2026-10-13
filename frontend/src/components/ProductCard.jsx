import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Heart,
  Loader2,
  ShoppingBag,
  Check,
} from "lucide-react";
import API from "../services/api";
import { useCart } from "../context/CartContext";

const ProductCard = ({ product, initialWishlisted = false }) => {
  const [isWishlisted, setIsWishlisted] = useState(initialWishlisted);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const navigate = useNavigate();
  const { addToCart, actionLoading, isItemInCart, getItemQuantity } = useCart();

  const isAddingToCart = actionLoading && actionLoading[product?._id] === "add";
  const inCart = product ? isItemInCart(product._id) : false;
  const cartQty = product ? getItemQuantity(product._id) : 0;

  useEffect(() => {
    setIsWishlisted(Boolean(initialWishlisted));
  }, [initialWishlisted]);

  if (!product) return null;

  const { _id, name, price, category, image, stock } = product;

  // Indian Rupee formatting
  const formattedPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price || 0);

  const isOutOfStock = stock <= 0;
  const isLowStock = stock > 0 && stock <= 5;

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (saving) return;

    try {
      setSaving(true);
      setStatusMessage(null);

      if (!isWishlisted) {
        const response = await API.post(`/wishlist/${_id}`);
        if (response.data && response.data.success) {
          setIsWishlisted(true);
          setStatusMessage({ type: "success", text: "Saved to Favorites" });
          window.dispatchEvent(new CustomEvent("wishlistUpdated"));
        }
      } else {
        const response = await API.delete(`/wishlist/${_id}`);
        if (response.data && response.data.success) {
          setIsWishlisted(false);
          setStatusMessage({ type: "info", text: "Removed from Favorites" });
          window.dispatchEvent(new CustomEvent("wishlistUpdated"));
        }
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setStatusMessage({
          type: "error",
          text: "Please sign in to save",
          loginRequired: true,
        });
      } else {
        setStatusMessage({
          type: "error",
          text: "Could not update favorites",
        });
      }
    } finally {
      setSaving(false);
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock || isAddingToCart) return;

    try {
      setStatusMessage(null);
      const res = await addToCart(_id);
      if (res.success) {
        setStatusMessage({
          type: "success",
          text: inCart ? `Updated in Bag (${cartQty + 1})` : "Added to Bag",
        });
      } else {
        const isAuthError = res.status === 401;
        setStatusMessage({
          type: "error",
          text: isAuthError ? "Please sign in to add to bag" : (res.message || "Failed to add to bag"),
          loginRequired: isAuthError,
        });
      }
    } catch {
      setStatusMessage({
        type: "error",
        text: "Could not add to bag",
      });
    } finally {
      setTimeout(() => setStatusMessage(null), 3500);
    }
  };

  return (
    <div
      className="group flex flex-col bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-2xs hover:shadow-lg transition-all duration-300"
      data-testid="product-card"
    >
      <div className="relative w-full aspect-[4/3] bg-[#f6f6f6] overflow-hidden">
        <img
          src={image}
          alt={name}
          loading="lazy"
          className="h-full w-full object-cover object-center transition-transform duration-300 ease-out group-hover:scale-105"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://placehold.co/600x400/f6f6f6/111111?text=ezshop";
          }}
        />

        <div className="absolute top-3 left-3">
          <span className="inline-block px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-md bg-white text-neutral-900 border border-neutral-200 shadow-2xs">
            {category}
          </span>
        </div>

        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={handleWishlistToggle}
          disabled={saving}
          id={`wishlist-quick-btn-${_id}`}
          className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-neutral-800 shadow-sm border border-neutral-200 hover:border-black cursor-pointer transition-colors"
          title={isWishlisted ? "Remove from favorites" : "Add to favorites"}
          type="button"
        >
          {saving ? (
            <Loader2 size={14} className="animate-spin text-neutral-400" />
          ) : (
            <Heart
              size={15}
              strokeWidth={2.2}
              className={isWishlisted ? "fill-red-500 text-red-500" : "text-neutral-800"}
            />
          )}
        </motion.button>

        <div className="absolute bottom-3 left-3">
          {isOutOfStock ? (
            <span className="inline-block px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded bg-red-600 text-white shadow-2xs">
              Sold Out
            </span>
          ) : isLowStock ? (
            <span className="inline-block px-2.5 py-0.5 text-[10px] font-bold rounded bg-amber-100 text-amber-900 border border-amber-300">
              Only {stock} Left
            </span>
          ) : (
            <span className="inline-block px-2 py-0.5 text-[10px] font-bold rounded bg-white/90 backdrop-blur-xs text-neutral-700 border border-neutral-200">
              In Stock
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">
            {category}
          </span>

          <h3
            className="text-[14px] font-extrabold text-neutral-900 line-clamp-1 group-hover:text-neutral-600 transition-colors font-display"
            title={name}
          >
            {name}
          </h3>

          <div className="mt-1 flex items-center justify-between text-xs text-neutral-500">
            <span>{isOutOfStock ? "Unavailable" : `${stock} units in stock`}</span>
            <span className="tabular-nums font-mono text-[10px] text-neutral-400">#id-{_id.slice(-4)}</span>
          </div>

          {statusMessage && (
            <div
              className={`mt-2 flex items-center justify-between rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                statusMessage.type === "error"
                  ? "bg-red-50 text-red-700 border border-red-200"
                  : statusMessage.type === "success"
                  ? "bg-neutral-900 text-white"
                  : "bg-neutral-100 text-neutral-800"
              }`}
            >
              <span className="truncate">{statusMessage.text}</span>
              {statusMessage.loginRequired && (
                <button
                  onClick={() => navigate("/login")}
                  className="ml-2 shrink-0 underline font-extrabold text-inherit hover:text-black cursor-pointer"
                >
                  Sign In →
                </button>
              )}
            </div>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-neutral-100 flex flex-col gap-2.5">
          <div className="flex items-baseline justify-between">
            <span className="text-xs uppercase font-extrabold tracking-wider text-neutral-400">
              Price
            </span>
            <span className="text-[17px] font-black tracking-tight text-neutral-900 tabular-nums">
              {formattedPrice}
            </span>
          </div>

          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleAddToCart}
            disabled={isOutOfStock || isAddingToCart}
            id={`add-to-cart-btn-${_id}`}
            className={`flex h-10 w-full items-center justify-center gap-2 rounded-full text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer select-none ${
              isOutOfStock
                ? "bg-neutral-100 text-neutral-400 border border-neutral-200 cursor-not-allowed"
                : isAddingToCart
                ? "bg-neutral-200 text-neutral-800 cursor-not-allowed"
                : inCart
                ? "bg-neutral-800 text-white"
                : "bg-black text-white hover:bg-neutral-800 shadow-xs"
            }`}
          >
            {isAddingToCart ? (
              <>
                <Loader2 size={14} className="animate-spin text-white" />
                <span>Adding to Bag...</span>
              </>
            ) : isOutOfStock ? (
              <span>Out of stock</span>
            ) : inCart ? (
              <>
                <Check size={14} strokeWidth={2.5} />
                <span>In Bag ({cartQty})</span>
              </>
            ) : (
              <>
                <ShoppingBag size={14} strokeWidth={2.2} />
                <span>Add to Bag</span>
              </>
            )}
          </motion.button>

          <div className="grid grid-cols-2 gap-1.5">
            <Link
              to={`/products/${_id}`}
              id={`view-details-${_id}`}
              className="flex h-8 items-center justify-center gap-1 rounded-full border border-neutral-300 bg-white text-xs font-bold text-neutral-800 hover:border-black transition-colors"
            >
              <span>Details</span>
              <ArrowRight size={12} strokeWidth={2.2} />
            </Link>

            <button
              onClick={handleWishlistToggle}
              disabled={saving}
              id={`wishlist-btn-${_id}`}
              type="button"
              className={`flex h-8 items-center justify-center gap-1 rounded-full border text-xs font-bold transition-colors cursor-pointer ${
                saving
                  ? "bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed"
                  : isWishlisted
                  ? "bg-red-50 text-red-600 border-red-200"
                  : "bg-white text-neutral-800 border-neutral-300 hover:border-black"
              }`}
            >
              <Heart
                size={12}
                strokeWidth={2.2}
                className={isWishlisted ? "fill-red-500 text-red-500" : ""}
              />
              <span>{isWishlisted ? "Saved" : "Save"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
