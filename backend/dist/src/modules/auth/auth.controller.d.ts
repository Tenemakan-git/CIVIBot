import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthController {
    private auth;
    constructor(auth: AuthService);
    register(dto: RegisterDto): Promise<{
        user: {
            role: {
                id: string;
                nom: string;
                description: string | null;
            };
            id: string;
            createdAt: Date;
            nom: string;
            email: string;
            prenom: string;
            telephone: string | null;
            langue: string;
            statut: string;
            roleId: string;
            updatedAt: Date;
        };
        token: string;
    }>;
    login(dto: LoginDto): Promise<{
        user: {
            role: {
                id: string;
                nom: string;
                description: string | null;
            };
            id: string;
            createdAt: Date;
            nom: string;
            email: string;
            prenom: string;
            telephone: string | null;
            langue: string;
            statut: string;
            roleId: string;
            updatedAt: Date;
        };
        token: string;
    }>;
    me(user: any): any;
}
