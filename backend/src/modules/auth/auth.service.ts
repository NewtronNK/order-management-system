import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { User, UserDocument } from '../user/schemas/user.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcrypt'


@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.userService.findbyUsername(username);

    if (user && (await bcrypt.compare(password, user.password))) {
      const result = user.toObject();
      return {
        username: result.username,
        name: result.name,
        userId: result._id,
        havePassword: result.password != null,
      };
    }
    return null;
  }

   async login(user: any) {
    const payload = { username: user.username, name: user.name, sub: user.userId, pass: user.havePassword };
    
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  async changePassword(userId, oldPassword: string, newPassword: string) {
      const user = await this.userService.findOne(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (!user.password) {
        user.password = await bcrypt.hash(newPassword, 10);
        this.userService.update(userId, user);  
        return { message: 'Update password successful'};
      }

      const passwordMatch = await bcrypt.compare(oldPassword, user.password);
      if (!passwordMatch) {
        throw new UnauthorizedException('Old Password mismacthed');
      }

      const newHashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = newHashedPassword;
      this.userService.update(userId, user);      
      return { message: 'Change password successful'};
  }

  async changeName(userId, name: string) {
      const user = await this.userService.findOne(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // if (!user.password) {
      //   user.password = await bcrypt.hash(password, 10);
      //   this.userService.update(userId, user);  
      // }

      // const passwordMatch = await bcrypt.compare(password, user.password);
      // if (!passwordMatch) {
      //   throw new UnauthorizedException('Password mismacthed');
      // }

      user.name = name;
      this.userService.update(userId, user);      
      return { message: 'Change name successful'};
  }

  async googleLogin(req): Promise<any> {
    if (!req.user) {
      throw new Error('Google login failed: No user information received');
    }

    const { username, name, picture, googleId } = req.user;
    let user = await this.userModel.findOne({ username });

    if (!user) {
        user = new this.userModel({
          username, name, picture, googleId,
        });
        await user.save();
    }

    const payload = { username: user.username, sub: user._id, name: user.name };

    return {
      accessToken: this.jwtService.sign(payload),
      user,
    }
  }

}
