import {Injectable} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AuthDto } from "./dto";

@Injectable({})
export class AuthService {
    constructor(private prisma: PrismaService){}

    signin()
    {
        return 'I am Service Signin';
    }

    signup(dto: AuthDto)
    {
        return {message: " I am service Singuyp"}
    }
}
