const mongoose = require("mongoose");

const saleItemSchema = new mongoose.Schema(
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

const saleSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: function () {
        return this.type === "sale";
      },
    },
    customerName: {
      type: String,
      required: function () {
        return this.type === "sale";
      },
    },
    products: [saleItemSchema],
    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
      min: [0, "Total amount cannot be negative"],
    },
    date: {
      type: Date,
      required: [true, "Sale date is required"],
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
saleSchema.index({ date: -1 });
saleSchema.index({ customerId: 1 });
saleSchema.index({ invoiceNumber: 1 }, { sparse: true });

// Pre-save middleware to calculate totals
saleSchema.pre("save", async function () {
  // Calculate item totals
  this.products.forEach((item) => {
    item.total = item.quantity * item.price;
  });

  // Calculate total amount
  this.totalAmount = this.products.reduce((sum, item) => sum + item.total, 0);

  //next();
});

// Virtual for sale summary
saleSchema.virtual("summary").get(function () {
  const customerName = this.customerName;
  const itemCount = this.products.length;
  const totalQty = this.products.reduce((sum, item) => sum + item.quantity, 0);

  return {
    id: this._id,
    customerName,
    itemCount,
    totalQuantity: totalQty,
    totalAmount: this.totalAmount,
    date: this.date,
  };
});

// Ensure virtual fields are included in JSON output
saleSchema.set("toJSON", { virtuals: true });

// Static methods
saleSchema.statics.findByDateRange = function (startDate, endDate) {
  return this.find({
    date: {
      $gte: startDate,
      $lte: endDate,
    },
  }).sort({ date: -1 });
};

saleSchema.statics.findByCustomer = function (customerId) {
  const filter = {};
  filter.customerId = customerId;
  return this.find(filter).sort({ date: -1 });
};

saleSchema.statics.getRevenue = function (startDate, endDate) {
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
        totalRevenue: { $sum: "$totalAmount" },
        saleCount: { $sum: 1 },
      },
    },
  ]);
};

// saleSchema.statics.getExpenses = function (startDate, endDate) {
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
//         totalExpenses: { $sum: "$totalAmount" },
//         saleCount: { $sum: 1 },
//       },
//     },
//   ]);
// };

module.exports = mongoose.model("Sale", saleSchema);
