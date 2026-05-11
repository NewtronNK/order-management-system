import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order, OrderDocument } from './schemas/order.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ShopService } from '../shop/shop.service';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private productModel: Model<OrderDocument>,
    private shopService: ShopService
  ) {}
  async create(createOrderDto: CreateOrderDto) : Promise<Order> {
    const shopResult = await this.shopService.findOne(createOrderDto.shopId);
    
    if (!shopResult) {
      throw new NotFoundException('shop not found')
    }
    
    const result = new this.productModel(createOrderDto);
    return result.save();
  }

  async findAll() {
    return this.productModel.find().exec();
  }

  async findByShop(shopId: string): Promise<Order[]> {
    return this.productModel.find({ shopId }).exec();
  }

  findOne(id: string) {
    return `This action returns a #${id} order`;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) : Promise<Order | null> {
    const result = await this.productModel.findByIdAndUpdate(id, updateOrderDto, { returnDocument: 'after' }).exec();
    return result;
  }

  remove(id: string) {
    return `This action removes a #${id} order`;
  }
}
