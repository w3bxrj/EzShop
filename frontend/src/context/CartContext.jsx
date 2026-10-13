import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import API from "../services/api";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({}); // add/upd/del

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await API.get("/cart");
      if (response.data && response.data.success) {
        setCart(response.data.cart || []);
      } else {
        setCart([]);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setCart([]);
      } else {
        setError("Unable to load your cart. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();

    const handleAuthChanged = () => {
      fetchCart();
    };

    window.addEventListener("authChanged", handleAuthChanged);
    return () => {
      window.removeEventListener("authChanged", handleAuthChanged);
    };
  }, [fetchCart]);

  const addToCart = async (productId) => {
    try {
      setActionLoading((prev) => ({ ...prev, [productId]: "add" }));
      setError(null);

      const response = await API.post(`/cart/${productId}`);
      if (response.data && response.data.success) {
        setCart(response.data.cart || []);
        // Trigger event so any other non-context listener can react
        window.dispatchEvent(new CustomEvent("cartUpdated"));
        return { success: true, message: response.data.message || "Added to cart" };
      }
      return { success: false, message: response.data?.message || "Failed to add to cart" };
    } catch (err) {
      const isAuthError = err.response?.status === 401;
      const message = isAuthError
        ? "Please sign in to add items to your bag"
        : (err.response?.data?.message || "Unable to add product to bag");
      return {
        success: false,
        message,
        status: err.response?.status,
      };
    } finally {
      setActionLoading((prev) => {
        const next = { ...prev };
        delete next[productId];
        return next;
      });
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      setActionLoading((prev) => ({ ...prev, [productId]: "update" }));
      setError(null);

      const response = await API.patch(`/cart/${productId}`, { quantity });
      if (response.data && response.data.success) {
        setCart(response.data.cart || []);
        window.dispatchEvent(new CustomEvent("cartUpdated"));
        return { success: true, message: response.data.message || "Quantity updated" };
      }
      return { success: false, message: response.data?.message || "Failed to update quantity" };
    } catch (err) {
      const message =
        err.response?.data?.message || "Unable to update quantity. Please try again.";
      return {
        success: false,
        message,
        status: err.response?.status,
      };
    } finally {
      setActionLoading((prev) => {
        const next = { ...prev };
        delete next[productId];
        return next;
      });
    }
  };

  const removeFromCart = async (productId) => {
    try {
      setActionLoading((prev) => ({ ...prev, [productId]: "remove" }));
      setError(null);

      const response = await API.delete(`/cart/${productId}`);
      if (response.data && response.data.success) {
        setCart(response.data.cart || []);
        window.dispatchEvent(new CustomEvent("cartUpdated"));
        return { success: true, message: response.data.message || "Item removed" };
      }
      return { success: false, message: response.data?.message || "Failed to remove item" };
    } catch (err) {
      const message =
        err.response?.data?.message || "Unable to remove product from cart.";
      return {
        success: false,
        message,
        status: err.response?.status,
      };
    } finally {
      setActionLoading((prev) => {
        const next = { ...prev };
        delete next[productId];
        return next;
      });
    }
  };

  const clearCart = async () => {
    try {
      setLoading(true);
      const response = await API.delete("/cart");
      if (response.data && response.data.success) {
        setCart([]);
        window.dispatchEvent(new CustomEvent("cartUpdated"));
        return { success: true };
      }
      return { success: false };
    } catch (err) {
      return { success: false, message: err.response?.data?.message };
    } finally {
      setLoading(false);
    }
  };

  const resetCartState = () => {
    setCart([]);
    window.dispatchEvent(new CustomEvent("cartUpdated"));
  };

  const totalCount = useMemo(() => {
    return cart.reduce((acc, item) => acc + (item.quantity || 0), 0);
  }, [cart]);

  // Unique product count in cart
  const uniqueItemCount = useMemo(() => {
    return cart.length;
  }, [cart]);

  // Subtotal 
  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => {
      const price = item.product?.price || 0;
      const qty = item.quantity || 0;
      return acc + price * qty;
    }, 0);
  }, [cart]);

  // validate item

  const isItemInCart = useCallback(
    (productId) => {
      return cart.some((item) => item.product?._id === productId);
    },
    [cart]
  );

  // get current quantity
  const getItemQuantity = useCallback(
    (productId) => {
      const item = cart.find((item) => item.product?._id === productId);
      return item ? item.quantity : 0;
    },
    [cart]
  );

  const value = {
    cart,
    cartItems: cart,
    loading,
    error,
    actionLoading,
    totalCount,
    uniqueItemCount,
    subtotal,
    fetchCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    resetCartState,
    isItemInCart,
    getItemQuantity,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export default CartContext;
