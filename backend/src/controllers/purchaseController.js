const mongoose = require("mongoose");
const { Sale, Purchase, Product, Vendor } = require("../models");
const { asyncHandler } = require("../middleware/validation");

/**
 * @desc    Get all purchases with filters
 * @route   GET /api/purchases
 * @access  Private
 */
const getPurchases = asyncHandler(async (req, res) => {
  const {
    startDate,
    endDate,
    vendorId,
    status,
    page = 1,
    limit = 10,
  } = req.query;

  // Build filter object
  const filter = {};

  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  if (vendorId) {
    filter.vendorId = vendorId;
  }

  if (status && ["pending", "completed"].includes(status)) {
    filter.status = status;
  }

  // Calculate pagination
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  // Get purchases with pagination and populate references
  const purchases = await Purchase.find(filter)
    .populate("vendorId", "name phone email")
    .populate("products.productId", "name category sku")
    .sort({ date: -1 })
    .limit(limitNum)
    .skip(skip);

  // Get total count for pagination
  const total = await Purchase.countDocuments(filter);

  res.json({
    success: true,
    data: {
      purchases,
      pagination: {
        current: pageNum,
        pages: Math.ceil(total / limitNum),
        total,
        limit: limitNum,
      },
    },
  });
});

/**
 * @desc    Get single purchase
 * @route   GET /api/purchases/:id
 * @access  Private
 */
const getPurchase = asyncHandler(async (req, res) => {
  const purchase = await Purchase.findOne({
    _id: req.params.id,
  })
    .populate("vendorId", "name phone email address")
    .populate("products.productId", "name description category sku");

  if (!purchase) {
    return res.status(404).json({
      success: false,
      message: "Purchase not found",
    });
  }

  res.json({
    success: true,
    data: { purchase },
  });
});

/**
 * @desc    Create new purchase
 * @route   POST /api/purchases
 * @access  Private
 */
const createPurchase = asyncHandler(async (req, res) => {
  const { vendorId, products, paymentMethod, notes } = req.body;

  // Start a session for sale
  //prabhu const session = await mongoose.startSession();

  try {
    //session.startSale();

    let vendor;
    if (!vendorId) {
      return res.status(400).json({
        success: false,
        message: "Vendor ID is required for purchases",
      });
    }
    // vendor = await Contact.findOne({
    //   _id: vendorId,
    //   businessId,
    //   type: "vendor",
    //   isActive: true,
    // }).session(session);
    vendor = await Vendor.findOne({
      _id: vendorId,
      isActive: true,
    });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    // Validate and process products
    const processedProducts = [];
    let totalAmount = 0;

    // for (const item of products) {
    //   const product = await Product.findOne({
    //     _id: item.productId,
    //     businessId,
    //     isActive: true,
    //   }).session(session);

    for (const item of products) {
      const product = await Product.findOne({
        _id: item.productId,
        isActive: true,
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product with ID ${item.productId} not found`,
        });
      }

      // For sales, check if enough stock is available
      // if (product.stock < item.quantity) {
      //   return res.status(400).json({
      //     success: false,
      //     message: `Insufficient stock for product ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`,
      //   });
      // }

      //product.stock -= item.quantity; // For sales, we subtract from stock
      product.stock += item.quantity; // For purchases, we add to stock instead of subtracting

      //prabhu await product.save({ session });
      await product.save();
      // Calculate item total
      const itemTotal = item.quantity * item.price;
      totalAmount += itemTotal;

      processedProducts.push({
        productId: product._id,
        productName: product.name,
        quantity: item.quantity,
        price: item.price,
        total: itemTotal,
      });
    }

    // Create purchase data
    const purchaseData = {
      products: processedProducts,
      totalAmount,
      paymentMethod: paymentMethod || "cash",
      notes,
    };

    purchaseData.vendorId = vendorId;
    purchaseData.vendorName = vendor.name;

    purchaseData.paymentMethod === "cash"
      ? (purchaseData.status = "completed")
      : (purchaseData.status = "pending");

    // Create purchase
    // const purchase = await Purchase.create([saleData], {
    //   session,
    // });

    const purchase = await Purchase.create([purchaseData]);

    // Update vendor balance if needed
    if (paymentMethod === "credit") {
      vendor.currentBalance += totalAmount;
      //await vendor.save({ session });
      await vendor.save();
    }

    // Commit the purchase
    //await session.commitPurchase();

    // Populate the created purchase
    const populatedPurchase = await Purchase.findById(purchase[0]._id)
      .populate("vendorId", "name phone email")
      .populate("products.productId", "name category");

    res.status(201).json({
      success: true,
      message: `Purchase recorded successfully`,
      data: { purchaseData: populatedPurchase },
    });
  } catch (error) {
    // Rollback the purchase
    //await session.abortPurchase();
    throw error;
  } finally {
    //session.endSession();
  }
});

/**
 * @desc    Update purchase status
 * @route   PATCH /api/purchases/:id/status
 * @access  Private
 */
const updatePurchaseStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const purchase = await Purchase.findOneAndUpdate(
    { _id: id },
    { status },
    { new: true, runValidators: true },
  );

  if (!purchase) {
    return res.status(404).json({
      success: false,
      message: "Purchase not found",
    });
  }

  res.json({
    success: true,
    message: "Purchase status updated successfully",
    data: { purchase },
  });
});

/**
 * @desc    Get purchase summary/statistics
 * @route   GET /api/purchases/summary
 * @access  Private
 */
const getPurchaseSummary = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const matchStage = {};

  if (startDate || endDate) {
    matchStage.date = {};
    if (startDate) matchStage.date.$gte = new Date(startDate);
    if (endDate) matchStage.date.$lte = new Date(endDate);
  }

  const salesSummary = await Sale.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: "$totalAmount" },
        saleCount: { $sum: 1 },
        averageAmount: { $avg: "$totalAmount" },
      },
    },
  ]);

  const purchasesSummary = await Purchase.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: "$totalAmount" },
        purchaseCount: { $sum: 1 },
        averageAmount: { $avg: "$totalAmount" },
      },
    },
  ]);

  // Format the summary
  const result = {
    purchases: {
      totalAmount: 0,
      purchaseCount: 0,
      averageAmount: 0,
    },
    sales: {
      totalAmount: 0,
      saleCount: 0,
      averageAmount: 0,
    },
    profitLoss: 0,
  };

  purchasesSummary.forEach((item) => {
    result.purchases = {
      totalAmount: item.totalAmount,
      purchaseCount: item.purchaseCount,
      averageAmount: item.averageAmount,
    };
  });

  salesSummary.forEach((item) => {
    result.sales = {
      totalAmount: item.totalAmount,
      saleCount: item.saleCount,
      averageAmount: item.averageAmount,
    };
  });

  // Calculate profit/loss
  result.profitLoss = result.purchases.totalAmount - result.sales.totalAmount;

  res.json({
    success: true,
    data: { purchasesSummary: result },
  });
});

module.exports = {
  getPurchases,
  getPurchase,
  createPurchase,
  //getSales,
  //getPurchases,
  updatePurchaseStatus,
  getPurchaseSummary,
};
