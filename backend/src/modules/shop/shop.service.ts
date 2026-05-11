import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { Shop, ShopDocument } from './schemas/shop.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserService } from '../user/user.service';

@Injectable()
export class ShopService {
  constructor(
    @InjectModel(Shop.name) private shopModel: Model<ShopDocument>,
    private userService: UserService
  ) {}
  async create(createShopDto: CreateShopDto) : Promise<Shop> {
    const userResult = await this.userService.findOne(createShopDto.ownerId);

    if (!userResult) {
      throw new NotFoundException('user not found')
    }

    const result = new this.shopModel(createShopDto);
    return result.save();
  }

  async findOne(id: string) : Promise<Shop | null> {
      return this.shopModel.findById(id).lean();
  }

  async findByOwner(ownerId: string) : Promise<Shop[]> {
    return this.shopModel.find({ ownerId }).populate('ownerId', 'username').exec();
  }

  async findByName(texts: string) : Promise<Shop[] | null> {  
    // return this.shopModel.find({
    //   name: {
    //     $regex: texts,
    //     $options: 'i' // case insensitive (slow ไม่เหมาะกับการ query ข้อมูลหลักล้าน)
    //   }
    // }).exec();
    return this.shopModel.aggregate([{
      $search: {
          index: 'default',
          autocomplete : {
            query: texts,
            path: 'name'
          }
        }
    }]); // วิธีนี้เร็วที่สุด (Atlas)
  }

  async findByCategory(texts: string) : Promise<Shop[] | null> {  
    return this.shopModel.aggregate([{
      $search: {
        index: 'default',
        autocomplete : {
          query: texts,
          path: 'category'
        }
      }
    }]); // เดี๋ยวอาจมาได้แก้ เพราะ category เป็น object
  }

  async update(id: string, updateShopDto: UpdateShopDto) : Promise<Shop | null> {
    const result = await this.shopModel.findByIdAndUpdate(id, updateShopDto, { returnDocument: 'after' }).exec();
    return result;
  }

  // async remove(id: string) { // ปิดไว้ก่อนกัน user ทั่วไปลบได้
  //   const result = await this.shopModel.findByIdAndDelete(id)
  //   if (!result) {
  //       throw new NotFoundException('id not found');
  //   }
  //   return { message: 'Deleted!' };
  // }
}
