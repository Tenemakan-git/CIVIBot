import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../prisma/prisma.service';
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private prisma;
    constructor(prisma: PrismaService, config: ConfigService);
    validate(payload: {
        sub: string;
    }): Promise<{
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
}
export {};
