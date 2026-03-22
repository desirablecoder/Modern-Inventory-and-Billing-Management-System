const mongoose = require("mongoose");
require("dotenv").config();
const customer = require("./src/models/Customer");
const vendor = require("./src/models/Vendor");
const product = require("./src/models/product");
const userModel = require("./src/models/userModel");

const customerSeedData = [
  {
    name: "Infinite Logic Systems",
    phone: "(602) 555-0820",
    email: "angela.simmons@infinitelogic.com",
    address: {
      street: "2300 E Camelback Rd, Phoenix, AZ 85016",
      city: "Phoenix",
      state: "Arizona",
      zipCode: "85016",
      country: "USA",
    },
    isActive: true,
    notes: "",
    creditLimit: 0,
    outstandingReceivable: 0,
  },
  {
    name: "LoneStar Data Solutions",
    phone: "(512) 555-0909",
    email: "kevin.white@lonestardata.com",
    address: {
      street: "350 Congress Ave, Austin, TX 78701",
      city: "Austin",
      state: "Texas",
      zipCode: "78701",
      country: "USA",
    },
    isActive: true,
    notes: "",
    creditLimit: 0,
    outstandingReceivable: 0,
  },
  {
    name: "Apex Digital Systems",
    phone: "(214) 555-0176",
    email: "jjohnathan.pierce@apexdigital.com",
    address: {
      street: "501 Commerce St, Dallas, TX 75202",
      city: "Dallas",
      state: "Texas",
      zipCode: "75202",
      country: "USA",
    },
    isActive: true,
    notes: "",
    creditLimit: 0,
    outstandingReceivable: 0,
  },
  {
    name: "BrightWave Innovations",
    phone: "(305) 555-0204",
    email: "carlos.diaz@brightwave.com",
    address: {
      street: "400 Biscayne Blvd, Miami, FL 33131",
      city: "Miami",
      state: "Florida",
      zipCode: "33131",
      country: "USA",
    },
    isActive: true,
    notes: "",
    creditLimit: 0,
    outstandingReceivable: 0,
  },
  {
    name: "Summit IT Services",
    phone: "(480) 555-0335",
    email: "amanda.reyes@summitit.com",
    address: {
      street: "7550 E Camelback Rd, Scottsdale, AZ 85251",
      city: "Scottsdale",
      state: "Arizona",
      zipCode: "85251",
      country: "USA",
    },
    isActive: true,
    notes: "",
    creditLimit: 0,
    outstandingReceivable: 0,
  },
  {
    name: "Vertex Software Group",
    phone: "(713) 555-0412",
    email: "mike.andrews@vertexsoftware.com",
    address: {
      street: "1200 Main St, Houston, TX 77002",
      city: "Houston",
      state: "Texas",
      zipCode: "77002",
      country: "USA",
    },
    isActive: true,
    notes: "",
    creditLimit: 0,
    outstandingReceivable: 0,
  },
  {
    name: "Nexus Cloud Solutions",
    phone: "(213) 555-0567",
    email: "jennifer.collins@nexuscloud.com",
    address: {
      street: "1750 Sunset Blvd, Los Angeles, CA 90026",
      city: "Los Angeles",
      state: "California",
      zipCode: "90026",
      country: "USA",
    },
    isActive: true,
    notes: "",
    creditLimit: 0,
    outstandingReceivable: 0,
  },
  {
    name: "HorizonTech Partners",
    phone: "(813) 555-0644",
    email: "david.thompson@horizontechnology.com",
    address: {
      street: "250 Channelside Dr, Tampa, FL 33602",
      city: "Tampa",
      state: "Florida",
      zipCode: "33602",
      country: "USA",
    },
    isActive: true,
    notes: "",
    creditLimit: 0,
    outstandingReceivable: 0,
  },
  {
    name: "Phoenix Digital Network",
    phone: "(480) 555-0701",
    email: "robert.johnson@phoenixdigital.com",
    address: {
      street: "101 E University Dr, Mesa, AZ 85203",
      city: "Mesa",
      state: "Arizona",
      zipCode: "85203",
      country: "USA",
    },
    isActive: true,
    notes: "",
    creditLimit: 0,
    outstandingReceivable: 0,
  },
];

