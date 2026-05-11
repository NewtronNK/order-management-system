import { Controller, Get, Post, Body, Param, Request, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async create(@Body() createUserDto: CreateUserDto, @Request() req) {
    const user = await this.userService.findbyUsername(createUserDto.username);

    if (user) {
      return { message: 'This user already exists' };
    }
    return this.userService.create(createUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    const user = await this.userService.findbyUsername(req.user.username);
    return user;
  }
}
