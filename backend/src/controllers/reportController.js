const { Product, Customer, Vendor, Sale, Purchase } = require("../models");
const { asyncHandler } = require("../middleware/validation");

/**
 * @desc    Get inventory report
 * @route   GET /api/reports/inventory
 * @access  Private
 */
const getInventoryReport = asyncHandler(async (req, res) => {
  const { category, lowStock, sortBy = "name", sortOrder = "asc" } = req.query;

  // Build filter
  const filter = { isActive: true };
  if (category) {
    filter.category = { $regex: category, $options: "i" };
  }

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === "desc" ? -1 : 1;

  let products = await Product.find(filter).sort(sort);

  // Filter for low stock if requested
  if (lowStock === "true") {
    products = products.filter(
      (product) => product.stock <= product.minStockLevel,
    );
  }

  // Calculate inventory statistics
  const totalProducts = products.length;
  const totalValue = products.reduce(
    (sum, product) => sum + product.stock * product.price,
    0,
  );
  const lowStockProducts = products.filter(
    (product) => product.stock <= product.minStockLevel,
  );
  const outOfStockProducts = products.filter((product) => product.stock === 0);

  // Category breakdown
  const categoryBreakdown = products.reduce((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = {
        count: 0,
        totalStock: 0,
        totalValue: 0,
      };
    }
    acc[product.category].count++;
    acc[product.category].totalStock += product.stock;
    acc[product.category].totalValue += product.stock * product.price;
    return acc;
  }, {});

  res.json({
    success: true,
    data: {
      products,
      statistics: {
        totalProducts,
        totalValue,
        lowStockCount: lowStockProducts.length,
        outOfStockCount: outOfStockProducts.length,
        categories: Object.keys(categoryBreakdown).length,
      },
      lowStockProducts,
      outOfStockProducts,
      categoryBreakdown,
    },
  });
});

/**
 * @desc    Get transaction report
 * @route   GET /api/reports/transactions
 * @access  Private
 */
// const getTransactionReport = asyncHandler(async (req, res) => {
//   const { startDate, endDate, type, groupBy = "day", contactId } = req.query;

//   // Build filter
//   const filter = {};

//   if (startDate || endDate) {
//     filter.date = {};
//     if (startDate) filter.date.$gte = new Date(startDate);
//     if (endDate) filter.date.$lte = new Date(endDate);
//   }

//   if (type && ["sale", "purchase"].includes(type)) {
//     filter.type = type;
//   }

//   if (contactId) {
//     filter.$or = [{ customerId: contactId }, { vendorId: contactId }];
//   }

//   // Get transactions
//   const transactions = await Sale.find(filter)
//     .populate("customerId", "name")
//     .populate("vendorId", "name")
//     .sort({ date: -1 });

//   // Group transactions by period
//   const groupedData = [];
//   const groupFormat = getGroupFormat(groupBy);

//   const grouped = transactions.reduce((acc, transaction) => {
//     const key = formatDateForGrouping(transaction.date, groupBy);
//     if (!acc[key]) {
//       acc[key] = {
//         period: key,
//         sales: { count: 0, amount: 0 },
//         purchases: { count: 0, amount: 0 },
//         transactions: [],
//       };
//     }

//     if (transaction.type === "sale") {
//       acc[key].sales.count++;
//       acc[key].sales.amount += transaction.totalAmount;
//     } else {
//       acc[key].purchases.count++;
//       acc[key].purchases.amount += transaction.totalAmount;
//     }

//     acc[key].transactions.push(transaction);
//     return acc;
//   }, {});

//   // Convert to array and sort
//   const groupedArray = Object.values(grouped).sort(
//     (a, b) => new Date(a.period) - new Date(b.period),
//   );

//   // Calculate summary statistics
//   const totalSales = transactions
//     .filter((t) => t.type === "sale")
//     .reduce((sum, t) => sum + t.totalAmount, 0);

//   const totalPurchases = transactions
//     .filter((t) => t.type === "purchase")
//     .reduce((sum, t) => sum + t.totalAmount, 0);

