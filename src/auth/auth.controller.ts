import { Controller, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';

// global prefix 'auth', POST /auth/signup or /auth/signin
@Controller('auth')
export class AuthController {
    constructor( private authService : AuthService ) {}

    @Post('signup')
    signup(@Req() req: Request) 
    {
        console.log(req.body); // this is request object from express
        
        return this.authService.signup();
    }


    @Post('signin')
    signin() 
    {
        return this.authService.signin();
    }
}
