const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
      maxLength: [100, "Name cannot exceed 100 characters"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      match: [/^\+?[\d\s\-\(\)]{10,}$/, "Please enter a valid phone number"],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    address: {
      street: {
        type: String,
        trim: true,
      },
      city: {
        type: String,
        trim: true,
      },
      state: {
        type: String,
        trim: true,
      },
      zipCode: {
        type: String,
        trim: true,
      },
      country: {
        type: String,
        trim: true,
        default: "India",
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    notes: {
      type: String,
      trim: true,
      maxLength: [500, "Notes cannot exceed 500 characters"],
    },
    // Financial tracking
    creditLimit: {
      type: Number,
      default: 0,
      min: [0, "Credit limit cannot be negative"],
    },
    outstandingReceivable: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for better query performance
customerSchema.index({ creditLimit: 1 });
customerSchema.index({ outstandingReceivable: 1 });

// Virtual for full address
customerSchema.virtual("fullAddress").get(function () {
  const addr = this.address;
  const parts = [
    addr.street,
    addr.city,
    addr.state,
    addr.zipCode,
    addr.country,
  ].filter(Boolean);
  return parts.join(", ");
});

// Virtual for contact info
customerSchema.virtual("contactInfo").get(function () {
  const info = [this.phone];
  if (this.email) info.push(this.email);
  return info.join(" | ");
});

// Ensure virtual fields are included in JSON output
customerSchema.set("toJSON", { virtuals: true });

// Static methods
customerSchema.statics.findCustomers = function () {
  return this.find({ isActive: true });
};

customerSchema.statics.searchCustomers = function (searchTerm) {
  const regex = new RegExp(searchTerm, "i");
  return this.find({
    isActive: true,
    $or: [{ name: regex }, { phone: regex }, { email: regex }],
  });
};

// Methods
customerSchema.methods.updateBalance = function (amount) {
  this.outstandingReceivable += amount;
  return this.save();
};

module.exports = mongoose.model("Customer", customerSchema);
