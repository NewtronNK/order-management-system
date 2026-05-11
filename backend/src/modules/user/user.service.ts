import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}
  async create(createUserDto: CreateUserDto) : Promise<User> {
    const newUser = new this.userModel(createUserDto);
    return newUser.save();
  }

  async findOne(id: string) : Promise<User | null> {
    return this.userModel.findById(id).lean();
  }

  async findbyUsername(username: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ username }).exec();
  }

  async update(id: string, updateUserDto: UpdateUserDto) : Promise<User | null> {
    return this.userModel.findByIdAndUpdate(id, updateUserDto, { returnDocument: 'after' }).exec();
  }

}
