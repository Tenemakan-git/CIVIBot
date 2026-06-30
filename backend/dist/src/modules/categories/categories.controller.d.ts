import { CategoriesService } from './categories.service';
import { UpsertCategoryDto } from './dto/upsert-category.dto';
export declare class CategoriesController {
    private service;
    constructor(service: CategoriesService);
    findAll(domaine?: string): import("@prisma/client").Prisma.PrismaPromise<({
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
    })[]>;
    findDomaines(): import("@prisma/client").Prisma.PrismaPromise<({
        categories: {
            id: string;
            nom: string;
            slug: string;
            domaineId: string;
        }[];
    } & {
        id: string;
        nom: string;
        slug: string;
    })[]>;
}
export declare class AdminCategoriesController {
    private service;
    constructor(service: CategoriesService);
    findAll(): import("@prisma/client").Prisma.PrismaPromise<({
        domaine: {
            id: string;
            nom: string;
            slug: string;
        };
        _count: {
            procedures: number;
        };
    } & {
        id: string;
        nom: string;
        slug: string;
        domaineId: string;
    })[]>;
    create(dto: UpsertCategoryDto): import("@prisma/client").Prisma.Prisma__CategorieClient<{
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
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    update(id: string, dto: Partial<UpsertCategoryDto>): import("@prisma/client").Prisma.Prisma__CategorieClient<{
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
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    remove(id: string): import("@prisma/client").Prisma.Prisma__CategorieClient<{
        id: string;
        nom: string;
        slug: string;
        domaineId: string;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
