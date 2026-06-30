import { PrismaService } from '../../prisma/prisma.service';
export declare class FaqController {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(procedureId?: string): import("@prisma/client").Prisma.PrismaPromise<({
        procedure: {
            id: string;
            titre: string;
            actif: boolean;
            createdAt: Date;
            description: string;
            updatedAt: Date;
            categorieId: string;
            cout: string | null;
            delai: string | null;
            eligibilite: string | null;
            resume: string | null;
        } | null;
    } & {
        id: string;
        reponse: string;
        question: string;
        procedureId: string | null;
    })[]>;
    create(body: {
        question: string;
        reponse: string;
        procedureId?: string;
    }): import("@prisma/client").Prisma.Prisma__FaqClient<{
        id: string;
        reponse: string;
        question: string;
        procedureId: string | null;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    update(id: string, body: any): import("@prisma/client").Prisma.Prisma__FaqClient<{
        id: string;
        reponse: string;
        question: string;
        procedureId: string | null;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    remove(id: string): import("@prisma/client").Prisma.Prisma__FaqClient<{
        id: string;
        reponse: string;
        question: string;
        procedureId: string | null;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
export declare class SourcesController {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(procedureId?: string): import("@prisma/client").Prisma.PrismaPromise<({
        procedure: {
            id: string;
            titre: string;
            actif: boolean;
            createdAt: Date;
            description: string;
            updatedAt: Date;
            categorieId: string;
            cout: string | null;
            delai: string | null;
            eligibilite: string | null;
            resume: string | null;
        } | null;
    } & {
        url: string | null;
        id: string;
        organisme: string;
        procedureId: string | null;
        dateMiseAJour: Date | null;
    })[]>;
    create(body: {
        organisme: string;
        url?: string;
        procedureId?: string;
        dateMiseAJour?: string;
    }): import("@prisma/client").Prisma.Prisma__SourceClient<{
        url: string | null;
        id: string;
        organisme: string;
        procedureId: string | null;
        dateMiseAJour: Date | null;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    update(id: string, body: any): import("@prisma/client").Prisma.Prisma__SourceClient<{
        url: string | null;
        id: string;
        organisme: string;
        procedureId: string | null;
        dateMiseAJour: Date | null;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    remove(id: string): import("@prisma/client").Prisma.Prisma__SourceClient<{
        url: string | null;
        id: string;
        organisme: string;
        procedureId: string | null;
        dateMiseAJour: Date | null;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
