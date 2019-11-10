import { HttpException, Injectable, HttpStatus } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { CreateUserDTO, UpdatePasswordDTO, UpdateUserDTO } from './dto/user.dto';
import { IUser } from './interfaces/user.interface';
import * as bcrypt from 'bcrypt';
import { MailerService } from '@nest-modules/mailer';
import { mailSettings } from '../config/mailer.config';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly mailerService: MailerService,
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

  async sendEmail(email: string, token: string) {
    await this
      .mailerService
      .sendMail({
        to: email,
        from: mailSettings.email,
        subject: 'Reset password',
        html: `<b>If you want to reset your password. It's your token ${token}</b>`,
      })
      .catch((e) => console.log(e));
  }

  async updatePassword(id: number, data: UpdatePasswordDTO): Promise<IUser> {
    data.password = await bcrypt.hash(data.password, 10);
    return this.userRepository.save({ ...data, id: Number(id) });
  }

  async checkUserByEmail(email: string): Promise<void> {
    const userFromDB = await this.userRepository.findOne({ email });
    if (!userFromDB) {
      throw new HttpException('User with this email does not exist', HttpStatus.NOT_FOUND);
    }
  }
}
