import { HttpException, Injectable, HttpStatus } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { CreateUserDTO, UpdateUserDTO } from './dto/user.dto';
import { IUser } from './interfaces/user.interface';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async addUserToDB(user: CreateUserDTO): Promise<IUser> {
    const email = user.email;
    const userFromDB = await this.getOneByParams({ email });
    if (userFromDB) {
      throw new HttpException('User with this email already exist', HttpStatus.CONFLICT);
    }
    const entity = Object.assign(new User(), user);
    return await this.userRepository.save(entity);
  }

  async getOneByParams(params: object): Promise<IUser> {
    return await this.userRepository.findOne(params);
  }

  async getAll(): Promise<IUser[]> {
    return await this.userRepository.find();
  }

  async updateUser(id: number, data: UpdateUserDTO ): Promise<IUser> {
    return await this.userRepository.save({ ...data, id: Number(id) });
  }
}
