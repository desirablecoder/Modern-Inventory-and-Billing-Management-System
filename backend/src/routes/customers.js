const express = require("express");
const {
  getAllCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  updateCustomerBalance,
  searchCustomers,
} = require("../controllers/customerController");
const { authenticate } = require("../middleware/auth");
const { requireProfileCompletion } = require("../middleware/profileCompletion");
const { validateRequest } = require("../middleware/validation");
const {
  createCustomerValidation,
  updateCustomerValidation,
  updateCustomerBalanceValidation,
} = require("../utils/validations");

const router = express.Router();

// Apply authentication, profile completion, and business access middleware to all routes
router.use(authenticate);
router.use(requireProfileCompletion);
//router.use(checkBusinessAccess);

// Customer CRUD routes
router.get("/", getAllCustomers);
router.post("/", createCustomerValidation, validateRequest, createCustomer);

// Special routes (must come before :id routes)
router.get("/customers", getAllCustomers);
router.get("/search/:term", searchCustomers);

// Individual customer routes
router.get("/:id", getCustomer);
router.put("/:id", updateCustomerValidation, validateRequest, updateCustomer);
router.delete("/:id", deleteCustomer);
router.patch(
  "/:id/balance",
  updateCustomerBalanceValidation,
  validateRequest,
  updateCustomerBalance,
);

module.exports = router;
