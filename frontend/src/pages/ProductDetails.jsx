import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import {
  ArrowLeft,
  Tag,
  Box,
  CheckCircle2,
  AlertTriangle,
  ShoppingCart,
  ShieldCheck,
  Truck,
  RotateCcw,
  AlertCircle,
  Sparkles,
  Heart,
  Loader2,
} from "lucide-react";
import { useCart } from "../context/CartContext";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, actionLoading, isItemInCart, getItemQuantity } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartFeedback, setCartFeedback] = useState(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [savingWishlist, setSavingWishlist] = useState(false);
  const [wishlistMessage, setWishlistMessage] = useState(null);

  const isAddingToCart = actionLoading && actionLoading[id] === "add";
  const inCart = isItemInCart(id);
  const currentCartQty = getItemQuantity(id);

  useEffect(() => {
    let isMounted = true;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await API.get(`/products/${id}`);
        if (isMounted) {
          if (response.data && response.data.success && response.data.product) {
            setProduct(response.data.product);
          } else {
            setError("Product not found");
          }
        }
      } catch (err) {
        if (isMounted) {
          if (err.response?.status === 400) {
            setError("Invalid Product ID.");
          } else if (err.response?.status === 404) {
            setError("Product not found.");
          } else {
            setError("Something went wrong while loading product details.");
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    const checkWishlist = async () => {
      try {
        const res = await API.get("/wishlist");
        if (isMounted && res.data?.success && Array.isArray(res.data.wishlist)) {
          const found = res.data.wishlist.some((item) => item._id === id);
          setIsWishlisted(found);
        }
      } catch {
        // Not logged in or error
      }
    };

    fetchProduct();
    checkWishlist();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleWishlistToggle = async () => {
    if (savingWishlist) return;
    try {
      setSavingWishlist(true);
      setWishlistMessage(null);

      if (!isWishlisted) {
        const res = await API.post(`/wishlist/${id}`);
        if (res.data?.success) {
          setIsWishlisted(true);
          setWishlistMessage({ type: "success", text: "♥ Added to Wishlist" });
          window.dispatchEvent(new CustomEvent("wishlistUpdated"));
        }
      } else {
        const res = await API.delete(`/wishlist/${id}`);
        if (res.data?.success) {
          setIsWishlisted(false);
          setWishlistMessage({ type: "info", text: "Removed from Wishlist" });
          window.dispatchEvent(new CustomEvent("wishlistUpdated"));
        }
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setWishlistMessage({
          type: "error",
          text: "Please login to manage your wishlist",
        });
      } else {
        setWishlistMessage({
          type: "error",
          text: err.response?.data?.message || "Failed to update wishlist",
        });
      }
    } finally {
      setSavingWishlist(false);
      setTimeout(() => setWishlistMessage(null), 3000);
    }
  };

  const handleAddToCart = async () => {
    if (isOutOfStock || isAddingToCart) return;
    try {
      setCartFeedback(null);
      const res = await addToCart(id);
      if (res.success) {
        setCartFeedback({
          type: "success",
          text: inCart ? `Quantity updated in Cart (${currentCartQty + 1})` : "Added to Cart!",
        });
      } else {
        const isAuthError = res.status === 401;
        setCartFeedback({
          type: "error",
          text: isAuthError ? "Please sign in to add items to your bag" : (res.message || "Unable to add product to bag"),
          loginRequired: isAuthError,
        });
      }
    } catch {
      setCartFeedback({
        type: "error",
        text: "Unable to add product to cart",
      });
    } finally {
      setTimeout(() => setCartFeedback(null), 3500);
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-12 h-12 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-slate-600">Loading product details...</p>
      </div>
    );
  }

  // Error / Not Found State
  if (error || !product) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-200">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          {error || "Product Not Found"}
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          The product you are looking for does not exist or the link may be broken.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs"
        >
          <ArrowLeft size={16} />
          <span>Back to Products</span>
        </Link>
      </div>
    );
  }

  const { name, description, price, category, image, stock } = product;

  // Indian Rupee formatting
  const formattedPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);

  const isOutOfStock = stock <= 0;
  const isLowStock = stock > 0 && stock <= 5;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Back to Products Navigation */}
      <div className="mb-6">
        <Link
          to="/products"
          id="back-to-products-link"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors group"
        >
          <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center group-hover:border-indigo-300 group-hover:bg-indigo-50/50 transition-colors">
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          </div>
          <span>Back to Products</span>
        </Link>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-3xl shadow-sm overflow-hidden p-6 sm:p-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">
          <div className="relative rounded-2xl overflow-hidden bg-slate-50 border border-slate-200/60 shadow-inner group">
            <div className="w-full pt-[85%] relative">
              <img
                src={image}
                alt={name}
                id="product-image"
                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://placehold.co/800x600/e2e8f0/64748b?text=ezshop";
                }}
              />
            </div>

            <div className="absolute top-4 left-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-white/95 backdrop-blur-md text-slate-800 border border-slate-200 shadow-sm">
                <Tag size={13} className="text-indigo-600" />
                <span id="product-category">{category}</span>
              </span>
            </div>
          </div>

          <div className="flex flex-col h-full justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-neutral-900 bg-neutral-100 px-3 py-1 rounded-full border border-neutral-200">
                  <Sparkles size={11} className="text-amber-500" /> Official ezshop Catalog
                </span>
              </div>

              <h1
                id="product-name"
                className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4"
              >
                {name}
              </h1>

              <div className="p-4 bg-slate-50 border border-slate-200/70 rounded-2xl mb-6 flex items-baseline gap-3">
                <span className="text-xs uppercase font-bold text-slate-400">Price:</span>
                <span
                  id="product-price"
                  className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight"
                >
                  {formattedPrice}
                </span>
                <span className="text-xs font-medium text-slate-500">(inclusive of all taxes)</span>
              </div>

              <div className="flex items-center gap-3 mb-6">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Availability:
                </span>
                {isOutOfStock ? (
                  <span
                    id="product-stock"
                    className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg bg-rose-50 text-rose-700 border border-rose-200"
                  >
                    <AlertTriangle size={14} /> Out of Stock
                  </span>
                ) : isLowStock ? (
                  <span
                    id="product-stock"
                    className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg bg-amber-50 text-amber-700 border border-amber-200"
                  >
                    <Box size={14} /> Only {stock} units left — Order soon
                  </span>
                ) : (
                  <span
                    id="product-stock"
                    className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200"
                  >
                    <CheckCircle2 size={14} /> In Stock ({stock} units available)
                  </span>
                )}
              </div>

              <div className="mb-8">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Description
                </h3>
                <p
                  id="product-description"
                  className="text-slate-700 text-sm sm:text-base leading-relaxed whitespace-pre-line"
                >
                  {description}
                </p>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100">
              {cartFeedback && (
                <div
                  className={`mb-3 p-3 rounded-xl text-xs font-semibold flex items-center justify-between ${
                    cartFeedback.type === "error"
                      ? "bg-rose-50 text-rose-700 border border-rose-200"
                      : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {cartFeedback.type === "error" ? (
                      <AlertCircle size={15} />
                    ) : (
                      <CheckCircle2 size={15} />
                    )}
                    <span>{cartFeedback.text}</span>
                  </div>
                  {cartFeedback.loginRequired && (
                    <button
                      onClick={() => navigate("/login")}
                      className="underline font-extrabold text-inherit hover:text-black cursor-pointer ml-2"
                    >
                      Sign In →
                    </button>
                  )}
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  id="add-to-cart-btn"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || isAddingToCart}
                  className={`flex-1 inline-flex items-center justify-center gap-2 h-12 px-6 text-xs font-extrabold uppercase tracking-wider rounded-full shadow-xs transition-all duration-200 cursor-pointer ${
                    isOutOfStock
                      ? "bg-neutral-200 text-neutral-400 cursor-not-allowed shadow-none"
                      : isAddingToCart
                      ? "bg-neutral-800 text-white cursor-not-allowed opacity-90"
                      : inCart
                      ? "bg-neutral-100 hover:bg-neutral-200 text-neutral-900 border border-neutral-300"
                      : "text-white bg-black hover:bg-neutral-800 hover:scale-[1.01] active:scale-[0.98]"
                  }`}
                >
                  {isAddingToCart ? (
                    <>
                      <Loader2 size={16} className="animate-spin text-white" />
                      <span>Adding to Bag...</span>
                    </>
                  ) : isOutOfStock ? (
                    <span>Out of Stock</span>
                  ) : inCart ? (
                    <>
                      <ShoppingCart size={16} />
                      <span>Add Another ({currentCartQty})</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={16} />
                      <span>Add to Bag</span>
                    </>
                  )}
                </button>

                <button
                  id="details-wishlist-btn"
                  onClick={handleWishlistToggle}
                  disabled={savingWishlist}
                  className={`inline-flex items-center justify-center gap-2 h-12 px-5 text-xs font-extrabold uppercase tracking-wider rounded-full transition-all duration-200 border cursor-pointer ${
                    savingWishlist
                      ? "bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed"
                      : isWishlisted
                      ? "bg-neutral-900 text-white border-black"
                      : "bg-white hover:bg-neutral-50 text-neutral-900 border-neutral-300"
                  }`}
                >
                  {savingWishlist ? (
                    <>
                      <Loader2 size={15} className="animate-spin text-neutral-600" />
                      <span>Saving</span>
                    </>
                  ) : isWishlisted ? (
                    <>
                      <Heart size={15} className="fill-red-500 text-red-500" />
                      <span>Saved</span>
                    </>
                  ) : (
                    <>
                      <Heart size={15} className="text-neutral-700" />
                      <span>Save</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => navigate("/products")}
                  className="inline-flex items-center justify-center h-12 px-5 text-xs font-extrabold uppercase tracking-wider text-neutral-700 hover:text-black bg-neutral-100 hover:bg-neutral-200 rounded-full transition-colors cursor-pointer"
                >
                  Shop More
                </button>
              </div>

              {wishlistMessage && (
                <div
                  className={`mt-4 px-3.5 py-2 rounded-2xl text-xs font-bold flex items-center justify-between ${
                    wishlistMessage.type === "error"
                      ? "bg-red-50 text-red-700 border border-red-200"
                      : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  }`}
                >
                  <span>{wishlistMessage.text}</span>
                </div>
              )}

              <div className="grid grid-cols-3 gap-3 mt-8 pt-6 border-t border-neutral-100 text-center">
                <div className="flex flex-col items-center gap-1 text-[11px] text-neutral-500 font-semibold">
                  <Truck size={15} className="text-neutral-900" />
                  <span>Free Express Delivery</span>
                </div>
                <div className="flex flex-col items-center gap-1 text-[11px] text-neutral-500 font-semibold">
                  <ShieldCheck size={15} className="text-neutral-900" />
                  <span>100% Genuine Product</span>
                </div>
                <div className="flex flex-col items-center gap-1 text-[11px] text-neutral-500 font-semibold">
                  <RotateCcw size={15} className="text-neutral-900" />
                  <span>7 Days Easy Return</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
