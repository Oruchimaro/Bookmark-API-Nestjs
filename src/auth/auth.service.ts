import * as argon from 'argon2';
import { AuthDto } from "./dto";
import {ForbiddenException, Injectable} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable({})
export class AuthService {
	constructor(
		private prisma: PrismaService, 
		private jwt: JwtService,
		private config: ConfigService
		){}

	async signin(dto: AuthDto)
	{
		try {
			const user = await this.prisma.user.findFirst({
				where: {
					email: dto.email
				},
			});

			if(!user) throw new ForbiddenException('Not Found');

			const pwMatches = await argon.verify(user.hash, dto.password);

			if(!pwMatches) throw new ForbiddenException('Credentials Incorrect');

			return  this.signToken(user.id, user.email);
		} catch (error) {
			throw error
		}
	}
	
	async signup(dto: AuthDto)
	{
		try {
			const hash = await argon.hash(dto.password);
	
			const user = await this.prisma.user.create({
				data: {
					email: dto.email,
					hash: hash
				}
			})
	
			return  this.signToken(user.id, user.email);
		} catch (error) {
			if (error instanceof PrismaClientKnownRequestError)
			{
				if(error.code === 'P2002')
				{
					throw new ForbiddenException('Credentials Taken');
				}
			}

			throw error;
		}
	}

	async signToken(userId: number , email: string) : Promise<{ access_token: string }>
	{
		const payload = {
			sub: userId, 
			email
		};

		const secret = this.config.get('JWT_SECRET');
		const time = this.config.get('JWT_EXPIRE_TIME');

		const token = await this.jwt.signAsync(payload, {
			expiresIn: time,
			secret: secret
		});

		return {
			access_token: token
		};
	}
}