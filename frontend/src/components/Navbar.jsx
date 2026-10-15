import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import API from "../services/api";
import {
  ShoppingBag,
  LogOut,
  LogIn,
  UserPlus,
  Home,
  Heart,
  Package,
} from "lucide-react";
import Logo from "./Logo";
import { useCart } from "../context/CartContext";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { totalCount } = useCart();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(null);

  const isProductsActive = location.pathname.startsWith("/products");
  const isHomeActive = location.pathname === "/home";
  const isWishlistActive = location.pathname === "/wishlist";
  const isCartActive = location.pathname === "/cart";

  const checkAuthStatus = useCallback(async () => {
    try {
      const response = await API.get("/customers/me");
      if (response.data && response.data._id) {
        setIsLoggedIn(true);

        try {
          const wlRes = await API.get("/wishlist");
          if (wlRes.data && wlRes.data.success) {
            setWishlistCount(wlRes.data.count ?? (wlRes.data.wishlist?.length || 0));
          }
        } catch {
          setWishlistCount(null);
        }
      } else {
        setIsLoggedIn(false);
        setWishlistCount(null);
      }
    } catch {
      setIsLoggedIn(false);
      setWishlistCount(null);
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();

    const handleWishlistUpdated = () => checkAuthStatus();
    const handleAuthChanged = () => checkAuthStatus();

    window.addEventListener("wishlistUpdated", handleWishlistUpdated);
    window.addEventListener("authChanged", handleAuthChanged);

    return () => {
      window.removeEventListener("wishlistUpdated", handleWishlistUpdated);
      window.removeEventListener("authChanged", handleAuthChanged);
    };
  }, [checkAuthStatus, location.pathname]);

  const handleLogout = async () => {
    try {
      await API.post("/customers/logout");
      setIsLoggedIn(false);
      setWishlistCount(null);
      window.dispatchEvent(new CustomEvent("authChanged"));
    } catch {
      // Empty catch
    } finally {
      navigate("/login");
    }
  };

  const navLinks = [
    { to: "/products", label: "Shop All", active: isProductsActive, id: "nav-products-link" },
    { to: "/home", label: "Member Profile", active: isHomeActive, id: "nav-home-link" },
    ...(isLoggedIn
      ? [{ to: "/orders", label: "My Orders", active: location.pathname === "/orders", id: "nav-orders-link" }]
      : []),
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-neutral-200">
      <div className="bg-neutral-100 border-b border-neutral-200/80 px-4 py-1.5 text-center text-[11px] font-bold tracking-wider uppercase text-neutral-800">
        Free Nationwide Delivery on orders over ₹999 • 100% Genuine Products
      </div>

      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link to="/products" className="flex items-center">
            <Logo size={28} showText={true} />
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                id={link.id}
                className={`relative text-xs uppercase font-extrabold tracking-wider transition-colors py-1 ${link.active
                    ? "text-black border-b-2 border-black"
                    : "text-neutral-500 hover:text-black"
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            to="/wishlist"
            id="nav-wishlist-link"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-bold text-neutral-800 hover:bg-neutral-100 transition-colors"
            title="Wishlist"
          >
            <Heart
              size={18}
              strokeWidth={2}
              className={isWishlistActive || (wishlistCount !== null && wishlistCount > 0) ? "fill-red-500 text-red-500" : "text-neutral-800"}
            />
            <span className="hidden sm:inline">Favorites</span>
            {wishlistCount !== null && wishlistCount > 0 && (
              <span className="text-xs font-bold text-neutral-900 tabular-nums">
                ({wishlistCount})
              </span>
            )}
          </Link>

          <Link
            to="/cart"
            id="nav-cart-link"
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black text-white hover:bg-neutral-800 transition-all text-xs font-bold shadow-xs active:scale-95"
            title="Bag"
          >
            <ShoppingBag size={16} strokeWidth={2.2} />
            <span className="hidden sm:inline">Bag</span>
            <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-white px-1 text-[10px] font-black text-black tabular-nums">
              {totalCount}
            </span>
          </Link>

          <div className="hidden h-5 w-px bg-neutral-200 sm:block" />

          {isLoggedIn ? (
            <button
              id="logout-btn"
              onClick={handleLogout}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-neutral-300 text-xs font-bold text-neutral-700 hover:border-black hover:text-black transition-colors cursor-pointer"
              title="Log out"
            >
              <LogOut size={13} strokeWidth={2} />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                id="nav-login-link"
                className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-neutral-700 hover:text-black transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                id="nav-register-link"
                className="px-3.5 py-1.5 rounded-full border border-black bg-black text-white text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors shadow-xs"
              >
                Join Us
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
