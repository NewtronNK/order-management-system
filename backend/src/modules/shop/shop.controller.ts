import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Req, UseGuards } from '@nestjs/common';
import { ShopService } from './shop.service';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('shop')
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  @Post()
  create(@Body() createShopDto: CreateShopDto) {
    return this.shopService.create(createShopDto);
  }


  
  @UseGuards(JwtAuthGuard) // ลองเอาไปถามว่าถ้าใส่แบบนี้จะได้ข้อมูลเฉพาะของ user นั้นไหม
  @Get('search')
  searchName(@Query('name') text: string) {
    return this.shopService.findByName(text);
  }

  @UseGuards(JwtAuthGuard)
  @Get('category')
  searchCategory(@Query('category') text: string) {
    return this.shopService.findByCategory(text);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my')
  findMine(@Req() req: any) {
    const userId = req.user?.userId;
    return this.shopService.findByOwner(userId);
  }

  // @UseGuards(JwtAuthGuard)
  @Get(':id')
  getId(@Param('id') id: string) {
    return this.shopService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateShopDto: UpdateShopDto) {
    return this.shopService.update(id, updateShopDto);
  }
}
