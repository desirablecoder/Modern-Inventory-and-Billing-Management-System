const express = require("express");
const {
  getPurchases,
  getPurchase,
  createPurchase,
  // getSales,
  // getPurchases,
  updatePurchaseStatus,
  getPurchaseSummary,
} = require("../controllers/purchaseController");
const { authenticate } = require("../middleware/auth");
const { requireProfileCompletion } = require("../middleware/profileCompletion");
const { validateRequest } = require("../middleware/validation");
const {
  createPurchaseValidation,
  updatePurchaseStatusValidation,
} = require("../utils/validations");

const router = express.Router();

// Apply authentication, profile completion, and business access middleware to all routes
router.use(authenticate);
router.use(requireProfileCompletion);
//router.use(checkBusinessAccess);

// purchases CRUD routes
router.get("/", getPurchases);
router.post("/", createPurchaseValidation, validateRequest, createPurchase);

// Special routes (must come before :id routes)
router.get("/summary", getPurchaseSummary);

//router.get('/sales', getSales);
//router.get('/purchases', getPurchases);

// Individual purchase routes
router.get("/:id", getPurchase);
router.patch(
  "/:id/status",
  updatePurchaseStatusValidation,
  validateRequest,
  updatePurchaseStatus,
);

module.exports = router;
