const { Vendor } = require("../models");
const { asyncHandler } = require("../middleware/validation");

/**
 * @desc    Get vendors only
 * @route   GET /api/vendors
 * @access  Private
 */
const getVendors = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search } = req.query;

  const filter = { isActive: true };

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const vendors = await Vendor
    .find(filter)
    .sort({ name: 1 })
    .limit(limitNum)
    .skip(skip);

  const total = await Vendor.countDocuments(filter);

  res.json({
    success: true,
    data: {
      vendors,
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
 * @desc    Get single vendor
 * @route   GET /api/vendors/:id
 * @access  Private
 */
const getVendor = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findOne({
    _id: req.params.id,
    isActive: true,
  });

  if (!vendor) {
    return res.status(404).json({
      success: false,
      message: "Vendor not found",
    });
  }

  res.json({
    success: true,
    data: { vendor },
  });
});

/**
 * @desc    Create new vendor
 * @route   POST /api/vendors
 * @access  Private
 */
const createVendor = asyncHandler(async (req, res) => {
  const vendorData = {
    ...req.body,
  };

  // Check if vendor with same phone already exists
  const existingVendor = await Vendor.findOne({
    phone: vendorData.phone,
    isActive: true,
  });

  if (existingVendor) {
    return res.status(400).json({
      success: false,
      message: "Vendor with this phone number already exists",
    });
  }

  // Check if email already exists (if provided)
  if (vendorData.email) {
    const existingEmailVendor = await Vendor.findOne({
      email: vendorData.email,
      isActive: true,
    });

    if (existingEmailVendor) {
      return res.status(400).json({
        success: false,
        message: "Vendor with this email already exists",
      });
    }
  }

  const vendor = await Vendor.create(vendorData);

  res.status(201).json({
    success: true,
    message: "Vendor created successfully",
    data: { vendor },
  });
});

/**
 * @desc    Update vendor
 * @route   PUT /api/vendors/:id
 * @access  Private
 */
const updateVendor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  // Check if phone already exists (if being updated)
  if (updateData.phone) {
    const existingVendor = await Vendor.findOne({
      phone: updateData.phone,
      _id: { $ne: id },
      isActive: true,
    });

    if (existingVendor) {
      return res.status(400).json({
        success: false,
        message: "Vendor with this phone number already exists",
      });
    }
  }

  // Check if email already exists (if being updated)
  if (updateData.email) {
    const existingEmailVendor = await Vendor.findOne({
      email: updateData.email,
      _id: { $ne: id },
      isActive: true,
    });

    if (existingEmailVendor) {
      return res.status(400).json({
        success: false,
        message: "Vendor with this email already exists",
      });
    }
  }

  const vendor = await Vendor.findOneAndUpdate({ _id: id }, updateData, {
    new: true,
    runValidators: true,
  });

  if (!vendor) {
    return res.status(404).json({
      success: false,
      message: "Vendor not found",
    });
  }

  res.json({
    success: true,
    message: "Vendor updated successfully",
    data: { vendor },
  });
});

/**
 * @desc    Delete vendor (soft delete)
 * @route   DELETE /api/vendors/:id
 * @access  Private
 */
const deleteVendor = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findOneAndUpdate(
    { _id: req.params.id },
    { isActive: false },
    { new: true },
  );

  if (!vendor) {
    return res.status(404).json({
      success: false,
      message: "Vendor not found",
    });
  }

  res.json({
    success: true,
    message: "Vendor deleted successfully",
  });
});

/**
 * @desc    Update vendor balance
 * @route   PATCH /api/vendors/:id/balance
 * @access  Private
 */
const updateVendorBalance = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { amount, operation = "set" } = req.body; // set, add, subtract

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

  let newBalance;
  const previousBalance = vendor.outstandingBalance;

  switch (operation) {
    case "add":
      newBalance = vendor.outstandingBalance + amount;
      break;
    case "subtract":
      newBalance = vendor.outstandingBalance - amount;
      break;
    case "set":
    default:
      newBalance = amount;
      break;
  }

  vendor.outstandingBalance = newBalance;
  await vendor.save();

  res.json({
    success: true,
    message: "Vendor balance updated successfully",
    data: {
      vendor,
      previousBalance,
      newBalance,
      operation,
    },
  });
});

/**
 * @desc    Search vendors
 * @route   GET /api/vendors/search/:term
 * @access  Private
 */
const searchVendors = asyncHandler(async (req, res) => {
  const { term } = req.params;
  const { limit = 10 } = req.query;

  const filter = { isActive: true };

  const vendors = await Vendor
    .searchVendors(term)
    .where(filter)
    .limit(parseInt(limit));

  res.json({
    success: true,
    data: {
      searchTerm: term,
      vendors,
      count: vendors.length,
    },
  });
});

module.exports = {
  getVendors,
  getVendor,
  createVendor,
  updateVendor,
  deleteVendor,
  updateVendorBalance,
  searchVendors,
};
