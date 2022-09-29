/* eslint-disable prettier/prettier */
import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AuthAdminMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const noCookie =
      'คุ๊กกี้ที่แนบมานั้นไม่ถูกต้องหรือคุ๊กกี้อาจหมดอายุ โปรดออกจากระบบและทำการล็อคอินใหม่อีกครั้ง';
    const cookie = req.cookies['jwt'];
    try {
      const user = await this.jwtService.verifyAsync(cookie);
      if (user.permission != 1) {
        throw new UnauthorizedException('อนุญาตเฉพาะแอดมินเท่านั้น');
      }
      next();
    } catch (err) {
      throw new UnauthorizedException(noCookie + ' : ' + err);
    }
  }
}
