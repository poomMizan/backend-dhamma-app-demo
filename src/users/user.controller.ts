/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from './user.entity';
import { UserService } from './user.service';
import { Request } from 'express';
// import { ClearCookieResponse, IGetUserAuthInfoRequest } from './getUserAuthInfoRequest';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('getusers')
  async getUsers(): Promise<User[]> {
    // console.log('controller.gerUsers()');
    return await this.userService.getUsers();
  }

  @Post('register')
  async register(
    @Body('username') username: string,
    @Body('email') email: string,
    @Body('password') password: string,
  ): Promise<User | undefined> {
    return await this.userService.register({ username, email, password });
  }

  @Post('login')
  async login(
    @Body('email') email: string,
    @Body('password') password: string,
    @Res({ passthrough: true }) response: any,
  ): Promise<object | undefined> {
    const jwt: string | undefined = await this.userService.login({
      email,
      password,
    });
    response.cookie('jwt', jwt /*{ httpOnly: true }*/);
    return {
      message: 'success',
    };
  }

  @Post('admin_login')
  async adminLogin(
    @Body('email') email: string,
    @Body('password') password: string,
    @Res({ passthrough: true }) response: any,
  ): Promise<object> {
    if (!email || email == '' || !password || password == '') {
      throw new BadRequestException('โปรดใส่ email และ password ให้ครบ');
    }
    const jwt: any = await this.userService.adminLogin({
      email,
      password,
    });
    response.cookie('jwt', jwt);
    return { message: 'admin login success' };
  }

  @Post('is_logged_in')
  async isLoggedIn(@Req() request: Request): Promise<object | undefined> {
    try {
      const cookie: string | undefined = request.cookies['jwt'];
      return await this.userService.isLoggedIn(cookie);
    } catch (err) {
      throw new UnauthorizedException(err);
    }
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) response: any): Promise<object> {
    response.clearCookie('jwt');
    return {
      message: 'logout complete',
    };
  }
}
