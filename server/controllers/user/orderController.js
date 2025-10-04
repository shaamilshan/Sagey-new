const jwt = require("jsonwebtoken");
const Cart = require("../../model/cartModel");
const mongoose = require("mongoose");
const Address = require("../../model/addressModel");
const Order = require("../../model/orderModel");
const Products = require("../../model/productModel");
const Payment = require("../../model/paymentModel");
const uuid = require("uuid");
const Coupon = require("../../model/couponModel");
const { generateInvoicePDF } = require("../Common/invoicePDFGenFunctions");
const Counter = require("../../model/counterModel");
const { sendOrderNotification } = require("../../util/mailSender");
const User = require('../../model/userModel');  // Ensure the relative path is correct
const delhiveryService = require('../../services/delhiveryService');
// const managerOrderModel = require("../../model/managerOrderModel");

// // Just the function increment or decrement product count
// const updateProductList = async (id, count) => {
//   const product = await Products.findOne({ _id: id });

//   if (count < 0) {
//     if (product.stockQuantity - count * -1 < 0) {
//       throw Error(`${product.name} doesn\'t have ${count} stock`);
//     }
//   }

//   const updateProduct = await Products.findByIdAndUpdate(
//     id,
//     {
//       $inc: { stockQuantity: count },
//     },
//     { new: true }
//   );

//   if (
//     parseInt(updateProduct.stockQuantity) < 5 &&
//     parseInt(updateProduct.stockQuantity) > 0
//   ) {
//     await Products.findByIdAndUpdate(id, {
//       $set: { status: "low quantity" },
//     });
//   }

//   if (parseInt(updateProduct.stockQuantity) === 0) {
//     await Products.findByIdAndUpdate(id, {
//       $set: { status: "out of stock" },
//     });
//   }

//   if (parseInt(updateProduct.stockQuantity) > 5) {
//     await Products.findByIdAndUpdate(id, {
//       $set: { status: "published" },
//     });
//   }
// };
const updateProductList = async (id, count, attributes = null) => {
  const product = await Products.findById(id);

  if (!product) {
    throw new Error("Product not found");
  }

  // If decrementing, check for attribute quantities
  if (count < 0) {
    // Check that attributes exists and has content
    if (attributes && (attributes instanceof Map || typeof attributes === 'object')) {
      // Convert to Map if it's a plain object
      const attributeMap = attributes instanceof Map ? attributes : new Map(Object.entries(attributes));
      
      for (let [key, value] of attributeMap) {
        const attribute = product.attributes.find(a => a.name === key && a.value === value);
        if (attribute) {
          if (attribute.quantity < Math.abs(count)) {
            throw new Error(`${product.name} doesn't have enough stock for ${key}: ${value}`);
          }
        } else {
          // Don't throw error if attribute not found, just continue
          console.warn(`Attribute ${key}: ${value} not found for ${product.name}`);
        }
      }
    }
    // If no attributes provided, just check main stock quantity
    if (product.stockQuantity < Math.abs(count)) {
      throw new Error(`${product.name} doesn't have enough stock`);
    }
  }

  // Update product stock quantity
  const updateProduct = await Products.findByIdAndUpdate(
    id,
    {
      $inc: { stockQuantity: count },
    },
    { new: true }
  );

  // Handle status updates based on stock quantity
  if (parseInt(updateProduct.stockQuantity) < 5 && parseInt(updateProduct.stockQuantity) > 0) {
    await Products.findByIdAndUpdate(id, {
      $set: { status: "low quantity" },
    });
  }

  if (parseInt(updateProduct.stockQuantity) === 0) {
    await Products.findByIdAndUpdate(id, {
      $set: { status: "out of stock" },
    });
  }

  if (parseInt(updateProduct.stockQuantity) > 5) {
    await Products.findByIdAndUpdate(id, {
      $set: { status: "published" },
    });
  }

  // If decrementing and attributes exist, also update the attribute quantities
  if (count < 0 && attributes && (attributes instanceof Map || typeof attributes === 'object')) {
    const attributeMap = attributes instanceof Map ? attributes : new Map(Object.entries(attributes));
    
    for (let [key, value] of attributeMap) {
      try {
        await Products.findOneAndUpdate(
          { _id: id, "attributes.name": key, "attributes.value": value },
          {
            $inc: { "attributes.$.quantity": count }, // count is negative here
          }
        );
      } catch (error) {
        console.error(`Failed to update attribute ${key}: ${value} for product ${id}:`, error.message);
      }
    }
  }

  return updateProduct;
};



