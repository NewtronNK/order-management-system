import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category, CategoryDocument } from './schemas/category.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ShopService } from '../shop/shop.service';

@Injectable()
export class CategoryService {
  constructor(
        @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
        private shopService: ShopService
    ) {}
  async create(createCategoryDto: CreateCategoryDto) : Promise<Category> {
    const shopResult = await this.shopService.findOne(createCategoryDto.shopId);
    
    if (!shopResult) {
      throw new NotFoundException('shop not found')
    }
    
    const result = new this.categoryModel(createCategoryDto);
    return result.save();
  }

  async findAll(): Promise<Category[]> {
    return this.categoryModel.find().exec();
  }

  findOne(id: string) {
    return `This action returns a #${id} category`;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) : Promise<Category | null> {
    const result = await this.categoryModel.findByIdAndUpdate(id, updateCategoryDto, { returnDocument: 'after' }).exec();
    return result;
  }

  async remove(id: string) {
    const result = await this.categoryModel.findByIdAndDelete(id)
    if (!result) {
        throw new NotFoundException('id not found');
    }
    return { message: 'Deleted!' };
  }
}
