import { Controller, Post, Body, HttpStatus } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { ApiResponse } from '@nestjs/swagger';
import { CreateUserDTO } from './dto/user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {

  constructor(
    private readonly usersService: UsersService,
  ) { }

  @Post('register')
  @ApiResponse({ status: 201, description: 'Success ```{ statusCode: 201, message: "Create was successful"}```'})
  @ApiResponse({ status: 400, description: 'Error Exception ```{ statusCode: 400, message: "Bad request" }```' })
  @ApiResponse({ status: 409, description: 'Error Exception ```{ statusCode: 409, message: "User with this email already exist" }```' })
  async register(@Body() user: CreateUserDTO): Promise<Object> {
    const createdUser = await this.usersService.addUserToDB(user);
    if (createdUser) {
      return {
        statusCode: 201,
        message: 'Create was successful',
        objectId: createdUser.id,
      };
    }
  }

}
