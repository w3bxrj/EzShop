import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../context/CartContext";
import CartItem from "../components/CartItem";
import {
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  ShieldCheck,
  Truck,
  Trash2,
  AlertTriangle,
  Lock,
  X,
} from "lucide-react";

const Cart = () => {
  const {
    cart,
    loading,
    error,
    totalCount,
    uniqueItemCount,
    subtotal,
    fetchCart,
    clearCart,
  } = useCart();
  const [clearing, setClearing] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && showClearModal && !clearing) {
        setShowClearModal(false);
      }
    };
    if (showClearModal) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [showClearModal, clearing]);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const handleOpenClearModal = () => {
    setShowClearModal(true);
  };

  const handleConfirmClear = async () => {
    setClearing(true);
    await clearCart();
    setClearing(false);
    setShowClearModal(false);
  };

  if (loading) {
    return (
      <div
        id="cart-loading-state"
        className="flex-1 flex flex-col items-center justify-center min-h-[60vh] px-4 py-16"
      >
        <div className="w-10 h-10 border-2 border-neutral-200 border-t-black rounded-full animate-spin mb-4"></div>
        <h3 className="text-sm font-extrabold uppercase tracking-wide text-neutral-900">
          Loading your bag...
        </h3>
        <p className="text-xs text-neutral-400 mt-1">
          Fetching your saved items and checking latest stock...
        </p>
      </div>
    );
  }

  if (error && (!cart || cart.length === 0)) {
    return (
      <div
        id="cart-error-state"
        className="max-w-md mx-auto my-16 px-4 py-12 bg-white rounded-3xl border border-red-200 shadow-xs text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-100">
          <AlertTriangle size={30} />
        </div>
        <h2 className="text-xl font-black uppercase tracking-tight text-neutral-900 mb-2 font-display">
          UNABLE TO LOAD YOUR BAG
        </h2>
        <p className="text-xs text-neutral-500 mb-6 leading-relaxed font-medium">
          {error}
        </p>
        <button
          onClick={fetchCart}
          id="cart-retry-btn"
          className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-extrabold uppercase tracking-wider text-white bg-black hover:bg-neutral-800 rounded-full transition-colors shadow-xs cursor-pointer"
        >
          <RotateCcw size={14} />
          <span>Try Again</span>
        </button>
      </div>
    );
  }

  if (!cart || cart.length === 0) {
    return (
      <div
        id="cart-empty-state"
        className="max-w-lg mx-auto my-16 px-6 py-16 bg-white rounded-3xl border border-neutral-200 shadow-xs text-center"
      >
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          className="w-20 h-20 rounded-3xl bg-neutral-100 text-neutral-900 flex items-center justify-center mx-auto mb-6 border border-neutral-200"
        >
          <ShoppingBag size={34} strokeWidth={2.2} />
        </motion.div>

        <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-neutral-900 mb-2 font-display">
          YOUR BAG IS EMPTY
        </h2>
        <p className="text-xs sm:text-sm text-neutral-500 max-w-sm mx-auto mb-8 font-medium leading-relaxed">
          Looks like you haven&apos;t added any items yet. Explore our curated catalog of 190+ premium essentials.
        </p>

        <Link
          to="/products"
          id="browse-products-btn"
          className="inline-flex items-center gap-2 px-8 py-3.5 text-xs font-extrabold uppercase tracking-wider text-white bg-black hover:bg-neutral-800 rounded-full shadow-xs transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
        >
          <ShoppingBag size={14} />
          <span>Start Shopping</span>
          <ArrowRight size={14} strokeWidth={2.5} />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-black text-white rounded-full text-[10px] font-black uppercase tracking-widest">
              <ShoppingBag size={11} />
              Shopping Bag
            </span>
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
              {uniqueItemCount} {uniqueItemCount === 1 ? "Item" : "Items"}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-neutral-900 font-display">
            YOUR BAG
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 font-medium mt-1">
            Review your selected products and proceed to checkout.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleOpenClearModal}
            disabled={clearing}
            id="clear-cart-btn"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-neutral-600 hover:text-red-600 hover:bg-red-50 border border-neutral-200 hover:border-red-200 rounded-full transition-colors cursor-pointer"
            title="Empty all items from bag"
          >
            <Trash2 size={13} />
            <span>Empty Bag</span>
          </button>

          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-neutral-900 hover:bg-neutral-100 bg-white border border-neutral-200 rounded-full transition-colors"
          >
            <ArrowLeft size={13} />
            <span>Continue Shopping</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="flex items-center justify-between px-1 text-[11px] font-black text-neutral-400 uppercase tracking-widest">
            <span>
              Items ({totalCount} {totalCount === 1 ? "Unit" : "Units"})
            </span>
            <span className="hidden sm:inline">Pricing & Subtotal</span>
          </div>

          {cart.map((item) => (
            <CartItem key={item.product?._id || item._id} item={item} />
          ))}
        </div>

        <div className="lg:col-span-4 sticky top-24">
          <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-7 shadow-xs">
            <h2 className="text-base font-black uppercase tracking-tight text-neutral-900 mb-5 pb-3 border-b border-neutral-100 flex items-center justify-between font-display">
              <span>ORDER SUMMARY</span>
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 bg-neutral-100 text-neutral-800 rounded-full">
                {totalCount} {totalCount === 1 ? "UNIT" : "UNITS"}
              </span>
            </h2>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between text-neutral-600 font-medium">
                <span>Items Subtotal:</span>
                <span className="font-bold text-neutral-900" id="order-summary-subtotal">
                  {formatCurrency(subtotal)}
                </span>
              </div>

              <div className="flex items-center justify-between text-neutral-600 font-medium">
                <span>Estimated Delivery:</span>
                <span className="font-extrabold text-emerald-600 uppercase tracking-wide">FREE</span>
              </div>

              <div className="flex items-center justify-between text-neutral-600 font-medium">
                <span>Applicable Taxes:</span>
                <span className="text-neutral-400 font-semibold">Included</span>
              </div>

              <div className="pt-4 border-t border-neutral-100 flex items-baseline justify-between">
                <div>
                  <span className="text-sm font-black uppercase tracking-tight text-neutral-900 font-display">
                    TOTAL:
                  </span>
                  <span className="block text-[10px] text-neutral-400 font-medium">
                    Final checkout price
                  </span>
                </div>
                <span
                  id="order-summary-total"
                  className="text-2xl font-black text-neutral-900 tracking-tight"
                >
                  {formatCurrency(subtotal)}
                </span>
              </div>
            </div>

            <div className="mt-6 pt-2">
              <Link
                to="/checkout"
                id="proceed-checkout-btn"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 text-xs font-extrabold uppercase tracking-wider text-white bg-black hover:bg-neutral-800 rounded-full shadow-xs transition-all duration-200 cursor-pointer hover:scale-[1.01] active:scale-[0.98]"
              >
                <Lock size={14} />
                <span>Proceed to Checkout</span>
                <ArrowRight size={14} strokeWidth={2.5} />
              </Link>
            </div>

            <div className="mt-6 pt-5 border-t border-neutral-100 space-y-2.5 text-[11px] font-semibold text-neutral-500">
              <div className="flex items-center gap-2">
                <Truck size={14} className="text-neutral-800 shrink-0" />
                <span>Free doorstep delivery nationwide</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-neutral-800 shrink-0" />
                <span>100% Genuine authenticated products</span>
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw size={14} className="text-neutral-800 shrink-0" />
                <span>Hassle-free 30 days return policy</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showClearModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => !clearing && setShowClearModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 14 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-neutral-200 z-10"
              role="dialog"
              aria-modal="true"
              aria-labelledby="clear-bag-title"
            >
              <button
                type="button"
                onClick={() => !clearing && setShowClearModal(false)}
                className="absolute top-5 right-5 p-1.5 rounded-full text-neutral-400 hover:text-black hover:bg-neutral-100 transition-colors cursor-pointer"
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>

              <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-5 border border-red-100">
                <Trash2 size={22} strokeWidth={2.2} />
              </div>

              <h3 id="clear-bag-title" className="text-xl font-black uppercase tracking-tight text-neutral-900 font-display">
                Empty Shopping Bag?
              </h3>

              <p className="mt-2 text-xs sm:text-sm text-neutral-500 font-medium leading-relaxed">
                Are you sure you want to remove all {totalCount} {totalCount === 1 ? "item" : "items"} from your shopping bag? This action cannot be undone.
              </p>

              <div className="mt-6 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowClearModal(false)}
                  disabled={clearing}
                  className="flex-1 h-11 px-4 text-xs font-extrabold uppercase tracking-wider text-neutral-700 hover:text-black bg-neutral-100 hover:bg-neutral-200 rounded-full transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  id="confirm-clear-cart-btn"
                  onClick={handleConfirmClear}
                  disabled={clearing}
                  className="flex-1 h-11 px-4 inline-flex items-center justify-center gap-2 text-xs font-extrabold uppercase tracking-wider text-white bg-red-600 hover:bg-red-700 rounded-full shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {clearing ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Emptying...</span>
                    </>
                  ) : (
                    <span>Yes, Empty Bag</span>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Cart;