const vendorSeedData = [
  {
    name: "Processor Supplier",
    phone: "(602) 555-0820",
    email: "angela.simmons@infinitelogic.com",
    address: {
      street: "2300 E Camelback Rd, Phoenix, AZ 85016",
      city: "Phoenix",
      state: "Arizona",
      zipCode: "85016",
      country: "USA",
    },
    isActive: true,
    notes: "",
    outstandingBalance: 0,
  },
  {
    name: "Motherboardd Supplier",
    phone: "(512) 555-0909",
    email: "kevin.white@lonestardata.com",
    address: {
      street: "350 Congress Ave, Austin, TX 78701",
      city: "Austin",
      state: "Texas",
      zipCode: "78701",
      country: "USA",
    },
    isActive: true,
    notes: "",
    outstandingBalance: 0,
  },
  {
    name: "Graphics Card Supplier",
    phone: "(214) 555-0176",
    email: "jjohnathan.pierce@apexdigital.com",
    address: {
      street: "501 Commerce St, Dallas, TX 75202",
      city: "Dallas",
      state: "Texas",
      zipCode: "75202",
      country: "USA",
    },
    isActive: true,
    notes: "",
    outstandingBalance: 0,
  },
  {
    name: "Memory Supplier",
    phone: "(305) 555-0204",
    email: "carlos.diaz@brightwave.com",
    address: {
      street: "400 Biscayne Blvd, Miami, FL 33131",
      city: "Miami",
      state: "Florida",
      zipCode: "33131",
      country: "USA",
    },
    isActive: true,
    notes: "",
    outstandingBalance: 0,
  },
];

const productSeedData = [
  {
    name: "Core i7-11700k 11th Gen",
    description: "Intel Core i7-11700K | 8 Cores | 5.0GHz Turbo | 16MB Cache",
    price: 388,
    stock: 10,
    category: "Processor",
    sku: "P0001",
    isActive: true,
    minStockLevel: 0,
  },
  {
    name: "Kingston DDR4 8GB",
    description: "Kingston KHX2133C14D4/4G | DDR4 | 8GB | 2133MHz | CL14",
    price: 44,
    stock: 10,
    category: "Memory",
    sku: "MC001",
    isActive: true,
    minStockLevel: 0,
  },
  {
    name: "Corsair Vengeance DDR4 8GB",
    description: "Corsair Vengeance LPX 8GB | DDR4 | 3200MHz | CL16",
    price: 53,
    stock: 10,
    category: "Memory",
    sku: "MC002",
    isActive: true,
    minStockLevel: 0,
  },
  {
    name: "NVIDIA GeForce GTX 1070",
    description: "NVIDIA GeForce GTX 1070 Ti | 8GB GDDR5 | 1683MHz Boost",
    price: 245,
    stock: 10,
    category: "Graphics Card",
    sku: "GC001",
    isActive: true,
    minStockLevel: 0,
  },
  {
    name: "AMD Radeon RX 580",
    description: "AMD Radeon RX 580 | 8GB GDDR5 | 1340MHz Boost",
    price: 200,
    stock: 10,
    category: "Graphics Card",
    sku: "GC002",
    isActive: true,
    minStockLevel: 0,
  },
  {
    name: "ASUS ROG Strix Z790-E",
    description: "ASUS ROG Strix Z790-E Gaming | Intel Z790 | DDR5 | ATX",
    price: 277,
    stock: 10,
    category: "Motherboard",
    sku: "MB001",
    isActive: true,
    minStockLevel: 0,
  },
  {
    name: "ASUS ROG Strix B660-G Gaming WiFi",
    description:
      "ASUS ROG Strix B660-G Gaming WiFi | Intel B660 | DDR4 | Micro ATX",
    price: 225,
    stock: 10,
    category: "Motherboard",
    sku: "MB002",
    isActive: true,
    minStockLevel: 0,
  },
  {
    name: "ASUS PRIME Z590-A",
    description: "ASUS PRIME Z590-A | Intel Z590 | DDR4 | ATX",
    price: 222,
    stock: 10,
    category: "Motherboard",
    sku: "MB003",
    isActive: true,
    minStockLevel: 0,
  },
  {
    name: "ASUS PRIME B560M-A",
    description: "ASUS PRIME B560M-A | Intel B560 | DDR4 | Micro ATX",
    price: 215,
    stock: 10,
    category: "Motherboard",
    sku: "MB004",
    isActive: true,
    minStockLevel: 0,
  },
];

const userSeedData = [
  {
    name: "softwareprabhu",
    email: "softwareprabhu@gmail.com",
    password: "$2b$12$RLoqrnl8KwGGnWXL73Ezy.TG.MfQQJr4vWtmEUA6oT5R0eVufuRPm",
    profileCompleted: true,
    role: "user",
    isActive: true,
    provider: "local",
    emailVerified: false,
  },
];

const seedDB = async () => {
  console.log(process.env.MONGODB_URI);
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Remove deprecated options, use only supported ones
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    await customer.deleteMany({});
    await customer.insertMany(customerSeedData);

    await vendor.deleteMany({});
    await vendor.insertMany(vendorSeedData);

    await userModel.deleteMany({});
    await userModel.insertMany(userSeedData);

    await product.deleteMany({});
    await product.insertMany(productSeedData);

    console.log("Database seeding completed successfully.");

    await mongoose.connection.close();

    // Handle connection events
    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB disconnected");
    });

    // Graceful shutdown
    // process.on("SIGINT", async () => {
    //   try {
    //     await mongoose.connection.close();
    //     console.log("MongoDB connection closed through app termination");
    //     process.exit(0);
    //   } catch (err) {
    //     console.error("Error during database disconnection:", err);
    //     process.exit(1);
    //   }
    // });
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
};

seedDB();
