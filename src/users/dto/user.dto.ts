import {ApiModelProperty} from '@nestjs/swagger';
import {IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDTO {

  @IsEmail()
  @IsNotEmpty()
  @ApiModelProperty()
  readonly email: string;

  @IsString()
  @IsNotEmpty()
  @ApiModelProperty()
  readonly firstName: string;

  @IsString()
  @IsNotEmpty()
  @ApiModelProperty()
  readonly lastName: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @ApiModelProperty()
  readonly password: string;
}
