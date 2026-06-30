import { PrismaService } from '../../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
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
    changePassword(id: string, dto: ChangePasswordDto): Promise<{
        message: string;
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