// Creating an order
const createOrder = async (req, res) => {
  try {
    const token = req.cookies.user_token;
    
    if (!token) {
      return res.status(401).json({ error: "Authentication token required" });
    }
    
    const { _id } = jwt.verify(token, process.env.SECRET);

    if (!mongoose.Types.ObjectId.isValid(_id)) {
      throw Error("Invalid user ID!!!");
    }

    const { address, paymentMode, notes } = req.body;

    // Validate required fields
    if (!address || !paymentMode) {
      return res.status(400).json({ error: "Address and payment mode are required" });
    }

    // Validate payment mode
    const validPaymentModes = ["cashOnDelivery", "razorPay"];
    if (!validPaymentModes.includes(paymentMode)) {
      return res.status(400).json({ error: "Invalid payment mode" });
    }

    const addressData = await Address.findOne({ _id: address });
    if (!addressData) {
      return res.status(400).json({ error: "Address not found" });
    }

    const cart = await Cart.findOne({ user: _id }).populate("items.product", {
      name: 1,
      price: 1,
      markup: 1,
      stockQuantity: 1,
    });

    // Check if cart is null or empty
    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({ error: "Cart is empty or not found" });
    }

    // Validate cart items before processing
    for (const item of cart.items) {
      if (!item.product) {
        return res.status(400).json({ error: "Invalid product in cart" });
      }
      if (!item.product.price || item.product.price <= 0) {
        return res.status(400).json({ error: `Invalid price for product: ${item.product.name}` });
      }
      if (item.quantity <= 0) {
        return res.status(400).json({ error: `Invalid quantity for product: ${item.product.name}` });
      }
      if (item.product.stockQuantity < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for product: ${item.product.name}` });
      }
    }

    // Create products array from cart items (needed for shipping calculation)
    const products = cart.items.map((item) => ({
      productId: item.product._id,
      quantity: item.quantity,
      totalPrice: ((item.product.price || 0) + (item.product.markup || 0)) * item.quantity,
      price: item.product.price || 0,
      markup: item.product.markup || 0, // Ensure markup is always a number
      attributes: item.attributes || new Map(), // Ensure attributes is always defined
    }));

    // Calculate shipping charges using Delhivery
    let shippingCharges = 0;
    let delhiveryData = {};
  let codFee = 100; // Initialize COD fee here
    
    console.log('📦 Starting shipping rate calculation...');
    console.log('Payment Mode:', paymentMode);
    console.log('Destination Pincode:', addressData.pinCode);
    
    try {
      // Calculate weight based on products (assuming 0.5kg per item if not specified)
      const totalWeight = products.reduce((weight, item) => {
        return weight + (item.quantity * 0.5); // 0.5kg per item
      }, 0);
      
      console.log('Total Weight:', totalWeight, 'kg');
      
      // Get shipping rates from Delhivery
      const shippingRates = await delhiveryService.calculateShippingRate(
        process.env.PICKUP_PINCODE || '400001',
        addressData.pinCode.toString(),
        totalWeight,
        paymentMode === 'cashOnDelivery'
      );
      
      console.log('💰 Shipping rates received:', JSON.stringify(shippingRates, null, 2));
      
      // Use surface shipping by default
      shippingCharges = shippingRates.surface.rate + shippingRates.surface.fuel_surcharge;
      
      // Prepare Delhivery data for order
      delhiveryData = {
        shippingMethod: 'Surface',
        expectedDeliveryDays: shippingRates.surface.delivery_days,
        actualWeight: totalWeight * 1000, // Convert to grams
        shippingCharges: shippingCharges,
        codCharges: shippingRates.surface.cod_charges,
        fuelSurcharge: shippingRates.surface.fuel_surcharge,
      };
      
      console.log('🚚 Delhivery data prepared:', JSON.stringify(delhiveryData, null, 2));
      
      // Add COD charges to total if COD payment
      if (paymentMode === 'cashOnDelivery') {
      codFee += 100; // Set COD fee to 100
        console.log('💵 Added COD charges:', shippingRates.surface.cod_charges);
      }
    } catch (shippingError) {
      console.error('❌ Shipping rate calculation failed:', shippingError.message);
      // Use fallback shipping charges
      shippingCharges = 50; // Default shipping charge
      delhiveryData = {
        shippingMethod: 'Surface',
        expectedDeliveryDays: '3-5',
        actualWeight: 500, // Default 500 grams
        shippingCharges: shippingCharges,
        codCharges: paymentMode === 'cashOnDelivery' ? 40 : 0,
        fuelSurcharge: 10,
        integrationError: shippingError.message
      };
      
      if (paymentMode === 'cashOnDelivery') {
        codFee += 40; // Default COD charges
      }
      
      console.log('🔄 Using fallback shipping data:', JSON.stringify(delhiveryData, null, 2));
    }

    // Calculate the total sum and quantity
    let sum = 0;
    let totalQuantity = 0;

    // Set COD fee if payment mode is cash on delivery
    if (paymentMode === "cashOnDelivery") {
    codFee = 100;
    }
    
    cart.items.forEach((item) => {
      const itemPrice = (item.product.price || 0) + (item.product.markup || 0);
      sum = sum + itemPrice * item.quantity;
      totalQuantity = totalQuantity + item.quantity;
    });

    // Add shipping charges to total
    let sumWithTax = sum + shippingCharges + codFee; // Add shipping and COD fee to total
    if (cart.discount && cart.type === "percentage") {
      const discountAmount = (sum * cart.discount) / 100;
      sumWithTax -= discountAmount;
    } else if (cart.discount && cart.type === "fixed") {
      sumWithTax -= cart.discount;
    }

    // Ensure final total is not negative
    if (sumWithTax < 0) {
      sumWithTax = 0;
    }

    let orderData = {
      user: _id,
      address: addressData,
      products: products,
      subTotal: sum,
      shipping: shippingCharges, // Add shipping charges
      tax: 0, // No tax
      totalPrice: sumWithTax,
      paymentMode,
      totalQuantity,
      statusHistory: [
        {
          status: "pending",
        },
      ],
      ...(notes ? { notes } : {}),
      ...(cart.coupon ? { coupon: cart.coupon } : {}),
      ...(cart.couponCode ? { couponCode: cart.couponCode } : {}),
      ...(cart.discount ? { discount: cart.discount } : {}),
      ...(cart.type ? { couponType: cart.type } : {}),
      codFee: codFee,
      delhivery: delhiveryData, // Add Delhivery data
    };

    // Update product quantities first
    const updateProductPromises = products.map((item) => {
      return updateProductList(item.productId, -item.quantity, item.attributes);
    });

    await Promise.all(updateProductPromises);

    // Create the order
    const order = await Order.create(orderData);

    if (order) {
      await Cart.findByIdAndDelete(cart._id);
      
      console.log('🚚 Order created successfully, starting Delhivery integration...');
      console.log('Order ID:', order.orderId || order._id);
      console.log('Payment Mode:', paymentMode);
      console.log('Address Data:', JSON.stringify(addressData, null, 2));
      
      // Create Delhivery shipment (non-blocking)
      try {
        const shipmentData = {
          orderId: order.orderId || order._id,
          address: addressData,
          products: products,
          paymentMode: paymentMode,
          totalPrice: sumWithTax,
          totalQuantity: totalQuantity,
          weight: delhiveryData.actualWeight || 500
        };
        
        console.log('🔄 Attempting to create Delhivery shipment...');
        console.log('Shipment Data:', JSON.stringify(shipmentData, null, 2));
        
        const shipmentResult = await delhiveryService.createShipment(shipmentData);
        
        console.log('📦 Delhivery shipment result:', JSON.stringify(shipmentResult, null, 2));
        
        if (shipmentResult.success) {
          // Update order with Delhivery details
          const updateResult = await Order.findByIdAndUpdate(order._id, {
            'delhivery.waybill': shipmentResult.waybill,
            'delhivery.packageId': shipmentResult.package_id,
            'delhivery.shipmentStatus': 'Manifested',
            'delhivery.trackingUrl': `https://track.delhivery.com/track/package/${shipmentResult.waybill}`,
          });
          
          console.log(`✅ Delhivery shipment created for order ${order.orderId}: ${shipmentResult.waybill}`);
          console.log('Order updated with Delhivery data:', updateResult ? 'Success' : 'Failed');
        } else {
          console.error(`❌ Failed to create Delhivery shipment for order ${order.orderId}:`, shipmentResult.error);
          
          // Still update order with error info for debugging
          await Order.findByIdAndUpdate(order._id, {
            'delhivery.integrationError': shipmentResult.error,
            'delhivery.lastAttempt': new Date()
          });
        }
      } catch (shipmentError) {
        console.error('💥 Exception in Delhivery shipment creation:', shipmentError.message);
        console.error('Stack trace:', shipmentError.stack);
        
        // Update order with error info
        await Order.findByIdAndUpdate(order._id, {
          'delhivery.integrationError': shipmentError.message,
          'delhivery.lastAttempt': new Date()
        });
        
        // Don't throw error - order should still succeed even if shipment creation fails
      }
    }

    // Update coupon usage
    if (cart.coupon) {
      await Coupon.findOneAndUpdate(
        { _id: cart.coupon },
        {
          $inc: { used: 1 },
        }
      );
    }

    // Send order notification email (non-blocking)
    try {
      const user = await User.findById(_id).select("email");
      if (user && user.email) {
        await sendOrderNotification(user.email, order);
      }
    } catch (emailError) {
      console.error("Failed to send order notification email:", emailError.message);
      // Don't throw error - order should still succeed even if email fails
    }

    res.status(200).json({ order });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(400).json({ error: error.message });
  }
};


