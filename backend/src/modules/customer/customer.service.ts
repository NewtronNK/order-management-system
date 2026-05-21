import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Customer, CustomerDocument } from './schemas/customer.schema';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomerService {
  constructor(
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
  ) {}

  async createCustomer(order: any): Promise<Customer | null> {
    const { name, contact } = order.customerAddress ?? {};
    if (!name || !contact) return null;
    if (order.status === 'draft' || order.status === 'cancel') return null;

    const orderDate = new Date(order.orderDate);
    const existing = await this.findCustomer(order.shopId, name, contact);

    if (existing) {
      return this.updateCustomer(existing._id.toString(), {
        orderIds: [...existing.orderIds, order._id],
        orderCount: existing.orderCount + 1,
        totalValue: existing.totalValue + (order.totalPrice ?? 0),
        firstPurchase: orderDate < existing.firstPurchase ? orderDate : existing.firstPurchase,
        latestPurchase: orderDate > existing.latestPurchase ? orderDate : existing.latestPurchase,
      });
    }

    return this.customerModel.create({
      shopId: order.shopId,
      name,
      contact,
      orderIds: [order._id],
      firstPurchase: orderDate,
      latestPurchase: orderDate,
      orderCount: 1,
      totalValue: order.totalPrice ?? 0,
    });
  }

  async updateCustomer(id: string, dto: UpdateCustomerDto): Promise<Customer | null> {
    return this.customerModel.findByIdAndUpdate(id, dto, { new: true }).exec();
  }

  async syncCustomerOnOrderUpdate(oldOrder: any, newOrder: any): Promise<void> {
    const wasActive = oldOrder.status !== 'draft' && oldOrder.status !== 'cancel';
    const isActive = newOrder.status !== 'draft' && newOrder.status !== 'cancel';

    // draft > processing
    if (!wasActive && isActive) {
      await this.createCustomer(newOrder);
      return;
    }

    // processing > draft / cancel
    if (wasActive && !isActive) {
      await this.removeOrderFromCustomer(oldOrder);
      return;
    }

    if (!wasActive && !isActive) return;

    const oldName = oldOrder.customerAddress?.name;
    const oldContact = oldOrder.customerAddress?.contact;
    const newName = newOrder.customerAddress?.name;
    const newContact = newOrder.customerAddress?.contact;
    const addressChanged = oldName !== newName || oldContact !== newContact;

    // Customer address changed: move the order to the new customer record
    if (addressChanged) {
      await this.removeOrderFromCustomer(oldOrder);
      await this.createCustomer(newOrder);
      return;
    }

    // Same customer, but price or date may have changed: patch the customer record
    const priceChanged = (oldOrder.totalPrice ?? 0) !== (newOrder.totalPrice ?? 0);
    const dateChanged = String(oldOrder.orderDate) !== String(newOrder.orderDate);

    if (priceChanged || dateChanged) {
      const customer = await this.findCustomer(newOrder.shopId, newName, newContact);
      if (!customer) return;

      const priceDiff = (newOrder.totalPrice ?? 0) - (oldOrder.totalPrice ?? 0);
      const newOrderDate = new Date(newOrder.orderDate);

      await this.updateCustomer(customer._id.toString(), {
        totalValue: Math.max(0, customer.totalValue + priceDiff),
        firstPurchase: newOrderDate < customer.firstPurchase ? newOrderDate : customer.firstPurchase,
        latestPurchase: newOrderDate > customer.latestPurchase ? newOrderDate : customer.latestPurchase,
      });
    }
  }

  async searchCustomers(params: {
    shopId?: string;
    text?: string;
    startDate?: string;
    endDate?: string;
    sort?: string;
  }) {
    const { shopId, text, startDate, endDate, sort } = params;
    if (!shopId) return [];

    const query: any = { shopId };

    if (text?.trim()) {
      const regex = new RegExp(text.trim(), 'i');
      query.$or = [{ name: regex }, { contact: regex }];
    }

    if (startDate || endDate) {
      query.latestPurchase = {};
      if (startDate) query.latestPurchase.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.latestPurchase.$lte = end;
      }
    }

    const sortOption: Record<string, 1 | -1> =
      sort === 'desc' ? { firstPurchase: 1 } : { latestPurchase: -1 };

    const customers = await this.customerModel.find(query).sort(sortOption).lean().exec();

    return customers.map((c) => ({
      id: `${c.name}-${c.contact}`,
      name: c.name,
      contact: c.contact,
      firstPurchase: c.firstPurchase,
      latestPurchase: c.latestPurchase,
      orderCount: c.orderCount ?? 0,
      totalValue: c.totalValue ?? 0,
    }));
  }

  // ─── Private Helpers ──────────────────────────────────────────────────────

  private findCustomer(shopId: string, name: string, contact: string) {
    return this.customerModel.findOne({ shopId, name, contact }).exec();
  }

  async removeOrderFromCustomer(order: any): Promise<void> {
    const { name, contact } = order.customerAddress ?? {};
    if (!name || !contact) return;

    const customer = await this.findCustomer(order.shopId, name, contact);
    if (!customer) return;

    await this.updateCustomer(customer._id.toString(), {
      orderIds: customer.orderIds.filter((id) => id.toString() !== order._id.toString()),
      orderCount: Math.max(0, customer.orderCount - 1),
      totalValue: Math.max(0, customer.totalValue - (order.totalPrice ?? 0)),
    });
  }
}
