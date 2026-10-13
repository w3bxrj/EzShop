import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import {
  Package,
  ShoppingBag,
  ArrowRight,
  ChevronRight,
  RotateCcw,
  AlertTriangle,
} from "lucide-react";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUnauthorized, setIsUnauthorized] = useState(false);

  // Currency formatter
  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  // Date formatter
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      setIsUnauthorized(false);
      const res = await API.get("/orders");
      if (res.data && res.data.success) {
        setOrders(res.data.orders || []);
      } else {
        setOrders([]);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setIsUnauthorized(true);
      } else {
        setError(
          err.response?.data?.message ||
            "Failed to load your order history. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="w-10 h-10 border-2 border-neutral-200 border-t-black rounded-full animate-spin mb-4"></div>
        <h3 className="text-xs font-extrabold uppercase tracking-wide text-neutral-900">
          Loading your orders...
        </h3>
      </div>
    );
  }

  // Unauthorized State (Prompt Login)
  if (!loading && isUnauthorized) {
    return (
      <div className="max-w-md mx-auto my-16 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-neutral-100 text-neutral-800 flex items-center justify-center mx-auto mb-4 border border-neutral-200">
          <Package size={28} />
        </div>
        <h2 className="text-xl font-black uppercase tracking-tight text-neutral-900 mb-2 font-display">
          MEMBER SIGN-IN REQUIRED
        </h2>
        <p className="text-xs text-neutral-500 mb-6 font-medium">
          Please log in with your ezshop account to view your past purchases and track order receipts.
        </p>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 px-6 py-3 text-xs font-extrabold uppercase tracking-wider text-white bg-black hover:bg-neutral-800 rounded-full transition-colors shadow-xs"
        >
          <span>Sign In to Your Account</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-md mx-auto my-16 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-100">
          <AlertTriangle size={30} />
        </div>
        <h2 className="text-xl font-black uppercase tracking-tight text-neutral-900 mb-2 font-display">
          UNABLE TO LOAD ORDERS
        </h2>
        <p className="text-xs text-neutral-500 mb-6 font-medium">{error}</p>
        <button
          onClick={fetchOrders}
          className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-extrabold uppercase tracking-wider text-white bg-black hover:bg-neutral-800 rounded-full transition-colors shadow-xs"
        >
          <RotateCcw size={14} />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="max-w-md mx-auto my-16 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-neutral-100 text-neutral-800 flex items-center justify-center mx-auto mb-4 border border-neutral-200">
          <Package size={30} />
        </div>
        <h2 className="text-2xl font-black uppercase tracking-tight text-neutral-900 mb-2 font-display">
          NO ORDERS YET
        </h2>
        <p className="text-xs text-neutral-500 mb-6 font-medium">
          You have not placed any orders yet. Discover essentials you love and complete checkout.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-6 py-3 text-xs font-extrabold uppercase tracking-wider text-white bg-black hover:bg-neutral-800 rounded-full transition-colors shadow-xs"
        >
          <ShoppingBag size={14} />
          <span>Start Shopping</span>
          <ArrowRight size={14} strokeWidth={2.5} />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 mb-6 border-b border-neutral-200">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-neutral-900 font-display">
            MY ORDERS
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 font-medium mt-1">
            Track and review your previous ezshop purchases ({orders.length}{" "}
            {orders.length === 1 ? "order" : "orders"}).
          </p>
        </div>
        <Link
          to="/products"
          className="hidden sm:inline-flex items-center gap-2 px-5 py-2 text-xs font-extrabold uppercase tracking-wider text-white bg-black hover:bg-neutral-800 rounded-full transition-colors shadow-xs"
        >
          <span>Shop More</span>
          <ArrowRight size={13} strokeWidth={2.5} />
        </Link>
      </div>

      {/* Orders List */}
      <div className="space-y-5">
        {orders.map((order) => (
          <div
            key={order._id}
            className="bg-white rounded-3xl border border-neutral-200 p-6 shadow-xs hover:border-black transition-all"
          >
            {/* Order Card Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-neutral-100 text-xs">
              <div className="space-y-0.5">
                <span className="font-black text-neutral-400 uppercase tracking-widest text-[10px]">
                  Order ID
                </span>
                <p className="font-mono font-bold text-neutral-900 text-sm">
                  #{order._id}
                </p>
              </div>

              <div className="space-y-0.5">
                <span className="font-black text-neutral-400 uppercase tracking-widest text-[10px]">
                  Placed Date
                </span>
                <p className="text-neutral-700 font-semibold">{formatDate(order.createdAt)}</p>
              </div>

              <div className="space-y-0.5">
                <span className="font-black text-neutral-400 uppercase tracking-widest text-[10px]">
                  Total Amount
                </span>
                <p className="font-black text-neutral-900 text-sm">
                  {formatCurrency(order.totalAmount)}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full font-black uppercase tracking-wider text-[10px] ${
                    order.status === "PLACED" || order.status === "CONFIRMED"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-neutral-900 text-white"
                  }`}
                >
                  {order.status}
                </span>
              </div>
            </div>

            {/* Items summary */}
            <div className="py-4 space-y-3">
              {order.items?.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <img
                      src={
                        item.image ||
                        item.product?.image ||
                        "https://placehold.co/100x100/f6f6f6/999999?text=ezshop"
                      }
                      alt={item.name}
                      className="w-10 h-10 object-contain rounded-xl border border-neutral-200 bg-neutral-50 shrink-0 p-1"
                    />
                    <div className="truncate">
                      <p className="font-bold text-neutral-900 truncate">{item.name}</p>
                      <p className="text-neutral-400 mt-0.5">
                        Qty: {item.quantity} × {formatCurrency(item.price)}
                      </p>
                    </div>
                  </div>
                  <span className="font-black text-neutral-900 shrink-0 text-sm">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Footer action */}
            <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
              <span className="text-xs text-neutral-400">
                Delivering to: <strong className="text-neutral-700">{order.shippingAddress?.fullName}</strong> ({order.shippingAddress?.city})
              </span>
              <Link
                to={`/orders/${order._id}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-white bg-black hover:bg-neutral-800 rounded-full transition-colors shadow-xs"
              >
                <span>View Receipt</span>
                <ChevronRight size={13} strokeWidth={2.5} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