// Get all order details
const getOrders = async (req, res) => {
  try {
    const token = req.cookies.user_token;

    const { _id } = jwt.verify(token, process.env.SECRET);

    if (!mongoose.Types.ObjectId.isValid(_id)) {
      throw Error("Invalid ID!!!");
    }

    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    const orders = await Order.find(
      { user: _id },
      {
        address: 0,
        paymentMode: 0,
        deliveryDate: 0,
        user: 0,
        statusHistory: 0,
        products: { $slice: 1 },
      }
    )
      .skip(skip)
      .limit(limit)
      .populate("products.productId", { name: 1 })
      .sort({ createdAt: -1 });

    const totalAvailableOrders = await Order.countDocuments({ user: _id });

    res.status(200).json({ orders, totalAvailableOrders });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get a single order details
const getOrder = async (req, res) => {
  try {
    const { id } = req.params;
    let find = {};

    if (mongoose.Types.ObjectId.isValid(id)) {
      find._id = id;
    } else {
      find.orderId = id;
    }

    const order = await Order.findOne(find).populate("products.productId", {
      imageURL: 1,
      name: 1,
      description: 1,
    });

    if (!order) {
      throw Error("No Such Order");
    }

    res.status(200).json({ order });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Cancelling order
const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    let find = {};

    if (mongoose.Types.ObjectId.isValid(id)) {
      find._id = id;
    } else {
      find.orderId = id;
    }

    const orderDetails = await Order.findOne(find).populate(
      "products.productId"
    );

    const products = orderDetails.products.map((item) => ({
      productId: item.productId._id,
      quantity: item.quantity,
      attributes: item.attributes || new Map(), // Ensure attributes is defined
    }));

    const updateProductPromises = products.map((item) => {
      return updateProductList(item.productId, item.quantity, item.attributes);
    });

    await Promise.all(updateProductPromises);

    const order = await Order.findOneAndUpdate(
      find,
      {
        $set: {
          status: "cancelled",
        },
        $push: {
          statusHistory: {
            status: "cancelled",
            date: Date.now(),
            reason: reason,
          },
        },
      },
      { new: true }
    );

    if (order.paymentMode !== "cashOnDelivery") {
      const token = req.cookies.user_token;

      const { _id } = jwt.verify(token, process.env.SECRET);

      if (!mongoose.Types.ObjectId.isValid(_id)) {
        throw Error("Invalid ID!!!");
      }
      // Adding the refund to wallet of user.

      await Payment.findOneAndUpdate(
        { order: order._id },
        {
          $set: {
            status: "refunded",
          },
        }
      );
    }

    res.status(200).json({ order });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Requesting for returning an order
const requestReturn = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    let find = {};

    if (mongoose.Types.ObjectId.isValid(id)) {
      find._id = id;
    } else {
      find.orderId = id;
    }

    const order = await Order.findOneAndUpdate(
      find,
      {
        $set: {
          status: "return request",
        },
        $push: {
          statusHistory: {
            status: "return request",
            date: Date.now(),
            reason: reason,
          },
        },
      },
      { new: true }
    );
    res.status(200).json({ order });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Generating pdf invoices
const generateOrderInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    let find = {};

    if (mongoose.Types.ObjectId.isValid(id)) {
      find._id = id;
    } else {
      find.orderId = id;
    }

    const order = await Order.findOne(find).populate("products.productId");

    const pdfBuffer = await generateInvoicePDF(order);

    // Set headers for the response
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=invoice.pdf");

    res.status(200).end(pdfBuffer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const orderCount = async (req, res) => {
  try {
    const token = req.cookies.user_token;

    const { _id } = jwt.verify(token, process.env.SECRET);

    if (!mongoose.Types.ObjectId.isValid(_id)) {
      throw Error("Invalid ID!!!");
    }

    const totalOrders = await Order.countDocuments({ user: _id });
    const pendingOrders = await Order.countDocuments({
      user: _id,
      status: "pending",
    });
    const completedOrders = await Order.countDocuments({
      user: _id,
      status: "delivered",
    });

    res.status(200).json({ totalOrders, pendingOrders, completedOrders });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Buy Now function

const buyNow = async (req, res) => {
  try {
    const { address, paymentMode, notes, quantity } = req.body;

    // User Id
    const token = req.cookies.user_token;
    
    if (!token) {
      return res.status(401).json({ error: "Authentication token required" });
    }

    const { _id } = jwt.verify(token, process.env.SECRET);

    if (!mongoose.Types.ObjectId.isValid(_id)) {
      throw Error("Invalid user ID!!!");
    }
    
    // Validate required fields
    if (!address || !paymentMode || !quantity) {
      return res.status(400).json({ error: "Address, payment mode, and quantity are required" });
    }
    
    if (quantity <= 0) {
      return res.status(400).json({ error: "Quantity must be greater than 0" });
    }
    
    // Product ID
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid product ID" });
    }

    const product = await Products.findOne({ _id: id });
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (quantity > product.stockQuantity) {
      return res.status(400).json({ error: "Insufficient stock quantity" });
    }
    
    if (!product.price || product.price <= 0) {
      return res.status(400).json({ error: "Invalid product price" });
    }

    const price = product.price || 0;
    const markup = product.markup || 0;
    let sum = (price + markup) * quantity;
    let codFee = 0;

    // Set COD fee if payment mode is cash on delivery
    if (paymentMode === "cashOnDelivery") {
      codFee = 200;
    }

    const sumWithTax = sum + codFee;

    // Address validation
    const addressData = await Address.findOne({ _id: address });
    if (!addressData) {
      return res.status(404).json({ error: "Address not found" });
    }
    
    let products = [];

    products.push({
      productId: product._id,
      quantity: quantity,
      totalPrice: sum,
      price: price,
      markup: markup,
      attributes: new Map(), // Provide empty attributes for buyNow
    });

    let orderData = {
      user: _id,
      address: addressData,
      products: products,
      subTotal: sum,
      tax: 0, // No tax
      totalPrice: sumWithTax,
      paymentMode,
      totalQuantity: quantity,
      statusHistory: [
        {
          status: "pending",
        },
      ],
      codFee: codFee,
      ...(notes ? { notes } : {}),
    };

    // Update product stock with empty attributes map for buyNow
    await updateProductList(id, -quantity, new Map());

    const order = await Order.create(orderData);

    res.status(200).json({ order });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrder,
  cancelOrder,
  requestReturn,
  generateOrderInvoice,
  orderCount,
  buyNow,
};