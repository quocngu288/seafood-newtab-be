import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { getAdminCredentials } from '../config/app-config';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  login(dto: LoginDto) {
    const { username, password } = getAdminCredentials(this.configService);

    if (dto.username !== username || dto.password !== password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.jwtService.sign({
      sub: username,
      username,
    });

    return {
      accessToken: token,
      username,
    };
  }

  me(user: { username: string }) {
    return { username: user.username };
  }
}
