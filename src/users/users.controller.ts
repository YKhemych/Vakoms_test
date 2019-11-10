import { Controller, Post, Body, HttpStatus, HttpException, Get, Param, UseGuards, Put, Request } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { ApiResponse, ApiUseTags, ApiImplicitParam, ApiBearerAuth } from '@nestjs/swagger';
import { CreateUserDTO, ForgotEmailDTO, UpdatePasswordDTO, UpdateUserDTO, UserLoginDTO } from './dto/user.dto';
import { UsersService } from './users.service';
import { IUser } from './interfaces/user.interface';
import { AuthGuard } from '@nestjs/passport';

@ApiUseTags('users')
@Controller('users')
export class UsersController {

  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
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

  @Post('login')
  @ApiResponse({ status: 200, description: 'Success ```{ statusCode: 200, accessToken: generated JWT token```' })
  @ApiResponse({ status: 400, description: 'Error Exception ```{ statusCode: 400, message: "Bad request" }```' })
  @ApiResponse({ status: 404, description: 'Error Exception ```{ statusCode: 404, message: "User with this email does not exist" }```' })
  @ApiResponse({ status: 409, description: 'Error Exception ```{ statusCode: 409, error: "Password is wrong" }```' })
  async login(@Body() user: UserLoginDTO): Promise<Object> {
    await this.usersService.checkUserByEmail(user.email);
    const checkedUser = await this.authService.validateUser(user.email, user.password);
    return await this.authService.login(checkedUser);
  }

  @Put()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Success ```{ statusCode: 200, message: "Update was successful"}```' })
  @ApiResponse({ status: 400, description: 'Error Exception ```{ statusCode: 400, message: "Bad request" }```' })
  @ApiResponse({ status: 401, description: 'Error Exception ```{ statusCode: 401, message: "Unauthorized" }```' })
  async updateUser(@Body() user: UpdateUserDTO, @Request() req): Promise<Object> {
    if (await this.usersService.updateUser(req.user.userId, user) ) {
      return {
        statusCode: 200,
        message: 'Update was successful',
      };
    }
  }

  @Post('forgot/:email')
  @ApiResponse({ status: 400, description: 'Error Exception ```{ statusCode: 400, message: "Bad request" }```' })
  @ApiResponse({ status: 404, description: 'Error Exception ```{ statusCode: 404, message: "User with this email does not exist" }```' })
  async forgotPassword(@Body() obj: ForgotEmailDTO) {
    await this.usersService.checkUserByEmail( obj.email);
    const token = await this.authService.resetPassword(obj.email);
    await this.usersService.sendEmail(obj.email, token);
  }

  @Put('reset/:token')
  @ApiImplicitParam({ name: 'token', type: String })
  async resetPassword(@Param('token') token: string, @Body() user: UpdatePasswordDTO) {
    const email = await this.authService.decode(token);
    await this.usersService.checkUserByEmail( email);
    if (user.password !== user.confirmPassword) {
      throw new HttpException('Confirmed password is wrong', HttpStatus.BAD_REQUEST);
    }
    const userFromDB = await this.usersService.getOneByParams({email});
    if (await this.usersService.updatePassword(userFromDB.id, user)) {
      return {
        statusCode: 200,
        message: 'Update was successful',
      };
    }
  }

  @Get(':id')
  @ApiImplicitParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'User Object'})
  @ApiResponse({ status: 404, description: 'Error Exception ```{ statusCode: 404, message: "Not found" }```' })
  getOneById(@Param('id') id: number): Promise<IUser> {
    return this.usersService.getOneByParams({ id });
  }

  @Get()
  @ApiResponse({ status: 200, description: 'List of Users'})
  getAll(): Promise<IUser[]> {
    return this.usersService.getAll();
  }
}
