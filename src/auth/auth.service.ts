import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { getRepository } from 'typeorm';
import { User } from '../users/user.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await getRepository(User)
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getRawOne();

    const isSame = await bcrypt.compare(pass, user.password);
    if (user && isSame) {
      return user;
    } else {
      throw new HttpException('Password is wrong', HttpStatus.CONFLICT);
    }
  }

  async login(user: any): Promise<{status: number, accessToken: string}> {
    const payload = { email: user.user_email, userId: user.user_id };
    const accessToken = await this.jwtService.sign(payload);
    return { status: 200, accessToken };
  }

  async resetPassword(email: string): Promise<string> {
    const payload = { email };
    const token = await this.jwtService.sign(payload);
    return token;
  }

  async decode(token: string): Promise<string> {
    const obj = JSON.parse(JSON.stringify(await this.jwtService.decode(token)));
    if (!obj) {
      throw new HttpException('Token is wrong', HttpStatus.CONFLICT);
    }
    return obj.email;
  }
}
