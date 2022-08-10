import {Injectable} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable({})
export class AuthService {
    constructor(private prisma: PrismaService){}

    signin()
    {
        return 'I am Service Signin';
    }

    signup()
    {
        return {message: " I am service Singuyp"}
    }
}
