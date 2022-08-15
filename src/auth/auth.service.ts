import * as argon from 'argon2';
import { AuthDto } from "./dto";
import {Injectable} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable({})
export class AuthService {
	constructor(private prisma: PrismaService){}

	signin()
	{
		return 'I am Service Signin';
	}
	
	async signup(dto: AuthDto)
	{
		const hash = await argon.hash(dto.password);

		const user = await this.prisma.user.create({
			data: {
				email: dto.email,
				hash: hash
			}
		})

		delete user.hash;

		return user;
	}
}