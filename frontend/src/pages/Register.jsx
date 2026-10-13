import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import API from "../services/api";
import {
  User,
  Mail,
  Lock,
  Phone,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Truck,
  Heart,
  Gift,
} from "lucide-react";
import Logo from "../components/Logo";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
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

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = "Name must be at least 2 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\+?[0-9]{7,15}$/.test(formData.phone.trim().replace(/[\s-]/g, ""))) {
      newErrors.phone = "Please enter a valid phone number (7-15 digits)";
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

    if (!validate()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await API.post("/customers/register", {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone.trim(),
      });

      if (response.data.success) {
        navigate("/login", {
          state: {
            message: "Account created successfully! Please log in.",
            registeredEmail: formData.email.trim(),
          },
        });
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Registration failed. Please check your details and try again.";
      setServerError(msg);
      setShakeKey((prev) => prev + 1);
    } finally {
      setIsLoading(false);
    }
  };

  const perks = [
    { icon: Gift, title: "15% Off First Order", desc: "Applied automatically at checkout for verified members" },
    { icon: Truck, title: "Free Standard Shipping", desc: "No minimum spend required on any orders" },
    { icon: Heart, title: "Curated Wishlist Sync", desc: "Save items and get instant restock alerts" },
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
                Join The Collective
              </span>
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                Membership Free Forever
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-neutral-900 leading-[1.08] font-display">
              BECOME AN
              <br />
              EZSHOP MEMBER.
            </h2>
            <p className="mt-4 text-sm text-neutral-500 font-medium leading-relaxed">
              Create your profile to unlock member-only pricing, unlimited free delivery, and personalized recommendations across 190+ premium products.
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
              CREATE YOUR ACCOUNT.
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 font-medium mt-2">
              Sign up today and get full access to the curated ezshop store.
            </p>
          </div>

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
                >
                  <AlertCircle size={16} className="shrink-0 text-red-600" />
                  <span>{serverError}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
            <div>
              <label htmlFor="fullName" className="block text-xs uppercase font-extrabold tracking-wider text-neutral-500 mb-1.5">
                Full Name
              </label>
              <div
                className={`relative flex items-center rounded-2xl border transition-all ${
                  errors.fullName
                    ? "border-red-400 bg-red-50/30"
                    : "border-neutral-200 bg-neutral-50/50 focus-within:border-black focus-within:bg-white focus-within:ring-2 focus-within:ring-black/5"
                }`}
              >
                <User className="absolute left-3.5 text-neutral-400 pointer-events-none" size={17} />
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  className="w-full h-11 pl-10 pr-3.5 bg-transparent text-xs sm:text-sm font-semibold text-neutral-900 outline-none"
                  value={formData.fullName}
                  onChange={handleChange}
                  disabled={isLoading}
                  autoComplete="name"
                  required
                />
              </div>
              {errors.fullName && (
                <p className="text-xs font-bold text-red-600 mt-1">{errors.fullName}</p>
              )}
            </div>

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
              <label htmlFor="password" className="block text-xs uppercase font-extrabold tracking-wider text-neutral-500 mb-1.5">
                Password
              </label>
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
                  autoComplete="new-password"
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

            <div>
              <label htmlFor="phone" className="block text-xs uppercase font-extrabold tracking-wider text-neutral-500 mb-1.5">
                Phone Number
              </label>
              <div
                className={`relative flex items-center rounded-2xl border transition-all ${
                  errors.phone
                    ? "border-red-400 bg-red-50/30"
                    : "border-neutral-200 bg-neutral-50/50 focus-within:border-black focus-within:bg-white focus-within:ring-2 focus-within:ring-black/5"
                }`}
              >
                <Phone className="absolute left-3.5 text-neutral-400 pointer-events-none" size={17} />
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className="w-full h-11 pl-10 pr-3.5 bg-transparent text-xs sm:text-sm font-semibold text-neutral-900 outline-none"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={isLoading}
                  autoComplete="tel"
                  required
                />
              </div>
              {errors.phone && (
                <p className="text-xs font-bold text-red-600 mt-1">{errors.phone}</p>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              id="register-submit-btn"
              disabled={isLoading}
              className="w-full h-12 mt-3 flex items-center justify-center gap-2 text-xs font-extrabold uppercase tracking-wider text-white bg-black hover:bg-neutral-800 rounded-full shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all"
            >
              {isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>Creating Account...</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <span>Join ezshop</span>
                  <ArrowRight size={14} strokeWidth={2.5} />
                </span>
              )}
            </motion.button>
          </form>

          <div className="mt-8 pt-6 border-t border-neutral-100 text-center">
            <p className="text-xs text-neutral-500 font-medium">
              Already have an account?{" "}
              <Link to="/login" className="font-extrabold text-neutral-900 underline hover:text-neutral-600">
                Sign In.
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
