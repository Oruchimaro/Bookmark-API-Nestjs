import {Injectable} from "@nestjs/common";

@Injectable({})
export class AuthService {
    signin()
    {
        return 'I am Service Signin';
    }

    signup()
    {
        return {message: " I am service Singuyp"}
    }
}