//   const salesCount = transactions.filter((t) => t.type === "sale").length;
//   const purchasesCount = transactions.filter(
//     (t) => t.type === "purchase",
//   ).length;

//   res.json({
//     success: true,
//     data: {
//       transactions,
//       groupedData: groupedArray,
//       summary: {
//         totalSales,
//         totalPurchases,
//         profit: totalSales - totalPurchases,
//         salesCount,
//         purchasesCount,
//         totalTransactions: transactions.length,
//         averageSaleAmount: salesCount > 0 ? totalSales / salesCount : 0,
//         averagePurchaseAmount:
//           purchasesCount > 0 ? totalPurchases / purchasesCount : 0,
//       },
//     },
//   });
// });

const getTransactionReport = asyncHandler(async (req, res) => {
  const { startDate, endDate, groupBy = "day", contactId } = req.query;

  // Build filter
  const saleFilter = {};

  if (startDate || endDate) {
    saleFilter.date = {};
    if (startDate) saleFilter.date.$gte = new Date(startDate);
    if (endDate) saleFilter.date.$lte = new Date(endDate);
  }

  if (contactId) {
    saleFilter.$or = [{ customerId: contactId }];
  }

  const purchaseFilter = {};

  if (startDate || endDate) {
    purchaseFilter.date = {};
    if (startDate) purchaseFilter.date.$gte = new Date(startDate);
    if (endDate) purchaseFilter.date.$lte = new Date(endDate);
  }

  if (contactId) {
    purchaseFilter.$or = [{ vendorId: contactId }];
  }
  // Get transactions
  const saleTransactions = await Sale.find(purchaseFilter)
    .populate("customerId", "name")
    .sort({ date: -1 });

  const purchaseTransactions = await Purchase.find(purchaseFilter)
    .populate("vendorId", "name")
    .sort({ date: -1 });

  // Group transactions by period
  const saleGroupedData = [];
  const saleGroupFormat = getGroupFormat(groupBy);

  const purchaseGroupedData = [];
  const purchaseGroupFormat = getGroupFormat(groupBy);

  const saleGrouped = saleTransactions.reduce((sAcc, sTransaction) => {
    const key = formatDateForGrouping(sTransaction.date, groupBy);
    if (!sAcc[key]) {
      sAcc[key] = {
        period: key,
        sales: { count: 0, amount: 0 },
        purchases: { count: 0, amount: 0 },
        transactions: [],
      };
    }
    sAcc[key].sales.count++;
    sAcc[key].sales.amount += sTransaction.totalAmount;
    sAcc[key].transactions.push(sTransaction);

    return sAcc;
  }, {});

  const purchaseGrouped = purchaseTransactions.reduce((pAcc, pTransaction) => {
    const key = formatDateForGrouping(pTransaction.date, groupBy);
    if (!pAcc[key]) {
      pAcc[key] = {
        period: key,
        sales: { count: 0, amount: 0 },
        purchases: { count: 0, amount: 0 },
        transactions: [],
      };
    }
    pAcc[key].purchases.count++;
    pAcc[key].purchases.amount += pTransaction.totalAmount;
    pAcc[key].transactions.push(pTransaction);

    return pAcc;
  }, {});

  // Convert to array and sort
  const saleGroupedArray = Object.values(saleGrouped).sort(
    (a, b) => new Date(a.period) - new Date(b.period),
  );
  const purchaseGroupedArray = Object.values(purchaseGrouped).sort(
    (a, b) => new Date(a.period) - new Date(b.period),
  );

  // Calculate summary statistics
  const totalSales = saleTransactions.reduce(
    (sum, t) => sum + t.totalAmount,
    0,
  );

  const totalPurchases = purchaseTransactions.reduce(
    (sum, t) => sum + t.totalAmount,
    0,
  );

  const salesCount = saleTransactions.length;
  const purchasesCount = purchaseTransactions.length;

  res.json({
    success: true,
    data: {
      saleTransactions,
      purchaseTransactions,
      saleGroupedData: saleGroupedArray,
      purchaseGroupedData: purchaseGroupedArray,
      summary: {
        totalSales,
        totalPurchases,
        profit: totalSales - totalPurchases,
        salesCount,
        purchasesCount,
        totalTransactions: salesCount + purchasesCount,
        averageSaleAmount: salesCount > 0 ? totalSales / salesCount : 0,
        averagePurchaseAmount:
          purchasesCount > 0 ? totalPurchases / purchasesCount : 0,
      },
    },
  });
});

