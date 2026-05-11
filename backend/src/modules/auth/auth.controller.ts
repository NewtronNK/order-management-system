import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Res, Put, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ChangePasswordDto } from './dto/change-password.dto';
import { GoogleAuthGuard } from './google-auth.guard';
import { ChangeNameDto } from './dto/change-name.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req, @Res({ passthrough: true }) res) {
    // console.log(res.user.username);
    const { accessToken } = await this.authService.login(req.user);
    // save to cookie
    res.cookie('access_token', accessToken, {
      httpOnly: true,
    });
    return { message: 'Login successful' };
  }

  @UseGuards(JwtAuthGuard)
  @Put('changepassword')
  async changePassword(@Body() changePasswordDto: ChangePasswordDto, @Request() req,) {
    return this.authService.changePassword(
      req.user.userId,
      changePasswordDto.oldPassword,
      changePasswordDto.newPassword,
    )
  }

  @UseGuards(JwtAuthGuard)
  @Put('changename')
  async changeName(@Body() changeNameDto: ChangeNameDto, @Request() req,) {
    return this.authService.changeName(
      req.user.userId,
      // changeNameDto.password,
      changeNameDto.name
    )
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth(@Request() req) {
    // ปล่อยว่างได้
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(@Request() req, @Res({ passthrough: true }) res) {
    const { accessToken, user } = await this.authService.googleLogin(req);
    console.log('success');
    res.cookie('access_token', accessToken, {
      httpOnly: true,
    });
    return res.redirect(`http://localhost:5173/home/?userId=${user._id}`);
  }
  
  // for not required real-time data
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req) {
    return req.user;
  }

  @Get('logout')
  async logout(@Request() req, @Res({ passthrough: true }) res) {
    res.clearCookie('access_token', {
      httpOnly: true,
    });
    return res.json({ message: 'Successfully logged out' });
  }
}
