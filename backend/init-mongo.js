// MongoDB initialization script
db = db.getSiblingDB('inventory_billing');

// Create collections with indexes
db.createCollection('users');
db.users.createIndex({ email: 1 }, { unique: true });

db.createCollection('products');
db.products.createIndex({ name: 1 });
db.products.createIndex({ category: 1 });
db.products.createIndex({ stock: 1 });
db.products.createIndex({ sku: 1 }, { sparse: true });

db.createCollection('contacts');
db.contacts.createIndex({ type: 1 });
db.contacts.createIndex({ name: 1 });
db.contacts.createIndex({ phone: 1 });
db.contacts.createIndex({ email: 1 }, { sparse: true });

db.createCollection('transactions');
db.transactions.createIndex({ date: -1 });
db.transactions.createIndex({ type: 1, date: -1 });
db.transactions.createIndex({ customerId: 1 });
db.transactions.createIndex({ vendorId: 1 });

print('Database initialization completed.');