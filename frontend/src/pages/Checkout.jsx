import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import API from "../services/api";
import {
  ShieldCheck,
  Truck,
  CreditCard,
  Lock,
  ArrowLeft,
  AlertTriangle,
  ShoppingBag,
  CheckCircle2,
} from "lucide-react";

// Helper script loader for Razorpay Checkout
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      return resolve(true);
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, totalCount, subtotal, resetCartState } = useCart();

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    addressLine1: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(null);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field-level error when typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
    setServerError(null);
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.fullName.trim()) {
      errors.fullName = "Full name is required";
    }

    const cleanPhone = formData.phone.trim().replace(/\D/g, "");
    if (!formData.phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (cleanPhone.length < 10) {
      errors.phone = "Phone number must contain at least 10 digits";
    }

    if (!formData.addressLine1.trim()) {
      errors.addressLine1 = "Street address is required";
    }

    if (!formData.city.trim()) {
      errors.city = "City is required";
    }

    if (!formData.state.trim()) {
      errors.state = "State is required";
    }

    const cleanPincode = formData.pincode.trim();
    if (!cleanPincode) {
      errors.pincode = "Pincode is required";
    } else if (!/^[0-9]{6}$/.test(cleanPincode)) {
      errors.pincode = "Pincode must contain exactly 6 digits";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleVerifyPayment = async (verificationPayload) => {
    try {
      const response = await API.post("/orders/verify-payment", verificationPayload);
      if (response.data && response.data.success) {
        resetCartState();
        navigate(`/orders/${response.data.order._id}`, {
          state: { orderPlaced: true, order: response.data.order },
        });
      } else {
        setServerError(response.data.message || "Payment verification failed");
      }
    } catch (err) {
      setServerError(
        err.response?.data?.message ||
          "Payment verification failed. Your cart has NOT been cleared."
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setServerError(null);

    if (!validateForm()) {
      return;
    }

    if (!cart || cart.length === 0) {
      setServerError("Your cart is empty. Cannot checkout.");
      return;
    }

    setLoading(true);

    try {
      const orderRes = await API.post("/orders/create-payment-order", {
        shippingAddress: {
          fullName: formData.fullName.trim(),
          phone: formData.phone.trim(),
          addressLine1: formData.addressLine1.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          pincode: formData.pincode.trim(),
        },
      });

      if (!orderRes.data || !orderRes.data.success) {
        setServerError(orderRes.data?.message || "Failed to initiate order");
        setLoading(false);
        return;
      }

      const { shopKartOrderId, razorpayOrderId, amount, currency, key } = orderRes.data;

      const isScriptLoaded = await loadRazorpayScript();

      // Check if real keys are configured and SDK loaded
      const isRealRazorpay =
        isScriptLoaded &&
        window.Razorpay &&
        key &&
        !key.includes("placeholder");

      if (isRealRazorpay) {
        const options = {
          key: key,
          amount: amount,
          currency: currency || "INR",
          name: "ezshop",
          description: `Order #${shopKartOrderId.slice(-6)}`,
          order_id: razorpayOrderId,
          handler: async function (response) {
            await handleVerifyPayment({
              shopKartOrderId: shopKartOrderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
          },
          prefill: {
            name: formData.fullName,
            contact: formData.phone,
          },
          theme: {
            color: "#4f46e5",
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", function () {
          setServerError("Payment was cancelled or failed. Your cart is preserved.");
          setLoading(false);
        });
        rzp.open();
      } else {
        setTimeout(async () => {
          await handleVerifyPayment({
            shopKartOrderId: shopKartOrderId,
            razorpay_order_id: razorpayOrderId,
            razorpay_payment_id: `pay_sim_${Date.now()}`,
            razorpay_signature: "simulated_valid_signature",
          });
        }, 1200);
      }
    } catch (err) {
      setServerError(
        err.response?.data?.message || "Failed to process order. Please try again."
      );
      setLoading(false);
    }
  };

  if (!cart || cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto my-16 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-neutral-100 text-neutral-800 flex items-center justify-center mx-auto mb-4 border border-neutral-200">
          <ShoppingBag size={30} />
        </div>
        <h2 className="text-2xl font-black uppercase tracking-tight text-neutral-900 mb-2 font-display">
          YOUR BAG IS EMPTY
        </h2>
        <p className="text-neutral-500 text-xs mb-6 font-medium">
          You don't have any items to checkout. Explore our catalog and add products to your bag.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-6 py-3 text-xs font-extrabold uppercase tracking-wider text-white bg-black hover:bg-neutral-800 rounded-full transition-colors shadow-xs"
        >
          Explore Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Header breadcrumb */}
      <div className="mb-6">
        <Link
          to="/cart"
          className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-neutral-500 hover:text-black transition-colors mb-3"
        >
          <ArrowLeft size={14} />
          <span>Back to Bag</span>
        </Link>
        <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-neutral-900 font-display">
          CHECKOUT & SHIPPING
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 font-medium mt-1">
          Provide your delivery destination and confirm order details.
        </p>
      </div>

      {/* Global Server Error Alert */}
      {serverError && (
        <div
          id="checkout-error-alert"
          className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-800 text-xs font-bold"
        >
          <AlertTriangle size={18} className="text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-bold">Order processing issue</h4>
            <p className="text-xs text-red-700 mt-0.5 font-medium">{serverError}</p>
          </div>
        </div>
      )}

      {/* 2-Column Layout: Left Shipping Form, Right Order Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Task 2 & 3 Shipping Details Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-2.5 pb-4 mb-6 border-b border-neutral-100">
            <div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center font-black text-xs">
              1
            </div>
            <h2 className="text-sm font-black uppercase tracking-wider text-neutral-900 font-display">
              SHIPPING DESTINATION
            </h2>
          </div>

          <form onSubmit={handlePlaceOrder} id="checkout-form" className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                name="fullName"
                id="shipping-fullname"
                value={formData.fullName}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                  formErrors.fullName
                    ? "border-rose-300 focus:ring-rose-200 bg-rose-50/20"
                    : "border-neutral-200 focus:border-black focus:ring-2 focus:ring-black/5"
                }`}
              />
              {formErrors.fullName && (
                <p className="text-xs text-rose-600 mt-1 font-medium">
                  {formErrors.fullName}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                id="shipping-phone"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                  formErrors.phone
                    ? "border-rose-300 focus:ring-rose-200 bg-rose-50/20"
                    : "border-neutral-200 focus:border-black focus:ring-2 focus:ring-black/5"
                }`}
              />
              {formErrors.phone && (
                <p className="text-xs text-rose-600 mt-1 font-medium">{formErrors.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Address Line *
              </label>
              <input
                type="text"
                name="addressLine1"
                id="shipping-address"
                value={formData.addressLine1}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                  formErrors.addressLine1
                    ? "border-rose-300 focus:ring-rose-200 bg-rose-50/20"
                    : "border-neutral-200 focus:border-black focus:ring-2 focus:ring-black/5"
                }`}
              />
              {formErrors.addressLine1 && (
                <p className="text-xs text-rose-600 mt-1 font-medium">
                  {formErrors.addressLine1}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  id="shipping-city"
                  value={formData.city}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                    formErrors.city
                      ? "border-rose-300 focus:ring-rose-200 bg-rose-50/20"
                      : "border-neutral-200 focus:border-black focus:ring-2 focus:ring-black/5"
                  }`}
                />
                {formErrors.city && (
                  <p className="text-xs text-rose-600 mt-1 font-medium">
                    {formErrors.city}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  State *
                </label>
                <input
                  type="text"
                  name="state"
                  id="shipping-state"
                  value={formData.state}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                    formErrors.state
                      ? "border-rose-300 focus:ring-rose-200 bg-rose-50/20"
                      : "border-neutral-200 focus:border-black focus:ring-2 focus:ring-black/5"
                  }`}
                />
                {formErrors.state && (
                  <p className="text-xs text-rose-600 mt-1 font-medium">
                    {formErrors.state}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Pincode (6 digits) *
              </label>
              <input
                type="text"
                name="pincode"
                id="shipping-pincode"
                maxLength={6}
                value={formData.pincode}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                  formErrors.pincode
                    ? "border-rose-300 focus:ring-rose-200 bg-rose-50/20"
                    : "border-neutral-200 focus:border-black focus:ring-2 focus:ring-black/5"
                }`}
              />
              {formErrors.pincode && (
                <p className="text-xs text-rose-600 mt-1 font-medium">
                  {formErrors.pincode}
                </p>
              )}
            </div>

            <div className="pt-2 text-xs text-slate-500 flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
              <span>Razorpay Test Mode Active: No real money will be charged.</span>
            </div>
          </form>
        </div>

        <div className="lg:col-span-5 sticky top-24">
          <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-7 shadow-xs">
            <h2 className="text-base font-black uppercase tracking-tight text-neutral-900 mb-4 pb-3 border-b border-neutral-100 flex items-center justify-between font-display">
              <span>ORDER SUMMARY</span>
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 bg-neutral-100 text-neutral-800 rounded-full">
                {totalCount} {totalCount === 1 ? "UNIT" : "UNITS"}
              </span>
            </h2>

            <div className="max-h-60 overflow-y-auto space-y-3 pr-1 mb-4 divide-y divide-neutral-100">
              {cart.map((item) => (
                <div
                  key={item.product?._id || item._id}
                  className="pt-3 first:pt-0 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <img
                      src={
                        item.product?.image ||
                        "https://placehold.co/100x100/f6f6f6/999999?text=ezshop"
                      }
                      alt={item.product?.name}
                      className="w-10 h-10 object-contain rounded-xl border border-neutral-200 bg-[#f6f6f6] shrink-0 p-1"
                    />
                    <div className="truncate">
                      <p className="font-bold text-neutral-900 truncate">
                        {item.product?.name}
                      </p>
                      <p className="text-neutral-400 mt-0.5">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-black text-neutral-900 shrink-0">
                    {formatCurrency((item.product?.price || 0) * (item.quantity || 1))}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2.5 pt-3 border-t border-neutral-100 text-xs text-neutral-600">
              <div className="flex justify-between font-medium">
                <span>Items Subtotal:</span>
                <span className="font-bold text-neutral-900">
                  {formatCurrency(subtotal)}
                </span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Shipping & Delivery:</span>
                <span className="font-extrabold text-emerald-600 uppercase tracking-wide">FREE</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Taxes:</span>
                <span className="font-semibold text-neutral-400">Included</span>
              </div>
              <div className="pt-3 border-t border-neutral-100 flex items-baseline justify-between">
                <span className="text-sm font-black uppercase tracking-tight text-neutral-900 font-display">TOTAL:</span>
                <span className="text-2xl font-black text-neutral-900 tracking-tight">
                  {formatCurrency(subtotal)}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={loading}
                id="place-order-btn"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 text-xs font-extrabold uppercase tracking-wider text-white bg-black hover:bg-neutral-800 rounded-full shadow-xs transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Processing Payment...</span>
                  </>
                ) : (
                  <>
                    <CreditCard size={15} />
                    <span>Pay with Razorpay</span>
                  </>
                )}
              </button>
            </div>

            <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
              <Lock size={12} />
              <span>100% Encrypted & Authenticated Transaction</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
