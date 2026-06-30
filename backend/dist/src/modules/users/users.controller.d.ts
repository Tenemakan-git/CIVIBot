import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
export declare class UsersController {
    private service;
    constructor(service: UsersService);
    getMe(user: any): any;
    updateMe(user: any, dto: UpdateUserDto): Promise<{
        role: {
            id: string;
            nom: string;
            description: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        nom: string;
        email: string;
        prenom: string;
        telephone: string | null;
        passwordHash: string;
        langue: string;
        statut: string;
        roleId: string;
        updatedAt: Date;
    }>;
    changePassword(user: any, dto: ChangePasswordDto): Promise<{
        message: string;
    }>;
}
export declare class AdminUsersController {
    private service;
    constructor(service: UsersService);
    findAll(): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        nom: string;
        role: {
            id: string;
            nom: string;
            description: string | null;
        };
        email: string;
        prenom: string;
        telephone: string | null;
        langue: string;
        statut: string;
        roleId: string;
        updatedAt: Date;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        createdAt: Date;
        nom: string;
        role: {
            id: string;
            nom: string;
            description: string | null;
        };
        email: string;
        prenom: string;
        telephone: string | null;
        langue: string;
        statut: string;
        roleId: string;
        updatedAt: Date;
    }>;
    update(id: string, dto: UpdateUserDto): Promise<{
        role: {
            id: string;
            nom: string;
            description: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        nom: string;
        email: string;
        prenom: string;
        telephone: string | null;
        passwordHash: string;
        langue: string;
        statut: string;
        roleId: string;
        updatedAt: Date;
    }>;
    suspend(id: string): Promise<{
        id: string;
        createdAt: Date;
        nom: string;
        email: string;
        prenom: string;
        telephone: string | null;
        passwordHash: string;
        langue: string;
        statut: string;
        roleId: string;
        updatedAt: Date;
    }>;
    activate(id: string): Promise<{
        id: string;
        createdAt: Date;
        nom: string;
        email: string;
        prenom: string;
        telephone: string | null;
        passwordHash: string;
        langue: string;
        statut: string;
        roleId: string;
        updatedAt: Date;
    }>;
}
