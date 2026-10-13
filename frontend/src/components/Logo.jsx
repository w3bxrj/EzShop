import React from "react";
import { motion } from "framer-motion";

export const LogoMark = ({ size = 26, className = "" }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="32" height="32" rx="4" fill="#111111" />
      <path
        d="M10 11C10 7.68629 12.6863 5 16 5C19.3137 5 22 7.68629 22 11"
        stroke="#ffffff"
        strokeWidth="2.5"
        strokeLinecap="square"
      />
      <path
        d="M7 11H25L23.2 25H8.8L7 11Z"
        fill="#ffffff"
        stroke="#ffffff"
        strokeWidth="1.5"
      />
      <path
        d="M13 15L19 21M19 15L13 21"
        stroke="#111111"
        strokeWidth="2"
        strokeLinecap="square"
      />
    </svg>
  );
};

const Logo = ({ size = 26, showText = true, className = "" }) => {
  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="shrink-0"
      >
        <LogoMark size={size} />
      </motion.div>

      {showText && (
        <span className="text-[17px] font-black tracking-tight uppercase text-neutral-900 font-display">
          EZ<span className="text-neutral-400">SHOP</span>
        </span>
      )}
    </div>
  );
};

export default Logo;
