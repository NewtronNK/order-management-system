import { Get, Post, Body, Patch, Param, Delete, Query, Req } from '@nestjs/common';
import { ShopService } from './shop.service';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { ControllerWithGuard } from '../auth/controller-with-guard.decorator';

@ControllerWithGuard('shop')
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  @Post()
  create(@Body() createShopDto: CreateShopDto) {
    return this.shopService.create(createShopDto);
  }


  
  // ลองเอาไปถามว่าถ้าใส่แบบนี้จะได้ข้อมูลเฉพาะของ user นั้นไหม
  @Get('search')
  searchName(@Query('name') text: string) {
    return this.shopService.findByName(text);
  }

  @Get('category')
  searchCategory(@Query('category') text: string) {
    return this.shopService.findByCategory(text);
  }

  @Get('my')
  findMine(@Req() req: any) {
    const userId = req.user?.userId;
    return this.shopService.findByOwner(userId);
  }

  @Get(':id')
  getId(@Param('id') id: string) {
    return this.shopService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateShopDto: UpdateShopDto) {
    return this.shopService.update(id, updateShopDto);
  }
}
