import * as argon from 'argon2';
import { AuthDto } from "./dto";
import {ForbiddenException, Injectable} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';

@Injectable({})
export class AuthService {
	constructor(private prisma: PrismaService){}

	signin()
	{
		return 'I am Service Signin';
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
	
			delete user.hash;
	
			return user;
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
}