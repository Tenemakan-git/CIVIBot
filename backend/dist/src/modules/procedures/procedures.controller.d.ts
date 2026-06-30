import { ProceduresService } from './procedures.service';
import { CreateProcedureDto } from './dto/create-procedure.dto';
import { UpdateProcedureDto } from './dto/update-procedure.dto';
export declare class ProceduresController {
    private service;
    constructor(service: ProceduresService);
    findAll(categorieId?: string): import("@prisma/client").Prisma.PrismaPromise<({
        categorie: {
            domaine: {
                id: string;
                nom: string;
                slug: string;
            };
        } & {
            id: string;
            nom: string;
            slug: string;
            domaineId: string;
        };
        documents: {
            id: string;
            nom: string;
            remarque: string | null;
            obligatoire: boolean;
            procedureId: string;
        }[];
        steps: {
            id: string;
            titre: string;
            description: string;
            ordre: number;
            procedureId: string;
        }[];
        faqs: {
            id: string;
            reponse: string;
            question: string;
            procedureId: string | null;
        }[];
        sources: {
            url: string | null;
            id: string;
            organisme: string;
            procedureId: string | null;
            dateMiseAJour: Date | null;
        }[];
    } & {
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
    })[]>;
    findOne(id: string): Promise<{
        categorie: {
            domaine: {
                id: string;
                nom: string;
                slug: string;
            };
        } & {
            id: string;
            nom: string;
            slug: string;
            domaineId: string;
        };
        documents: {
            id: string;
            nom: string;
            remarque: string | null;
            obligatoire: boolean;
            procedureId: string;
        }[];
        steps: {
            id: string;
            titre: string;
            description: string;
            ordre: number;
            procedureId: string;
        }[];
        faqs: {
            id: string;
            reponse: string;
            question: string;
            procedureId: string | null;
        }[];
        sources: {
            url: string | null;
            id: string;
            organisme: string;
            procedureId: string | null;
            dateMiseAJour: Date | null;
        }[];
    } & {
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
    }>;
}
export declare class AdminProceduresController {
    private service;
    constructor(service: ProceduresService);
    findAll(categorieId?: string): import("@prisma/client").Prisma.PrismaPromise<({
        categorie: {
            domaine: {
                id: string;
                nom: string;
                slug: string;
            };
        } & {
            id: string;
            nom: string;
            slug: string;
            domaineId: string;
        };
        documents: {
            id: string;
            nom: string;
            remarque: string | null;
            obligatoire: boolean;
            procedureId: string;
        }[];
        steps: {
            id: string;
            titre: string;
            description: string;
            ordre: number;
            procedureId: string;
        }[];
        faqs: {
            id: string;
            reponse: string;
            question: string;
            procedureId: string | null;
        }[];
        sources: {
            url: string | null;
            id: string;
            organisme: string;
            procedureId: string | null;
            dateMiseAJour: Date | null;
        }[];
    } & {
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
    })[]>;
    findOne(id: string): Promise<{
        categorie: {
            domaine: {
                id: string;
                nom: string;
                slug: string;
            };
        } & {
            id: string;
            nom: string;
            slug: string;
            domaineId: string;
        };
        documents: {
            id: string;
            nom: string;
            remarque: string | null;
            obligatoire: boolean;
            procedureId: string;
        }[];
        steps: {
            id: string;
            titre: string;
            description: string;
            ordre: number;
            procedureId: string;
        }[];
        faqs: {
            id: string;
            reponse: string;
            question: string;
            procedureId: string | null;
        }[];
        sources: {
            url: string | null;
            id: string;
            organisme: string;
            procedureId: string | null;
            dateMiseAJour: Date | null;
        }[];
    } & {
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
    }>;
    create(dto: CreateProcedureDto): import("@prisma/client").Prisma.Prisma__ProcedureClient<{
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
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    update(id: string, dto: UpdateProcedureDto): import("@prisma/client").Prisma.Prisma__ProcedureClient<{
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
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    publish(id: string): import("@prisma/client").Prisma.Prisma__ProcedureClient<{
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
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    remove(id: string): import("@prisma/client").Prisma.Prisma__ProcedureClient<{
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
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
