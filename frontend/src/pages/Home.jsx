import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import { useCart } from "../context/CartContext";
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  Package,
  Heart,
  ShoppingBag,
  Copy,
  Check,
  LogOut,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const Home = () => {
  const navigate = useNavigate();
  const { totalCount: cartCount } = useCart();
  const [customer, setCustomer] = useState(null);
  const [orderCount, setOrderCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchCustomerProfile = async () => {
      try {
        setLoading(true);
        const response = await API.get("/customers/me");
        if (isMounted) {
          setCustomer(response.data);
        }

        // Fetch user orders to display real account metric
        try {
          const ordersRes = await API.get("/orders");
          if (isMounted && ordersRes.data?.success) {
            setOrderCount(ordersRes.data.count ?? (ordersRes.data.orders?.length || 0));
          }
        } catch {
          // Non-blocking
        }
      } catch (error) {
        if (isMounted) {
          navigate("/login");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCustomerProfile();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const handleCopyId = () => {
    if (!customer?._id) return;
    navigator.clipboard.writeText(customer._id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleLogout = async () => {
    try {
      await API.post("/customers/logout");
      window.dispatchEvent(new CustomEvent("authChanged"));
    } catch {
      // Empty catch
    } finally {
      navigate("/login");
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-8 h-8 border-3 border-neutral-300 border-t-black rounded-full animate-spin" />
        <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">
          Loading Member Profile...
        </p>
      </div>
    );
  }

  if (!customer) {
    return null;
  }

  const wishlistCount = Array.isArray(customer.wishlist) ? customer.wishlist.length : 0;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-8 border-b border-neutral-200 pb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 text-neutral-800 text-xs font-extrabold uppercase tracking-wider mb-3">
            <Sparkles size={13} className="text-neutral-900" />
            <span>ezshop Member</span>
          </div>

          <h1
            id="welcome-message"
            className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-neutral-900 font-display"
          >
            HELLO, <span>{customer.fullName}</span>.
          </h1>
          <p className="mt-2 text-xs sm:text-sm font-medium text-neutral-600">
            Welcome to your member portal. Track orders, manage favorites, and update account details.
          </p>
        </div>

        <button
          onClick={handleLogout}
          type="button"
          className="inline-flex h-10 items-center gap-2 rounded-full border border-neutral-300 bg-white px-5 text-xs font-extrabold uppercase tracking-wider text-neutral-800 hover:border-black hover:text-black transition-colors cursor-pointer self-start sm:self-auto shadow-2xs"
          title="Sign out of account"
        >
          <LogOut size={14} strokeWidth={2.2} />
          <span>Sign Out</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <Link
          to="/orders"
          className="group flex flex-col justify-between p-6 bg-white rounded-2xl border border-neutral-200 hover:border-black transition-all shadow-2xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-extrabold tracking-wider text-neutral-500">
              Orders
            </span>
            <div className="h-9 w-9 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-900 group-hover:bg-black group-hover:text-white transition-colors">
              <Package size={16} strokeWidth={2.2} />
            </div>
          </div>
          <div className="mt-6 flex items-baseline justify-between">
            <span className="text-3xl font-black text-neutral-900 tabular-nums">
              {orderCount}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-neutral-900 group-hover:translate-x-1 transition-transform">
              View All <ArrowRight size={13} strokeWidth={2.5} />
            </span>
          </div>
        </Link>

        <Link
          to="/wishlist"
          className="group flex flex-col justify-between p-6 bg-white rounded-2xl border border-neutral-200 hover:border-black transition-all shadow-2xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-extrabold tracking-wider text-neutral-500">
              Favorites
            </span>
            <div className="h-9 w-9 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-900 group-hover:bg-red-500 group-hover:text-white transition-colors">
              <Heart size={16} strokeWidth={2.2} />
            </div>
          </div>
          <div className="mt-6 flex items-baseline justify-between">
            <span className="text-3xl font-black text-neutral-900 tabular-nums">
              {wishlistCount}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-neutral-900 group-hover:translate-x-1 transition-transform">
              View Saved <ArrowRight size={13} strokeWidth={2.5} />
            </span>
          </div>
        </Link>

        <Link
          to="/cart"
          className="group flex flex-col justify-between p-6 bg-white rounded-2xl border border-neutral-200 hover:border-black transition-all shadow-2xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-extrabold tracking-wider text-neutral-500">
              Shopping Bag
            </span>
            <div className="h-9 w-9 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-900 group-hover:bg-black group-hover:text-white transition-colors">
              <ShoppingBag size={16} strokeWidth={2.2} />
            </div>
          </div>
          <div className="mt-6 flex items-baseline justify-between">
            <span className="text-3xl font-black text-neutral-900 tabular-nums">
              {cartCount}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-neutral-900 group-hover:translate-x-1 transition-transform">
              Checkout <ArrowRight size={13} strokeWidth={2.5} />
            </span>
          </div>
        </Link>
      </div>

      <div
        id="customer-profile-card"
        className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-2xs mb-8"
      >
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-neutral-200 bg-neutral-50/50">
          <div className="flex items-center gap-2.5">
            <User size={18} strokeWidth={2.2} className="text-neutral-900" />
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-neutral-900">
              Member Account Information
            </h2>
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
            Verified
          </span>
        </div>

        <div className="divide-y divide-neutral-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-6 py-4.5">
            <div>
              <span className="block text-[11px] font-extrabold uppercase tracking-wider text-neutral-400">
                Full Name
              </span>
              <span
                id="customer-name"
                className="text-base font-bold text-neutral-900"
              >
                {customer.fullName}
              </span>
            </div>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold self-start sm:self-auto">
              <ShieldCheck size={14} /> Active Account
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-6 py-4.5">
            <div>
              <span className="block text-[11px] font-extrabold uppercase tracking-wider text-neutral-400">
                Email Address
              </span>
              <span
                id="customer-email"
                className="text-base font-bold text-neutral-900"
              >
                {customer.email}
              </span>
            </div>
            <span className="text-xs font-semibold text-neutral-500">
              Primary Sign-In
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-6 py-4.5">
            <div>
              <span className="block text-[11px] font-extrabold uppercase tracking-wider text-neutral-400">
                Phone Number
              </span>
              <span
                id="customer-phone"
                className="text-base font-bold text-neutral-900"
              >
                {customer.phone}
              </span>
            </div>
            <span className="text-xs font-semibold text-neutral-500">
              Order Notifications
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-6 py-4.5">
            <div>
              <span className="block text-[11px] font-extrabold uppercase tracking-wider text-neutral-400">
                Account ID
              </span>
              <span
                id="customer-id"
                className="font-mono text-xs font-bold text-neutral-700"
              >
                {customer._id}
              </span>
            </div>

            <button
              onClick={handleCopyId}
              type="button"
              className="inline-flex h-8 items-center gap-1.5 rounded-full border border-neutral-300 bg-white px-3.5 text-xs font-bold text-neutral-800 hover:border-black transition-colors cursor-pointer self-start sm:self-auto"
              title="Copy Member ID"
            >
              {copiedId ? (
                <>
                  <Check size={13} className="text-emerald-600" />
                  <span className="text-emerald-700">Copied</span>
                </>
              ) : (
                <>
                  <Copy size={13} />
                  <span>Copy ID</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="p-8 rounded-2xl bg-neutral-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-sm">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-widest text-neutral-400">
            Exclusive Selection
          </span>
          <h3 className="text-2xl font-black uppercase tracking-tight font-display mt-1">
            Browse Over 190+ Official Products
          </h3>
          <p className="mt-1 text-xs text-neutral-400 font-medium">
            Discover new drops in Tech, Fashion, Home, and Books.
          </p>
        </div>

        <Link
          to="/products"
          className="inline-flex h-11 items-center gap-2 rounded-full bg-white text-black px-6 text-xs font-extrabold uppercase tracking-wider hover:bg-neutral-200 transition-colors shrink-0"
        >
          <span>Shop Now</span>
          <ArrowRight size={14} strokeWidth={2.5} />
        </Link>
      </div>
    </div>
  );
};

export default Home;
