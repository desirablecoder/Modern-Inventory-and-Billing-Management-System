const { Customer } = require("../models");
const { asyncHandler } = require("../middleware/validation");

/**
 * @desc    Get all customers with search and filter
 * @route   GET /api/customers
 * @access  Private
 */
const getAllCustomers = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 10 } = req.query;

  // Build filter object
  const filter = { isActive: true };

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  // Calculate pagination
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  // Get customers with pagination
  const customers = await Customer.find(filter)
    .sort({ name: 1 })
    .limit(limitNum)
    .skip(skip);

  // Get total count for pagination
  const total = await Customer.countDocuments(filter);

  res.json({
    success: true,
    data: {
      customers,
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
 * @desc    Get single customer
 * @route   GET /api/customers/:id
 * @access  Private
 */
const getCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findOne({
    _id: req.params.id,
    isActive: true,
  });

  if (!customer) {
    return res.status(404).json({
      success: false,
      message: "Customer not found",
    });
  }

  res.json({
    success: true,
    data: { customer },
  });
});

/**
 * @desc    Create new customer
 * @route   POST /api/customers
 * @access  Private
 */
const createCustomer = asyncHandler(async (req, res) => {
  const customerData = {
    ...req.body,
  };

  // Check if customer with same phone already exists
  const existingCustomer = await Customer.findOne({
    phone: customerData.phone,
    isActive: true,
  });

  if (existingCustomer) {
    return res.status(400).json({
      success: false,
      message: "Customer with this phone number already exists",
    });
  }

  // Check if email already exists (if provided)
  if (customerData.email) {
    const existingEmailCustomer = await Customer.findOne({
      email: customerData.email,
      isActive: true,
    });

    if (existingEmailCustomer) {
      return res.status(400).json({
        success: false,
        message: "Customer with this email already exists",
      });
    }
  }

  const customer = await Customer.create(customerData);

  res.status(201).json({
    success: true,
    message: "Customer created successfully",
    data: { customer },
  });
});

/**
 * @desc    Update customer
 * @route   PUT /api/customers/:id
 * @access  Private
 */
const updateCustomer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  // Check if phone already exists (if being updated)
  if (updateData.phone) {
    const existingCustomer = await Customer.findOne({
      phone: updateData.phone,
      _id: { $ne: id },
      isActive: true,
    });

    if (existingCustomer) {
      return res.status(400).json({
        success: false,
        message: "Customer with this phone number already exists",
      });
    }
  }

  // Check if email already exists (if being updated)
  if (updateData.email) {
    const existingEmailCustomer = await Customer.findOne({
      email: updateData.email,
      _id: { $ne: id },
      isActive: true,
    });

    if (existingEmailCustomer) {
      return res.status(400).json({
        success: false,
        message: "Customer with this email already exists",
      });
    }
  }

  const customer = await Customer.findOneAndUpdate({ _id: id }, updateData, {
    new: true,
    runValidators: true,
  });

  if (!customer) {
    return res.status(404).json({
      success: false,
      message: "Customer not found",
    });
  }

  res.json({
    success: true,
    message: "Customer updated successfully",
    data: { customer },
  });
});

/**
 * @desc    Delete customer (soft delete)
 * @route   DELETE /api/customers/:id
 * @access  Private
 */
const deleteCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findOneAndUpdate(
    { _id: req.params.id },
    { isActive: false },
    { new: true },
  );

  if (!customer) {
    return res.status(404).json({
      success: false,
      message: "Customer not found",
    });
  }

  res.json({
    success: true,
    message: "Customer deleted successfully",
  });
});

/**
 * @desc    Update customer balance
 * @route   PATCH /api/customers/:id/balance
 * @access  Private
 */
const updateCustomerBalance = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { amount, operation = "set" } = req.body; // set, add, subtract

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

  let newBalance;
  const previousBalance = customer.outstandingReceivable;

  switch (operation) {
    case "add":
      newBalance = customer.outstandingReceivable + amount;
      break;
    case "subtract":
      newBalance = customer.outstandingReceivable - amount;
      break;
    case "set":
    default:
      newBalance = amount;
      break;
  }

  customer.outstandingReceivable = newBalance;
  await customer.save();

  res.json({
    success: true,
    message: "Customer balance updated successfully",
    data: {
      customer,
      previousBalance,
      newBalance,
      operation,
    },
  });
});

/**
 * @desc    Search customers
 * @route   GET /api/customers/search/:term
 * @access  Private
 */
const searchCustomers = asyncHandler(async (req, res) => {
  const { term } = req.params;
  const { limit = 10 } = req.query;

  const filter = { isActive: true };

  const customers = await Customer.searchCustomers(term)
    .where(filter)
    .limit(parseInt(limit));

  res.json({
    success: true,
    data: {
      searchTerm: term,
      customers,
      count: customers.length,
    },
  });
});

module.exports = {
  getAllCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  updateCustomerBalance,
  searchCustomers,
};
