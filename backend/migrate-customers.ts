import mongoose from 'mongoose';

// Read the MONGODB_URI directly from the .env file
const uri = 'mongodb+srv://omsdb:MtSqfsuAPWDvNoTL@cluster0.tzx4mb5.mongodb.net/?appName=Cluster0';

const orderSchema = new mongoose.Schema({}, { strict: false });
const OrderModel = mongoose.model('Order', orderSchema, 'orders');

const customerSchema = new mongoose.Schema({
  shopId: mongoose.Schema.Types.ObjectId,
  name: String,
  contact: String,
  orderIds: [mongoose.Schema.Types.ObjectId],
  firstPurchase: Date,
  latestPurchase: Date,
  orderCount: { type: Number, default: 0 },
  totalValue: { type: Number, default: 0 },
}, { timestamps: true });
customerSchema.index({ shopId: 1, name: 1, contact: 1 }, { unique: true });
const CustomerModel = mongoose.model('Customer', customerSchema, 'customers');

async function migrate() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(uri);
  console.log('Connected.');

  const orders: any[] = await OrderModel.find({
    isDeleted: { $ne: true },
    status: { $nin: ['cancel', 'draft'] }
  }).lean();

  console.log(`Found ${orders.length} valid orders.`);

  const customerMap = new Map<string, any>();

  for (const order of orders) {
    if (!order.customerAddress?.name || !order.customerAddress?.contact) continue;

    const key = `${order.shopId}_${order.customerAddress.name}_${order.customerAddress.contact}`;

    if (!customerMap.has(key)) {
      customerMap.set(key, {
        shopId: order.shopId,
        name: order.customerAddress.name,
        contact: order.customerAddress.contact,
        orderIds: [],
        firstPurchase: order.orderDate,
        latestPurchase: order.orderDate,
        orderCount: 0,
        totalValue: 0,
      });
    }

    const cust = customerMap.get(key);
    cust.orderIds.push(order._id);
    cust.orderCount += 1;
    cust.totalValue += order.totalPrice || 0;

    const d = new Date(order.orderDate);
    if (d < new Date(cust.firstPurchase)) cust.firstPurchase = d;
    if (d > new Date(cust.latestPurchase)) cust.latestPurchase = d;
  }

  console.log(`Upserting ${customerMap.size} customer records...`);

  for (const cust of customerMap.values()) {
    await CustomerModel.findOneAndUpdate(
      { shopId: cust.shopId, name: cust.name, contact: cust.contact },
      { $set: cust },
      { upsert: true }
    );
  }

  console.log('Migration complete.');
  await mongoose.disconnect();
}

migrate().catch(console.error);