/**
 * @desc    Get customer report
 * @route   GET /api/reports/customer/:id
 * @access  Private
 */
const getCustomerReport = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { startDate, endDate } = req.query;

  // Get customer
  const customer = await Customer.findOne({
    _id: id,
    isActive: true,
  });

  if (!customer) {
    return res.status(404).json({
      success: false,
      message: "Customer not found",
    });
  }

  // Build transaction filter
  const filter = {
    customerId: id,
  };

  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  // Get customer transactions
  const transactions = await Sale.find(filter)
    .populate("products.productId", "name category")
    .sort({ date: -1 });

  // Calculate statistics
  const totalPurchases = transactions.reduce(
    (sum, t) => sum + t.totalAmount,
    0,
  );
  const totalTransactions = transactions.length;
  const averagePurchaseAmount =
    totalTransactions > 0 ? totalPurchases / totalTransactions : 0;

  // Product preferences (most purchased products)
  const productStats = {};
  transactions.forEach((transaction) => {
    transaction.products.forEach((item) => {
      const productId = item.productId._id.toString();
      if (!productStats[productId]) {
        productStats[productId] = {
          product: item.productId,
          totalQuantity: 0,
          totalAmount: 0,
          transactionCount: 0,
        };
      }
      productStats[productId].totalQuantity += item.quantity;
      productStats[productId].totalAmount += item.total;
      productStats[productId].transactionCount++;
    });
  });

  const topProducts = Object.values(productStats)
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .slice(0, 10);

  // Monthly breakdown
  const monthlyData = transactions.reduce((acc, transaction) => {
    const month = transaction.date.toISOString().substring(0, 7); // YYYY-MM
    if (!acc[month]) {
      acc[month] = { month, count: 0, amount: 0 };
    }
    acc[month].count++;
    acc[month].amount += transaction.totalAmount;
    return acc;
  }, {});

  res.json({
    success: true,
    data: {
      customer,
      transactions,
      statistics: {
        totalPurchases,
        totalTransactions,
        averagePurchaseAmount,
        currentBalance: customer.currentBalance,
        creditLimit: customer.creditLimit,
      },
      topProducts,
      monthlyBreakdown: Object.values(monthlyData).sort((a, b) =>
        a.month.localeCompare(b.month),
      ),
    },
  });
});

/**
 * @desc    Get vendor report
 * @route   GET /api/reports/vendor/:id
 * @access  Private
 */
const getVendorReport = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { startDate, endDate } = req.query;

  // Get vendor
  const vendor = await Vendor.findOne({
    _id: id,
    isActive: true,
  });

  if (!vendor) {
    return res.status(404).json({
      success: false,
      message: "Vendor not found",
    });
  }

  // Build transaction filter
  const filter = {
    vendorId: id,
  };

  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  // Get vendor transactions
  const transactions = await Purchase.find(filter)
    .populate("products.productId", "name category")
    .sort({ date: -1 });

  // Calculate statistics
  const totalPurchases = transactions.reduce(
    (sum, t) => sum + t.totalAmount,
    0,
  );
  const totalTransactions = transactions.length;
  const averagePurchaseAmount =
    totalTransactions > 0 ? totalPurchases / totalTransactions : 0;

  // Product analysis
  const productStats = {};
  transactions.forEach((transaction) => {
    transaction.products.forEach((item) => {
      const productId = item.productId._id.toString();
      if (!productStats[productId]) {
        productStats[productId] = {
          product: item.productId,
          totalQuantity: 0,
          totalAmount: 0,
          transactionCount: 0,
        };
      }
      productStats[productId].totalQuantity += item.quantity;
      productStats[productId].totalAmount += item.total;
      productStats[productId].transactionCount++;
    });
  });

  const topProducts = Object.values(productStats)
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .slice(0, 10);

  res.json({
    success: true,
    data: {
      vendor,
      transactions,
      statistics: {
        totalPurchases,
        totalTransactions,
        averagePurchaseAmount,
        currentBalance: vendor.currentBalance,
      },
      topProducts,
    },
  });
});

