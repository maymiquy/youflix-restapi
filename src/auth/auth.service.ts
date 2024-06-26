import { PrismaService } from '../libs/prisma/prisma.service';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import jwt from '../utils/constant';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { LoginDto } from './dto/login.dto';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService
  ) {}

  async signIn(
    loginDto: LoginDto,
    req: Request,
    res: Response
  ): Promise<Response | string | null | undefined> {
    const { email, password } = loginDto;

    const loginUser = await this.prismaService.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!loginUser?.email)
      throw new UnauthorizedException({
        message: 'Cannot login, email not registered',
      });

    const comparasion = await this.comparePasswords({
      password,
      hash: loginUser.password,
    });

    if (!comparasion) {
      throw new BadRequestException('Wrong credentials');
    }

    const token = await this.signToken({
      id: loginUser.id,
      email: loginUser.email,
    });

    if (!token) {
      throw new ForbiddenException('Something went wrong, please try again');
    }

    const expiresAt = new Date(Date.now() + Number(jwt.expires) * 60 * 1000);

    return res.cookie('token', token, {
      expires: expiresAt,
    });
  }

  async signUp(registerDto: RegisterDto): Promise<User | RegisterDto> {
    const { fullName, email, password } = registerDto;

    const userExist = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });

    if (userExist) throw new Error('User already exist');

    const hashedPassword = await bcrypt.hash(password, 12);

    return await this.prismaService.user.create({
      data: {
        fullName,
        email,
        password: hashedPassword,
      },
    });
  }

  async signOut(req: Request, res: Response): Promise<Response> {
    return res.clearCookie('token');
  }

  async comparePasswords(args: {
    hash: string;
    password: string;
  }): Promise<any> {
    return await bcrypt.compare(args.password, args.hash);
  }

  async signToken(args: {
    id: string;
    email: string;
  }): Promise<string | null | undefined> {
    const payload = {
      id: args.id,
      email: args.email,
    };

    return this.jwtService.sign(payload, {
      secret: jwt.secret,
    });
  }
}
