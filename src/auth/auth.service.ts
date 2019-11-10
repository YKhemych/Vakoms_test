import { Injectable } from '@nestjs/common';
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
      return null;
    }
  }

  async login(user: any): Promise<{accessToken: string}> {
    const payload = { email: user.user_email, userId: user.user_id };
    const accessToken = await this.jwtService.sign(payload);
    return { accessToken };
  }

  async resetPassword(email: string): Promise<string> {
    const payload = { email };
    const token = await this.jwtService.sign(payload);
    return token;
  }

  async decode(token: string): Promise<string> {
    return JSON.parse(JSON.stringify(await this.jwtService.decode(token))).email;
  }
}
