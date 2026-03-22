const mongoose = require("mongoose");

const purchaseItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product ID is required"],
    },
    productName: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be at least 1"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    total: {
      type: Number,
      required: true,
    },
  },
  { _id: false },
);

const purchaseSchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: function () {
        return this.type === "purchase";
      },
    },
    vendorName: {
      type: String,
      required: function () {
        return this.type === "purchase";
      },
    },
    products: [purchaseItemSchema],
    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
      min: [0, "Total amount cannot be negative"],
    },
    date: {
      type: Date,
      required: [true, "Purchase date is required"],
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "completed",
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "credit"],
      default: "cash",
    },
    notes: {
      type: String,
      trim: true,
      maxLength: [500, "Notes cannot exceed 500 characters"],
    },
    invoiceNumber: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for better query performance
purchaseSchema.index({ date: -1 });
purchaseSchema.index({ vendorId: 1 });
purchaseSchema.index({ invoiceNumber: 1 }, { sparse: true });

// Pre-save middleware to calculate totals
purchaseSchema.pre("save", async function () {
  // Calculate item totals
  this.products.forEach((item) => {
    item.total = item.quantity * item.price;
  });

  // Calculate total amount
  this.totalAmount = this.products.reduce((sum, item) => sum + item.total, 0);

  // next();
});

// Virtual for purchase summary
purchaseSchema.virtual("summary").get(function () {
  const vendorName = this.vendorName;
  const itemCount = this.products.length;
  const totalQty = this.products.reduce((sum, item) => sum + item.quantity, 0);

  return {
    id: this._id,
    type: this.type,
    vendorName,
    itemCount,
    totalQuantity: totalQty,
    totalAmount: this.totalAmount,
    date: this.date,
  };
});

// Ensure virtual fields are included in JSON output
purchaseSchema.set("toJSON", { virtuals: true });

// Static methods
purchaseSchema.statics.findByDateRange = function (startDate, endDate) {
  return this.find({
    date: {
      $gte: startDate,
      $lte: endDate,
    },
  }).sort({ date: -1 });
};

purchaseSchema.statics.findByVendor = function (vendorId) {
  const filter = {};
  filter.vendorId = vendorId;

  return this.find(filter).sort({ date: -1 });
};

// purchaseSchema.statics.getRevenue = function (startDate, endDate) {
//   const matchStage = {
//     status: "completed",
//   };

//   if (startDate && endDate) {
//     matchStage.date = { $gte: startDate, $lte: endDate };
//   }

//   return this.aggregate([
//     { $match: matchStage },
//     {
//       $group: {
//         _id: null,
//         totalRevenue: { $sum: "$totalAmount" },
//         purchaseCount: { $sum: 1 },
//       },
//     },
//   ]);
// };

purchaseSchema.statics.getExpenses = function (startDate, endDate) {
  const matchStage = {
    status: "completed",
  };

  if (startDate && endDate) {
    matchStage.date = { $gte: startDate, $lte: endDate };
  }

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalExpenses: { $sum: "$totalAmount" },
        purchaseCount: { $sum: 1 },
      },
    },
  ]);
};

module.exports = mongoose.model("Purchase", purchaseSchema);
