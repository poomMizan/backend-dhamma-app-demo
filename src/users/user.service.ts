/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  Injectable,
  NotAcceptableException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
import { CreateUserDTO, LoginUserDTO } from './user.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) readonly userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async getUsers(): Promise<User[] | undefined> {
    return await this.userRepository.find();
  }

  async register(data: CreateUserDTO): Promise<User> {
    data.password = await bcrypt.hash(data.password, 12);
    const user: User = await this.userRepository.save(data);
    if (!user) {
      throw new NotAcceptableException();
    }
    delete user.password;
    return user;
  }

  async getUserByEmail(email: string): Promise<User> {
    const user: User = await this.userRepository.findOne({
      where: { email },
    });
    if (!user) {
      throw new NotFoundException(`ไม่พบข้อมูลผู้ใช้จากอีเมล์ - ${email}`);
    }
    return user;
  }

  async checkPassword(user: User, plainInputPassword: string): Promise<string> {
    //
    if (!(await bcrypt.compare(plainInputPassword, user.password))) {
      throw new BadRequestException(`รหัสผ่านไม่ถูกต้อง`);
    }
    return await this.jwtService.signAsync({
      id: user.id,
      permission: user.permission,
    });
  }

  async login(data: LoginUserDTO): Promise<string> {
    const user: User = await this.getUserByEmail(data.email);
    return await this.checkPassword(user, data.password);
  }

  async adminLogin(data: LoginUserDTO): Promise<string> {
    const admin: User = await this.getUserByEmail(data.email);
    if (admin.permission !== 1) {
      throw new UnauthorizedException('อนุญาตเฉพาะแอดมินเท่านั้น');
    }
    return await this.checkPassword(admin, data.password);
  }

  async isLoggedIn(cookie: string): Promise<object | undefined> {
    const data: { id: number; email: string; permisson: number } | undefined =
      await this.jwtService.verifyAsync(cookie);
    if (!data) {
      throw new UnauthorizedException();
    }
    const user: User | undefined = await this.getUserByEmail(data.email);
    if (!user) {
      throw new UnauthorizedException();
    }
    const { username } = user;
    return { username };
  }

  async isAdminLoggedIn() {
    //
  }

  async getUserFromJWT(jwt: string) {
    try {
      return await this.jwtService.verifyAsync(jwt);
    } catch (err) {
      throw new UnauthorizedException(
        'Invalid cookie provided. Try to logout then login again. : ' + err,
      );
    }
  }
}
