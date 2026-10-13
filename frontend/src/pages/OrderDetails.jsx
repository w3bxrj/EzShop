import React, { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import API from "../services/api";
import {
  CheckCircle2,
  ShoppingBag,
  ArrowRight,
  Clock,
  MapPin,
  CreditCard,
  AlertTriangle,
  Copy,
  Check,
} from "lucide-react";

const OrderDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!order);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const isJustPlaced = location.state?.orderPlaced;

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
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleCopyId = () => {
    if (order?._id) {
      navigator.clipboard.writeText(order._id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await API.get(`/orders/${id}`);
        if (res.data && res.data.success) {
          setOrder(res.data.order);
        } else {
          setError(res.data?.message || "Order not found");
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load order details. Please verify your connection."
        );
      } finally {
        setLoading(false);
      }
    };

    if (!order || order._id !== id) {
      fetchOrder();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="w-10 h-10 border-2 border-neutral-200 border-t-black rounded-full animate-spin mb-4"></div>
        <p className="text-xs font-extrabold uppercase tracking-wide text-neutral-900">
          Loading order summary...
        </p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-lg mx-auto my-16 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-100">
          <AlertTriangle size={30} />
        </div>
        <h2 className="text-xl font-black uppercase tracking-tight text-neutral-900 mb-2 font-display">
          ORDER NOT FOUND
        </h2>
        <p className="text-neutral-500 text-xs mb-6 font-medium">{error || "Unable to display this order."}</p>
        <Link
          to="/orders"
          className="inline-flex items-center gap-2 px-6 py-3 text-xs font-extrabold uppercase tracking-wider text-white bg-black hover:bg-neutral-800 rounded-full transition-colors shadow-xs"
        >
          View My Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 w-full">
      {/* Success Banner if freshly placed */}
      {isJustPlaced && (
        <div className="mb-8 p-6 bg-emerald-50 border border-emerald-200 rounded-3xl flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <CheckCircle2 size={26} />
          </div>
          <div className="flex-1">
            <h1 className="text-lg sm:text-xl font-black text-emerald-950 uppercase tracking-tight font-display">
              ORDER PLACED SUCCESSFULLY
            </h1>
            <p className="text-xs text-emerald-800 mt-0.5 font-medium">
              Your payment has been verified and your order is confirmed. A delivery partner will be dispatched shortly.
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              to="/orders"
              className="px-4 py-2 text-xs font-extrabold uppercase tracking-wider bg-white text-emerald-950 hover:bg-emerald-100 rounded-full border border-emerald-300 transition-colors shadow-xs"
            >
              All Orders
            </Link>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-neutral-100">
          <div>
            <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block mb-1">
              EZSHOP ORDER CONFIRMATION
            </span>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight font-mono">
                #{order._id}
              </h2>
              <button
                type="button"
                onClick={handleCopyId}
                className="p-1 text-neutral-400 hover:text-black transition-colors cursor-pointer"
                title="Copy Order ID"
              >
                {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              </button>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-medium mt-1">
              <Clock size={13} />
              <span>Placed on {formatDate(order.createdAt)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${
                order.paymentStatus === "PAID"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-amber-50 text-amber-800 border border-amber-200"
              }`}
            >
              PAYMENT: {order.paymentStatus}
            </span>
            <span className="px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase bg-neutral-900 text-white">
              STATUS: {order.status}
            </span>
          </div>
        </div>

        <div className="py-6 border-b border-neutral-100">
          <h3 className="text-[11px] font-black text-neutral-400 uppercase tracking-widest mb-4">
            PURCHASED ITEMS ({order.items?.length || 0})
          </h3>
          <div className="space-y-3">
            {order.items?.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3.5 bg-neutral-50 rounded-2xl border border-neutral-100 text-xs"
              >
                <div className="flex items-center gap-3.5 min-w-0 pr-3">
                  <div className="w-12 h-12 rounded-xl bg-white border border-neutral-200 p-1 flex items-center justify-center shrink-0">
                    <img
                      src={
                        item.image ||
                        item.product?.image ||
                        "https://placehold.co/100x100/f6f6f6/999999?text=ezshop"
                      }
                      alt={item.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="truncate">
                    <h4 className="font-bold text-neutral-900 truncate">{item.name}</h4>
                    <p className="text-neutral-500 mt-0.5">
                      {formatCurrency(item.price)} × {item.quantity} units
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-black text-neutral-900 text-sm">
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6 border-b border-neutral-100 text-xs">
          <div>
            <h4 className="text-[11px] font-black text-neutral-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <MapPin size={13} className="text-neutral-900" />
              <span>DELIVERY ADDRESS</span>
            </h4>
            <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-100 text-neutral-600 space-y-1">
              <p className="font-extrabold text-neutral-900 text-sm">
                {order.shippingAddress?.fullName}
              </p>
              <p>{order.shippingAddress?.addressLine1}</p>
              <p>
                {order.shippingAddress?.city}, {order.shippingAddress?.state} -{" "}
                {order.shippingAddress?.pincode}
              </p>
              <p className="pt-1 text-neutral-400 font-medium">
                Phone: {order.shippingAddress?.phone}
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-[11px] font-black text-neutral-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <CreditCard size={13} className="text-neutral-900" />
              <span>PAYMENT DETAILS</span>
            </h4>
            <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-100 text-neutral-600 space-y-1.5">
              <div className="flex justify-between items-baseline">
                <span className="text-neutral-500 font-medium">Total Paid:</span>
                <span className="font-black text-neutral-900 text-base">
                  {formatCurrency(order.totalAmount)}
                </span>
              </div>
              {order.razorpayPaymentId && (
                <div className="flex justify-between">
                  <span className="text-neutral-500 font-medium">Payment ID:</span>
                  <span className="font-mono text-neutral-700 text-[11px]">
                    {order.razorpayPaymentId}
                  </span>
                </div>
              )}
              {order.razorpayOrderId && (
                <div className="flex justify-between">
                  <span className="text-neutral-500 font-medium">Razorpay Order:</span>
                  <span className="font-mono text-neutral-700 text-[11px]">
                    {order.razorpayOrderId}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-wrap items-center justify-between gap-4">
          <Link
            to="/orders"
            className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-neutral-500 hover:text-black transition-colors"
          >
            <span>← View All Orders</span>
          </Link>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-3 text-xs font-extrabold uppercase tracking-wider text-white bg-black hover:bg-neutral-800 rounded-full transition-all shadow-xs"
          >
            <ShoppingBag size={14} />
            <span>Continue Shopping</span>
            <ArrowRight size={14} strokeWidth={2.5} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
