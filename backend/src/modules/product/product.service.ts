import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product, ProductDocument } from './schemas/product.schema';
import { ShopService } from '../shop/shop.service';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class ProductService {
  constructor(
      @InjectModel(Product.name) private productModel: Model<ProductDocument>,
      private shopService: ShopService
    ) {}

  async create(createProductDto: CreateProductDto) : Promise<Product> {
      const shopResult = await this.shopService.findOne(createProductDto.shopId);
  
      if (!shopResult) {
        throw new NotFoundException('shop not found')
      }
  
      const result = new this.productModel(createProductDto);
      return result.save();
    }

  async findAll() : Promise<Product[]> {
    return this.productModel.find({ isDeleted: { $ne: true } }).exec();
  }

  async findByShop(shopId: string): Promise<Product[]> {
      return this.productModel.find({ shopId, isDeleted: { $ne: true } }).exec();
  }

  async findByName(texts: string, shopId?: string) : Promise<Product[] | null> {  
    if (!texts || texts.trim() === '') {
      return shopId ? this.findByShop(shopId) : this.findAll();
    }
    
    const pipeline: any[] = [
      {
        $search: {
          index: 'name',
          autocomplete: {
            query: texts,
            path: 'name'
          }
        }
      }
    ];
  
    pipeline.push({
      $match: {
        shopId: shopId,
        isDeleted: { $ne: true }
      }
    });
    
    return this.productModel.aggregate(pipeline); // วิธีนี้เร็วที่สุด (Atlas)
  }

  async findByCategory(texts: string) : Promise<Product[] | null> {  
    if (!texts || texts.trim() === '') {
      return this.findAll();
    }
      return this.productModel.aggregate([{
        $search: {
            index: 'default',
            autocomplete : {
              query: texts,
              path: 'category'
            }
          }
      }]); // เดี๋ยวอาจมาได้แก้ เพราะ category เป็น object
    }
  
  async findByCode(code: string, shopId: string) : Promise<boolean> {
    const result = await this.productModel.findOne({ shopId: shopId, productCode: code, 
      isDeleted: { $ne: true } }).exec();
    console.log(result)
    // this มันนับ every shop   
    if (!result ) { return false; }
    return true;
  }

  async update(id: string, updateProductDto: UpdateProductDto) : Promise<Product | null> {
      const result = await this.productModel.findByIdAndUpdate(id, updateProductDto, { returnDocument: 'after' }).exec();
      return result;
  }

  async removeProducts(ids: string[]) {
    const result = await this.productModel.updateMany(
      { _id: { $in: ids } },
      { $set: { isDeleted: true } }
    );
    return { message: 'Deleted!', result };
  }
}
