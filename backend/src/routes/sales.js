const express = require("express");
const {
  getSales,
  getSale,
  createSale,
  // getSales,
  // getPurchases,
  updateSaleStatus,
  getSaleSummary,
} = require("../controllers/saleController");
const { authenticate } = require("../middleware/auth");
const { requireProfileCompletion } = require("../middleware/profileCompletion");
const { validateRequest } = require("../middleware/validation");
const {
  createSaleValidation,
  updateSaleStatusValidation,
} = require("../utils/validations");

const router = express.Router();

// Apply authentication, profile completion, and business access middleware to all routes
router.use(authenticate);
router.use(requireProfileCompletion);
//router.use(checkBusinessAccess);

// sales CRUD routes
router.get("/", getSales);
router.post("/", createSaleValidation, validateRequest, createSale);

// Special routes (must come before :id routes)
router.get("/summary", getSaleSummary);

//router.get('/sales', getSales);
//router.get('/purchases', getPurchases);

// Individual sale routes
router.get("/:id", getSale);
router.patch(
  "/:id/status",
  updateSaleStatusValidation,
  validateRequest,
  updateSaleStatus,
);

module.exports = router;
