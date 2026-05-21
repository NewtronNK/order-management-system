import { Get, Post, Body, Param, Request } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ControllerWithGuard } from '../auth/controller-with-guard.decorator';
import { Public } from '../auth/public.decorator';

@ControllerWithGuard('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Public()
  @Post('register')
  async create(@Body() createUserDto: CreateUserDto, @Request() req) {
    const user = await this.userService.findbyUsername(createUserDto.username);

    if (user) {
      return { message: 'This user already exists' };
    }
    return this.userService.create(createUserDto);
  }

  @Get('profile')
  async getProfile(@Request() req) {
    const user = await this.userService.findbyUsername(req.user.username);
    return user;
  }
}
