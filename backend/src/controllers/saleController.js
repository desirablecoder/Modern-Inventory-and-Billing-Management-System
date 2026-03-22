const mongoose = require("mongoose");
const { Sale, Purchase, Product, Customer } = require("../models");
const { asyncHandler } = require("../middleware/validation");

/**
 * @desc    Get all sales with filters
 * @route   GET /api/sales
 * @access  Private
 */
const getSales = asyncHandler(async (req, res) => {
  const {
    startDate,
    endDate,
    customerId,
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

  if (customerId) {
    filter.customerId = customerId;
  }

  if (status && ["pending", "completed"].includes(status)) {
    filter.status = status;
  }

  // Calculate pagination
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  // Get sales with pagination and populate references
  const sales = await Sale.find(filter)
    .populate("customerId", "name phone email")
    .populate("products.productId", "name category sku")
    .sort({ date: -1 })
    .limit(limitNum)
    .skip(skip);

  // Get total count for pagination
  const total = await Sale.countDocuments(filter);

  res.json({
    success: true,
    data: {
      sales,
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
 * @desc    Get single sale
 * @route   GET /api/sales/:id
 * @access  Private
 */
const getSale = asyncHandler(async (req, res) => {
  const sale = await Sale.findOne({
    _id: req.params.id,
  })
    .populate("customerId", "name phone email address")
    .populate("products.productId", "name description category sku");

  if (!sale) {
    return res.status(404).json({
      success: false,
      message: "Sale not found",
    });
  }

  res.json({
    success: true,
    data: { sale },
  });
});

/**
 * @desc    Create new sale
 * @route   POST /api/sales
 * @access  Private
 */
const createSale = asyncHandler(async (req, res) => {
  const { customerId, products, paymentMethod, notes } = req.body;

  // Start a session for sale
  //prabhu const session = await mongoose.startSession();

  try {
    //session.startSale();

    let customer;
    if (!customerId) {
      return res.status(400).json({
        success: false,
        message: "Customer ID is required for sales",
      });
    }
    // customer = await Contact.findOne({
    //   _id: customerId,
    //   businessId,
    //   type: "customer",
    //   isActive: true,
    // }).session(session);
    customer = await Customer.findOne({
      _id: customerId,
      isActive: true,
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
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
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`,
        });
      }

      product.stock -= item.quantity; // For sales, we subtract from stock
      //product.stock += item.quantity; // For purchases, we add to stock instead of subtracting

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

    // Create sale data
    const saleData = {
      products: processedProducts,
      totalAmount,
      paymentMethod: paymentMethod || "cash",
      notes,
    };

    saleData.customerId = customerId;
    saleData.customerName = customer.name;
    saleData.paymentMethod === "cash"
      ? (saleData.status = "completed")
      : (saleData.status = "pending");
    // Create sale
    // const sale = await Sale.create([saleData], {
    //   session,
    // });

    const sale = await Sale.create([saleData]);

    // Update customer balance if needed
    if (paymentMethod === "credit") {
      customer.currentBalance += totalAmount;
      //await customer.save({ session });
      await customer.save();
    }

    // Commit the sale
    //await session.commitSale();

    // Populate the created sale
    const populatedSale = await Sale.findById(sale[0]._id)
      .populate("customerId", "name phone email")
      .populate("products.productId", "name category");

    res.status(201).json({
      success: true,
      message: `Sale recorded successfully`,
      data: { saleData: populatedSale },
    });
  } catch (error) {
    // Rollback the sale
    //await session.abortSale();
    throw error;
  } finally {
    //session.endSession();
  }
});

/**
 * @desc    Get sales sales
 * @route   GET /api/sales/sales
 * @access  Private
 */
// const getSales = asyncHandler(async (req, res) => {
//   const { startDate, endDate, customerId, page = 1, limit = 10 } = req.query;
//   const businessId = req.businessId;

//   const filter = { businessId, type: "sale" };

//   if (startDate || endDate) {
//     filter.date = {};
//     if (startDate) filter.date.$gte = new Date(startDate);
//     if (endDate) filter.date.$lte = new Date(endDate);
//   }

//   if (customerId) {
//     filter.customerId = customerId;
//   }

//   const pageNum = parseInt(page);
//   const limitNum = parseInt(limit);
//   const skip = (pageNum - 1) * limitNum;

//   const sales = await Sale.find(filter)
//     .populate("customerId", "name phone email")
//     .sort({ date: -1 })
//     .limit(limitNum)
//     .skip(skip);

//   const total = await Sale.countDocuments(filter);

//   res.json({
//     success: true,
//     data: {
//       sales,
//       pagination: {
//         current: pageNum,
//         pages: Math.ceil(total / limitNum),
//         total,
//         limit: limitNum,
//       },
//     },
//   });
// });

/**
 * @desc    Get purchase transactions
 * @route   GET /api/transactions/purchases
 * @access  Private
 */
// const getPurchases = asyncHandler(async (req, res) => {
//   const { startDate, endDate, vendorId, page = 1, limit = 10 } = req.query;
//   const businessId = req.businessId;

//   const filter = { businessId, type: "purchase" };

//   if (startDate || endDate) {
//     filter.date = {};
//     if (startDate) filter.date.$gte = new Date(startDate);
//     if (endDate) filter.date.$lte = new Date(endDate);
//   }

//   if (vendorId) {
//     filter.vendorId = vendorId;
//   }

//   const pageNum = parseInt(page);
//   const limitNum = parseInt(limit);
//   const skip = (pageNum - 1) * limitNum;

//   const purchases = await Transaction.find(filter)
//     .populate("vendorId", "name phone email")
//     .sort({ date: -1 })
//     .limit(limitNum)
//     .skip(skip);

//   const total = await Transaction.countDocuments(filter);

//   res.json({
//     success: true,
//     data: {
//       purchases,
//       pagination: {
//         current: pageNum,
//         pages: Math.ceil(total / limitNum),
//         total,
//         limit: limitNum,
//       },
//     },
//   });
// });

/**
 * @desc    Update sale status
 * @route   PATCH /api/sales/:id/status
 * @access  Private
 */
const updateSaleStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const sale = await Sale.findOneAndUpdate(
    { _id: id },
    { status },
    { new: true, runValidators: true },
  );

  if (!sale) {
    return res.status(404).json({
      success: false,
      message: "Sale not found",
    });
  }

  res.json({
    success: true,
    message: "Sale status updated successfully",
    data: { sale },
  });
});

/**
 * @desc    Get sale summary/statistics
 * @route   GET /api/sales/summary
 * @access  Private
 */
const getSaleSummary = asyncHandler(async (req, res) => {
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

  const purchaseSummary = await Purchase.aggregate([
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
    sales: {
      totalAmount: 0,
      saleCount: 0,
      averageAmount: 0,
    },
    purchases: {
      totalAmount: 0,
      purchaseCount: 0,
      averageAmount: 0,
    },
    profitLoss: 0,
  };

  salesSummary.forEach((item) => {
    result.sales = {
      totalAmount: item.totalAmount,
      saleCount: item.saleCount,
      averageAmount: item.averageAmount,
    };
  });

  purchaseSummary.forEach((item) => {
    result.purchases = {
      totalAmount: item.totalAmount,
      purchaseCount: item.purchaseCount,
      averageAmount: item.averageAmount,
    };
  });

  // Calculate profit/loss
  result.profitLoss = result.sales.totalAmount - result.purchases.totalAmount;

  res.json({
    success: true,
    data: { salesSummary: result },
  });
});

module.exports = {
  getSales,
  getSale,
  createSale,
  //getSales,
  //getPurchases,
  updateSaleStatus,
  getSaleSummary,
};
