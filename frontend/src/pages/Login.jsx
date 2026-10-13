import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import API from "../services/api";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
  Sparkles,
  ShoppingBag,
  RotateCcw,
  KeyRound,
} from "lucide-react";
import Logo from "../components/Logo";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: location.state?.registeredEmail || "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState(location.state?.message || "");
  const [isLoading, setIsLoading] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
    if (serverError) {
      setServerError("");
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      setShakeKey((prev) => prev + 1);
    }
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    setSuccessMessage("");

    if (!validate()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await API.post("/customers/login", {
        email: formData.email.trim(),
        password: formData.password,
      });

      if (response.data.success) {
        window.dispatchEvent(new CustomEvent("authChanged"));
        navigate("/home");
      } else {
        setServerError(response.data.message || "Invalid Credentials");
        setShakeKey((prev) => prev + 1);
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        (err.response?.status === 401 ? "Invalid Credentials" : "Login failed. Please try again.");
      setServerError(errorMsg);
      setShakeKey((prev) => prev + 1);
    } finally {
      setIsLoading(false);
    }
  };

  const perks = [
    { icon: Zap, title: "Express 1-Click Checkout", desc: "Skip queues with auto-saved delivery preferences" },
    { icon: ShoppingBag, title: "Curated Seasonal Drops", desc: "Exclusive early access to limited edition runs" },
    { icon: RotateCcw, title: "Effortless 30-Day Returns", desc: "Instant pickup & zero-hassle digital returns" },
  ];

  return (
    <div className="flex-1 flex flex-col justify-center items-center py-10 px-4 sm:px-6 lg:px-8 bg-[#fafafa]">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="hidden lg:flex lg:col-span-6 flex-col justify-between p-10 bg-white border border-neutral-200/80 rounded-3xl h-full shadow-xs"
        >
          <div>
            <div className="flex items-center gap-2 mb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                <Sparkles size={11} className="text-amber-300" />
                Member Experience
              </span>
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                ezshop Access
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-neutral-900 leading-[1.08] font-display">
              ONE ACCOUNT.
              <br />
              INFINITE CURATION.
            </h2>
            <p className="mt-4 text-sm text-neutral-500 font-medium leading-relaxed">
              Sign in to unlock unified cart persistence, prioritized logistics, and customized recommendations across 190+ catalog essentials.
            </p>

            <div className="mt-8 space-y-4">
              {perks.map((perk, idx) => {
                const Icon = perk.icon;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + idx * 0.1, duration: 0.4 }}
                    whileHover={{ x: 4 }}
                    className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-neutral-50 border border-neutral-100 hover:border-neutral-200 hover:bg-neutral-100/60 transition-all cursor-default"
                  >
                    <div className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Icon size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold uppercase tracking-wide text-neutral-900">
                        {perk.title}
                      </h4>
                      <p className="text-xs text-neutral-500 font-medium mt-0.5">
                        {perk.desc}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
          
        </motion.div>

        <motion.div
          key={shakeKey}
          initial={{ opacity: 0, y: 18 }}
          animate={{
            opacity: 1,
            y: 0,
            x: shakeKey > 0 ? [-8, 8, -6, 6, -3, 3, 0] : 0,
          }}
          transition={{
            opacity: { duration: 0.4 },
            y: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
            x: { duration: 0.4 },
          }}
          className="w-full lg:col-span-6 bg-white border border-neutral-200 rounded-3xl p-8 sm:p-10 shadow-xs"
        >
          <div className="text-center mb-7">
            <div className="flex justify-center mb-3">
              <Logo size={34} showText={false} />
            </div>

            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-neutral-900 font-display">
              YOUR ACCOUNT FOR EVERYTHING EZSHOP.
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 font-medium mt-2">
              Sign in with your email to access your bag, saved favorites, and order history.
            </p>
            
          </div>

          <AnimatePresence>
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="overflow-hidden"
              >
                <div
                  className="flex items-center gap-2.5 p-3.5 text-xs font-bold text-emerald-900 bg-emerald-50 border border-emerald-200 rounded-2xl"
                  role="alert"
                >
                  <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
                  <span>{successMessage}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {serverError && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="overflow-hidden"
              >
                <div
                  className="flex items-center gap-2.5 p-3.5 text-xs font-bold text-red-900 bg-red-50 border border-red-200 rounded-2xl"
                  role="alert"
                  id="login-error-alert"
                >
                  <AlertCircle size={16} className="shrink-0 text-red-600" />
                  <span>{serverError}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="email" className="block text-xs uppercase font-extrabold tracking-wider text-neutral-500 mb-1.5">
                Email Address
              </label>
              <div
                className={`relative flex items-center rounded-2xl border transition-all ${
                  errors.email
                    ? "border-red-400 bg-red-50/30"
                    : "border-neutral-200 bg-neutral-50/50 focus-within:border-black focus-within:bg-white focus-within:ring-2 focus-within:ring-black/5"
                }`}
              >
                <Mail className="absolute left-3.5 text-neutral-400 pointer-events-none" size={17} />
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="w-full h-11 pl-10 pr-3.5 bg-transparent text-xs sm:text-sm font-semibold text-neutral-900 outline-none"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                  autoComplete="email"
                  required
                />
              </div>
              {errors.email && (
                <p className="text-xs font-bold text-red-600 mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-xs uppercase font-extrabold tracking-wider text-neutral-500">
                  Password
                </label>
              </div>
              <div
                className={`relative flex items-center rounded-2xl border transition-all ${
                  errors.password
                    ? "border-red-400 bg-red-50/30"
                    : "border-neutral-200 bg-neutral-50/50 focus-within:border-black focus-within:bg-white focus-within:ring-2 focus-within:ring-black/5"
                }`}
              >
                <Lock className="absolute left-3.5 text-neutral-400 pointer-events-none" size={17} />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  className="w-full h-11 pl-10 pr-10 bg-transparent text-xs sm:text-sm font-semibold text-neutral-900 outline-none"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3.5 text-neutral-400 hover:text-black cursor-pointer transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs font-bold text-red-600 mt-1">{errors.password}</p>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              id="login-submit-btn"
              disabled={isLoading}
              className="w-full h-12 mt-2 flex items-center justify-center gap-2 text-xs font-extrabold uppercase tracking-wider text-white bg-black hover:bg-neutral-800 rounded-full shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all"
            >
              {isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>Signing In...</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <span>Sign In</span>
                  <ArrowRight size={14} strokeWidth={2.5} />
                </span>
              )}
            </motion.button>
          </form>

          <div className="mt-8 pt-6 border-t border-neutral-100 text-center">
            <p className="text-xs text-neutral-500 font-medium">
              Not a member yet?{" "}
              <Link to="/register" className="font-extrabold text-neutral-900 underline hover:text-neutral-600">
                Join Us.
              </Link>
            </p>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-neutral-500"
      >
        <div className="flex items-center gap-1.5">
          <ShieldCheck size={14} className="text-neutral-800" />
          <span>Secure Encrypted Sessions</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Zap size={14} className="text-neutral-800" />
          <span>Instant 2-Click Checkout</span>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
