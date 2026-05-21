import {
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ControllerWithGuard } from '../auth/controller-with-guard.decorator';

@ControllerWithGuard('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.orderService.create(createOrderDto);
  }

  @Get()
  findAll() {
    return this.orderService.findAll();
  }

  @Get('shop/:shopId')
  findByShop(@Param('shopId') shopId: string) {
    return this.orderService.findByShop(shopId);
  }

  @Get('search')
  searchOrder(
    @Query()
    query: {
      text?: string;
      shopId?: string;
      startDate?: string;
      endDate?: string;
      status?: string;
    },
  ) {
    return this.orderService.findByOrder(query);
  }

  @Get('filter')
  filterOrder(@Query('status') text: string, @Query('shopId') shopId: string) {
    return this.orderService.filterOrder(text, shopId);
  }

  @Patch('remove')
  removeOrders(@Body('ids') ids: string[]) {
    return this.orderService.removeOrders(ids);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.orderService.update(id, updateOrderDto);
  }
}
