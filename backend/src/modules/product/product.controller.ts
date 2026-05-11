import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('shop/:shopId')
  findByShop(@Param('shopId') shopId: string) {
    return this.productService.findByShop(shopId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('search')
  searchName(@Query('name') text: string, @Query('shopId') shopId: string) {
    return this.productService.findByName(text, shopId);
  }
  
  @UseGuards(JwtAuthGuard)
  @Get('category')
  searchCategory(@Query('category') text: string) {
    return this.productService.findByCategory(text);
  }

  @UseGuards(JwtAuthGuard)
  @Get('check')
  searchCode(@Query('code') code: string, @Query('shopId') shopId: string) {
    return this.productService.findByCode(code, shopId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('remove')
  removeProducts(@Body('ids') ids: string[]) {
    return this.productService.removeProducts(ids);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productService.update(id, updateProductDto);
  }
}
