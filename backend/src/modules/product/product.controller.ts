import { Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ControllerWithGuard } from '../auth/controller-with-guard.decorator';

@ControllerWithGuard('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto);
  }

  @Get('shop/:shopId')
  findByShop(@Param('shopId') shopId: string) {
    return this.productService.findByShop(shopId);
  }

  @Get('search')
  searchName(
    @Query('name') text: string, 
    @Query('shopId') shopId: string,
    @Query('categoryId') categoryId: string,
    @Query('sortBySoldAmount') sortBySoldAmount: string
  ) {
    return this.productService.findByName(text, shopId, categoryId, sortBySoldAmount);
  }
  
  @Get('category')
  searchCategory(@Query('category') text: string) {
    return this.productService.findByCategory(text);
  }

  @Get('check')
  searchCode(@Query('code') code: string, @Query('shopId') shopId: string) {
    return this.productService.findByCode(code, shopId);
  }

  @Patch('remove')
  removeProducts(@Body('ids') ids: string[]) {
    return this.productService.removeProducts(ids);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productService.update(id, updateProductDto);
  }
}
