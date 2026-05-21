
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      // jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), for manual accessToken กดมือไม่งั้นแตก
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request) => {
          return request?.cookies?.access_token;
        }
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET')!, // ไม่มี <> กับ ! = error (meaning confirm 100% JWT_SECRET is string and not null)
    });
  }

  async validate(payload: any) {
    // console.log(payload.sub);
    return { userId: payload.sub, name: payload.name, username: payload.username, havePassword: payload.pass };
  }
}
