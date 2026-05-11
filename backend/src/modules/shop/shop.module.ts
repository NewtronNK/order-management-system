import { Module } from '@nestjs/common';
import { ShopService } from './shop.service';
import { ShopController } from './shop.controller';
import { Shop, ShopSchema } from './schemas/shop.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
      MongooseModule.forFeature([
        {
        name: Shop.name,
        schema: ShopSchema,
        },
      ]),
    UserModule
  ],
  controllers: [ShopController],
  providers: [ShopService],
  exports: [ShopService]
})
export class ShopModule {}
