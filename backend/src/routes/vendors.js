const express = require("express");
const {
  getVendors,
  getVendor,
  createVendor,
  updateVendor,
  deleteVendor,
  updateVendorBalance,
  searchVendors,
} = require("../controllers/vendorController");
const { authenticate } = require("../middleware/auth");
const { requireProfileCompletion } = require("../middleware/profileCompletion");
const { validateRequest } = require("../middleware/validation");
const {
  createVendorValidation,
  updateVendorValidation,
  updateVendorBalanceValidation,
} = require("../utils/validations");

const router = express.Router();

// Apply authentication, profile completion, and business access middleware to all routes
router.use(authenticate);
router.use(requireProfileCompletion);
//router.use(checkBusinessAccess);

// Vendor CRUD routes
router.get("/", getVendors);
router.post("/", createVendorValidation, validateRequest, createVendor);

// Special routes (must come before :id routes)
router.get("/vendors", getVendors);
router.get("/search/:term", searchVendors);

// Individual vendor routes
router.get("/:id", getVendor);
router.put("/:id", updateVendorValidation, validateRequest, updateVendor);
router.delete("/:id", deleteVendor);
router.patch(
  "/:id/balance",
  updateVendorBalanceValidation,
  validateRequest,
  updateVendorBalance,
);

module.exports = router;
