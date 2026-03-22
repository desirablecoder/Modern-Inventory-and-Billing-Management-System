const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Vendor name is required"],
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
    outstandingBalance: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for better query performance
vendorSchema.index({ outstandingBalance: 1 });

// Virtual for full address
vendorSchema.virtual("fullAddress").get(function () {
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
vendorSchema.virtual("contactInfo").get(function () {
  const info = [this.phone];
  if (this.email) info.push(this.email);
  return info.join(" | ");
});

// Ensure virtual fields are included in JSON output
vendorSchema.set("toJSON", { virtuals: true });

// Static methods
vendorSchema.statics.findVendors = function () {
  return this.find({ isActive: true });
};

vendorSchema.statics.searchVendors = function (searchTerm) {
  const regex = new RegExp(searchTerm, "i");
  return this.find({
    isActive: true,
    $or: [{ name: regex }, { phone: regex }, { email: regex }],
  });
};

// Methods
vendorSchema.methods.updateBalance = function (amount) {
  this.outstandingBalance += amount;
  return this.save();
};

module.exports = mongoose.model("Vendor", vendorSchema);