/**
 * @desc    Get business dashboard summary
 * @route   GET /api/reports/dashboard
 * @access  Private
 */
const getDashboardSummary = asyncHandler(async (req, res) => {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const startOfYear = new Date(today.getFullYear(), 0, 1);

  // Get counts
  const [
    totalProducts,
    totalCustomers,
    totalVendors,
    lowStockProducts,
    monthlySaleTransactions,
    yearlySaleTransactions,
    monthlyPurchaseTransactions,
    yearlyPurchaseTransactions,
  ] = await Promise.all([
    Product.countDocuments({ isActive: true }),
    Customer.countDocuments({ isActive: true }),
    Vendor.countDocuments({ isActive: true }),
    Product.findLowStock(),
    Sale.find({ date: { $gte: startOfMonth } }),
    Sale.find({ date: { $gte: startOfYear } }),
    Purchase.find({ date: { $gte: startOfMonth } }),
    Purchase.find({ date: { $gte: startOfYear } }),
  ]);

  // Calculate monthly statistics
  const monthlySales = monthlySaleTransactions.reduce(
    (sum, t) => sum + t.totalAmount,
    0,
  );

  const monthlyPurchases = monthlyPurchaseTransactions.reduce(
    (sum, t) => sum + t.totalAmount,
    0,
  );

  // Calculate yearly statistics
  const yearlySales = yearlySaleTransactions.reduce(
    (sum, t) => sum + t.totalAmount,
    0,
  );

  const yearlyPurchases = yearlyPurchaseTransactions.reduce(
    (sum, t) => sum + t.totalAmount,
    0,
  );

  // Recent transactions
  const recentSaleTransactions = await Sale.find()
    .populate("customerId", "name")
    .sort({ date: -1 })
    .limit(5);

  const recentPurchaseTransactions = await Purchase.find()
    .populate("vendorId", "name")
    .sort({ date: -1 })
    .limit(5);

  res.json({
    success: true,
    data: {
      overview: {
        totalProducts,
        totalCustomers,
        totalVendors,
        lowStockProductsCount: lowStockProducts.length,
      },
      monthly: {
        sales: monthlySales,
        purchases: monthlyPurchases,
        profit: monthlySales - monthlyPurchases,
        transactionCount: monthlySaleTransactions.length,
      },
      yearly: {
        sales: yearlySales,
        purchases: yearlyPurchases,
        profit: yearlySales - yearlyPurchases,
        transactionCount: yearlySaleTransactions.length,
      },
      lowStockProducts: lowStockProducts.slice(0, 10),
      recentSales: recentSaleTransactions,
      recentPurchases: recentPurchaseTransactions,
    },
  });
});

// Helper functions
const getGroupFormat = (groupBy) => {
  switch (groupBy) {
    case "hour":
      return "YYYY-MM-DD HH:00";
    case "day":
      return "YYYY-MM-DD";
    case "week":
      return "YYYY-[W]WW";
    case "month":
      return "YYYY-MM";
    case "year":
      return "YYYY";
    default:
      return "YYYY-MM-DD";
  }
};

const formatDateForGrouping = (date, groupBy) => {
  switch (groupBy) {
    case "hour":
      return date.toISOString().substring(0, 13) + ":00:00.000Z";
    case "day":
      return date.toISOString().substring(0, 10);
    case "month":
      return date.toISOString().substring(0, 7);
    case "year":
      return date.getFullYear().toString();
    default:
      return date.toISOString().substring(0, 10);
  }
};

module.exports = {
  getInventoryReport,
  getTransactionReport,
  getCustomerReport,
  getVendorReport,
  getDashboardSummary,
};
