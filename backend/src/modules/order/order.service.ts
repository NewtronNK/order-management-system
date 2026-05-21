import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { Product, ProductDocument } from '../product/schemas/product.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ShopService } from '../shop/shop.service';
import { CustomerService } from '../customer/customer.service';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    private shopService: ShopService,
    private customerService: CustomerService,
  ) {}

  // ─── Create ───────────────────────────────────────────────────────────────

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const shop = await this.shopService.findOne(createOrderDto.shopId);
    if (!shop) throw new NotFoundException('Shop not found');

    const order = new this.orderModel(createOrderDto);

    await this.deductStock(order.orderItem);

    const savedOrder = await order.save();

    await this.customerService.createCustomer(savedOrder);

    return savedOrder;
  }

  // ─── Read ─────────────────────────────────────────────────────────────────

  async findAll(): Promise<Order[]> {
    return this.orderModel.find({ isDeleted: { $ne: true } }).exec();
  }

  async findOne(id: string): Promise<Order | null> {
    return this.orderModel.findById(id).exec();
  }

  async findByShop(shopId: string): Promise<Order[]> {
    return this.orderModel.find({ shopId, isDeleted: { $ne: true } }).exec();
  }

  async findByOrder(queryObj: {
    text?: string;
    shopId?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
  }): Promise<Order[] | null> {
    const { text, shopId, startDate, endDate, status } = queryObj;
    const query: any = { isDeleted: { $ne: true } };

    if (shopId) query.shopId = shopId;
    if (text?.trim())
      query.orderNumber = { $regex: text.trim(), $options: 'i' };
    if (status?.trim()) query.status = { $regex: status.trim(), $options: 'i' };

    if (startDate || endDate) {
      query.orderDate = {};
      if (startDate) query.orderDate.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.orderDate.$lte = end;
      }
    }

    return this.orderModel.find(query).exec();
  }

  async filterOrder(status: string, shopId?: string): Promise<Order[] | null> {
    if (!status?.trim()) {
      return shopId ? this.findByShop(shopId) : this.findAll();
    }

    const query: any = {
      status: { $regex: status, $options: 'i' },
      isDeleted: { $ne: true },
    };
    if (shopId) query.shopId = shopId;

    return this.orderModel.find(query).exec();
  }

  // ─── Update ───────────────────────────────────────────────────────────────

  async update(
    id: string,
    updateOrderDto: UpdateOrderDto,
  ): Promise<Order | null> {
    // before update
    const oldOrder = await this.orderModel.findById(id).exec();
    if (!oldOrder) throw new NotFoundException('Order not found');

    const updatedOrder = await this.orderModel
      .findByIdAndUpdate(id, updateOrderDto, { returnDocument: 'after' })
      .exec();

    if (!updatedOrder) return null;

    await this.syncProductStock(oldOrder.orderItem, updatedOrder.orderItem);
    await this.customerService.syncCustomerOnOrderUpdate(
      oldOrder,
      updatedOrder,
    );

    return updatedOrder;
  }

  // ─── Delete ───────────────────────────────────────────────────────────────

  async removeOrders(ids: string[]) {
    const orders = await this.orderModel.find({ _id: { $in: ids } }).exec();

    // Refund stock for all cancelled orders
    const quantityMap = new Map<string, number>();
    for (const order of orders) {
      for (const item of order.orderItem) {
        const pid = item.productId.toString();
        quantityMap.set(pid, (quantityMap.get(pid) ?? 0) + item.quantity);
      }
    }

    if (quantityMap.size > 0) {
      const bulkOps = Array.from(quantityMap.entries()).map(
        ([productId, quantity]) => ({
          updateOne: {
            filter: { _id: productId },
            update: { $inc: { stock: quantity, soldAmount: -quantity } },
          },
        }),
      );
      await this.productModel.bulkWrite(bulkOps);
    }

    await this.orderModel.updateMany(
      { _id: { $in: ids } },
      { $set: { status: 'cancel' } },
    );

    // Remove each active order from customer stats
    for (const order of orders) {
      if (order.status !== 'draft' && order.status !== 'cancel') {
        await this.customerService.removeOrderFromCustomer(order);
      }
    }

    return { message: 'Deleted!', result: { count: ids.length } };
  }

  // ─── Private Helpers ──────────────────────────────────────────────────────

  /** Deducts stock for each product in an order's items */
  private async deductStock(orderItems: any[]) {
    const soldMap = new Map<string, number>();
    for (const item of orderItems) {
      const pid = item.productId.toString();
      soldMap.set(pid, (soldMap.get(pid) ?? 0) + item.quantity);
    }

    const bulkOps = Array.from(soldMap.entries()).map(([productId, sold]) => ({
      updateOne: {
        filter: { _id: productId },
        update: { $inc: { soldAmount: sold, stock: -sold } },
      },
    }));

    await this.productModel.bulkWrite(bulkOps);
  }

  private async syncProductStock(oldItems: any[], newItems: any[]) {
    const oldQtyMap = new Map<string, number>();
    for (const item of oldItems) {
      const pid = item.productId.toString();
      oldQtyMap.set(pid, (oldQtyMap.get(pid) ?? 0) + item.quantity);
    }

    const newQtyMap = new Map<string, number>();
    for (const item of newItems) {
      const pid = item.productId.toString();
      newQtyMap.set(pid, (newQtyMap.get(pid) ?? 0) + item.quantity);
    }

    // diff = newQty - oldQty → positive means more sold, negative means refunded
    const diffMap = new Map<string, number>();
    for (const [pid, newQty] of newQtyMap) {
      diffMap.set(pid, newQty - (oldQtyMap.get(pid) ?? 0));
      oldQtyMap.delete(pid);
    }
    for (const [pid, oldQty] of oldQtyMap) {
      diffMap.set(pid, -oldQty); // removed from order entirely
    }

    const bulkOps: any[] = [];
    for (const [productId, diff] of diffMap) {
      if (diff !== 0) {
        bulkOps.push({
          updateOne: {
            filter: { _id: productId },
            update: { $inc: { stock: -diff, soldAmount: diff } },
          },
        });
      }
    }

    if (bulkOps.length > 0) {
      await this.productModel.bulkWrite(bulkOps);
    }
  }
}
