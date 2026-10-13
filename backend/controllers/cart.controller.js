import mongoose from "mongoose";
import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";

export const addToCart = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const customer = await Customer.findById(req.user._id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!customer.cart) {
      customer.cart = [];
    }

    const existingItem = customer.cart.find((item) => {
      const pId = item.product?._id ? item.product._id.toString() : item.product?.toString();
      return pId === productId;
    });

    const currentQty = existingItem ? existingItem.quantity : 0;
    const newQty = currentQty + 1;

    if (product.stock <= 0) {
      return res.status(400).json({
        success: false,
        message: "Product is currently out of stock",
      });
    }

    if (newQty > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Cannot add more. Requested quantity exceeds available stock (${product.stock})`,
      });
    }

    if (existingItem) {
      existingItem.quantity = newQty;
    } else {
      customer.cart.push({
        product: productId,
        quantity: 1,
      });
    }

    await customer.save();

    await customer.populate({
      path: "cart.product",
      select: "name description price category image stock",
    });

    const validCart = (customer.cart || []).filter(
      (item) => item && item.product !== null
    );

    return res.status(200).json({
      success: true,
      message: "Cart updated",
      cart: validCart,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getCart = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user._id).populate({
      path: "cart.product",
      select: "name description price category image stock",
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const validCart = (customer.cart || []).filter(
      (item) => item && item.product !== null
    );

    return res.status(200).json({
      success: true,
      count: validCart.length,
      cart: validCart,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateCartQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    if (quantity === undefined || typeof quantity !== "number" || isNaN(quantity)) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a valid number",
      });
    }

    const parsedQty = Math.floor(quantity);

    if (parsedQty < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity cannot be less than 1",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (parsedQty > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Requested quantity (${parsedQty}) exceeds available stock (${product.stock})`,
      });
    }

    const customer = await Customer.findById(req.user._id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const cartItem = customer.cart?.find((item) => {
      const pId = item.product?._id ? item.product._id.toString() : item.product?.toString();
      return pId === productId;
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Product not found in cart",
      });
    }

    cartItem.quantity = parsedQty;
    await customer.save();

    await customer.populate({
      path: "cart.product",
      select: "name description price category image stock",
    });

    const validCart = (customer.cart || []).filter(
      (item) => item && item.product !== null
    );

    return res.status(200).json({
      success: true,
      message: "Cart quantity updated",
      cart: validCart,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const customer = await Customer.findById(req.user._id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const itemIndex = (customer.cart || []).findIndex((item) => {
      const pId = item.product?._id ? item.product._id.toString() : item.product?.toString();
      return pId === productId;
    });

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Product not in cart",
      });
    }

    customer.cart.splice(itemIndex, 1);
    await customer.save();

    await customer.populate({
      path: "cart.product",
      select: "name description price category image stock",
    });

    const validCart = (customer.cart || []).filter(
      (item) => item && item.product !== null
    );

    return res.status(200).json({
      success: true,
      message: "Product removed from cart",
      cart: validCart,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const clearCart = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user._id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    customer.cart = [];
    await customer.save();

    return res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
      cart: [],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
