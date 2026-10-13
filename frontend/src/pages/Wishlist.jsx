import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import API from "../services/api";
import WishlistCard from "../components/WishlistCard";
import {
  Heart,
  AlertCircle,
  RefreshCw,
  ShoppingBag,
  ArrowRight,
  LogIn,
  Layers,
} from "lucide-react";

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const navigate = useNavigate();

  // Fetch Wishlist from Backend API (Task 3 & Task 6)
  const fetchWishlist = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setIsUnauthorized(false);

      const response = await API.get("/wishlist");

      if (response.data && response.data.success) {
        setWishlist(response.data.wishlist || []);
      } else {
        setWishlist([]);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setIsUnauthorized(true);
      } else {
        setError("Unable to load wishlist. Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWishlist();

    // Listen for custom wishlistUpdated events to keep in sync
    const handleUpdate = () => {
      fetchWishlist();
    };
    window.addEventListener("wishlistUpdated", handleUpdate);
    return () => {
      window.removeEventListener("wishlistUpdated", handleUpdate);
    };
  }, [fetchWishlist]);

  // Callback when a card removes an item directly
  const handleItemRemoved = (removedProductId) => {
    setWishlist((prev) => prev.filter((item) => item._id !== removedProductId));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Header Banner - Nike/ASOS Bold Retail */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest">
            <Heart size={11} className="fill-red-500 text-red-500" />
            Saved Items
          </span>
          <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
            Personal Collection
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-neutral-900 font-display">
              MY WISHLIST
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 font-medium mt-1">
              Keep track of items you love. They stay synced across your devices.
            </p>
          </div>

          {!loading && !error && !isUnauthorized && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white border border-neutral-200 rounded-full text-xs font-extrabold text-neutral-900 shadow-xs self-start sm:self-auto">
              <Layers size={13} className="text-neutral-500" />
              <span>
                {wishlist.length} {wishlist.length === 1 ? "ITEM SAVED" : "ITEMS SAVED"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Task 7: Loading State */}
      {loading && (
        <div
          id="wishlist-loading"
          className="flex flex-col items-center justify-center py-20 px-4"
        >
          <div className="w-10 h-10 border-2 border-neutral-200 border-t-black rounded-full animate-spin mb-4"></div>
          <h3 className="text-sm font-extrabold uppercase tracking-wide text-neutral-900">
            Loading your favorites...
          </h3>
          <p className="text-xs text-neutral-400 mt-1">
            Retrieving saved items from your account...
          </p>

          {/* Skeleton cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full mt-10">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="bg-white rounded-3xl border border-neutral-200/80 p-4 animate-pulse flex flex-col gap-4"
              >
                <div className="w-full pt-[75%] bg-neutral-100 rounded-2xl"></div>
                <div className="h-4 bg-neutral-200 rounded-sm w-3/4"></div>
                <div className="h-3 bg-neutral-100 rounded-sm w-1/2"></div>
                <div className="h-10 bg-neutral-200 rounded-full mt-4"></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && isUnauthorized && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          id="wishlist-unauthorized"
          className="bg-white border border-neutral-200 rounded-3xl p-10 sm:p-14 text-center max-w-md mx-auto my-12 shadow-xs"
        >
          <div className="w-16 h-16 rounded-2xl bg-neutral-100 text-neutral-800 flex items-center justify-center mx-auto mb-4 border border-neutral-200">
            <LogIn size={26} />
          </div>
          <h2 className="text-xl font-black uppercase tracking-tight text-neutral-900 mb-2 font-display">
            MEMBER SIGN-IN REQUIRED
          </h2>
          <p className="text-xs text-neutral-500 mb-6 font-medium">
            Please log in with your ezshop account to view and manage your saved wishlist items.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="inline-flex items-center gap-2 px-6 py-3 text-xs font-extrabold uppercase tracking-wider text-white bg-black hover:bg-neutral-800 rounded-full shadow-xs transition-colors cursor-pointer"
          >
            <span>Sign In to Your Account</span>
            <ArrowRight size={14} />
          </button>
        </motion.div>
      )}

      {!loading && !isUnauthorized && error && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          id="wishlist-error"
          className="bg-white border border-red-200 rounded-3xl p-8 sm:p-12 text-center max-w-lg mx-auto my-12 shadow-xs"
        >
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-100">
            <AlertCircle size={24} />
          </div>
          <h2 className="text-lg font-black uppercase tracking-tight text-neutral-900 mb-1 font-display">
            SOMETHING WENT WRONG
          </h2>
          <p className="text-xs text-neutral-600 mb-6 font-medium">
            We couldn't load your wishlist. Please verify your connection and try again.
          </p>
          <button
            onClick={fetchWishlist}
            id="retry-wishlist-btn"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-extrabold uppercase tracking-wider text-white bg-black hover:bg-neutral-800 rounded-full shadow-xs transition-colors cursor-pointer"
          >
            <RefreshCw size={14} />
            <span>Try Again</span>
          </button>
        </motion.div>
      )}

      {!loading && !isUnauthorized && !error && wishlist.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          id="wishlist-empty"
          className="bg-white border border-neutral-200 rounded-3xl p-10 sm:p-16 text-center max-w-lg mx-auto my-12 shadow-xs"
        >
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
            className="w-16 h-16 rounded-2xl bg-neutral-100 text-neutral-800 flex items-center justify-center mx-auto mb-5 border border-neutral-200"
          >
            <Heart size={30} className="fill-red-500 text-red-500" />
          </motion.div>
          <h2 className="text-2xl font-black uppercase tracking-tight text-neutral-900 mb-2 font-display">
            YOUR WISHLIST IS EMPTY
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 mb-7 max-w-sm mx-auto font-medium leading-relaxed">
            Save products you love as you browse and find them here anytime. Tap the heart icon on any product to save it.
          </p>
          <Link
            to="/products"
            id="browse-products-btn"
            className="inline-flex items-center gap-2 px-7 py-3 text-xs font-extrabold uppercase tracking-wider text-white bg-black hover:bg-neutral-800 rounded-full shadow-xs transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <ShoppingBag size={14} />
            <span>Explore Catalog</span>
            <ArrowRight size={14} strokeWidth={2.5} />
          </Link>
        </motion.div>
      )}

      {!loading && !isUnauthorized && !error && wishlist.length > 0 && (
        <div
          id="wishlist-grid"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {wishlist.map((product) => (
            <WishlistCard
              key={product._id}
              product={product}
              onRemove={handleItemRemoved}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
