import {
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
} from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

import { ControllerWithGuard } from '../auth/controller-with-guard.decorator';

@ControllerWithGuard('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  create(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customerService.createCustomer(createCustomerDto);
  }

  @Get('search')
  search(@Query() query: any) {
    return this.customerService.searchCustomers(query);
  }
}
