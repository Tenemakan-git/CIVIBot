"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceDirectoryService = void 0;
exports.haversineKm = haversineKm;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
function haversineKm(aLat, aLng, bLat, bLng) {
    const R = 6371;
    const dLat = toRad(bLat - aLat);
    const dLng = toRad(bLng - aLng);
    const lat1 = toRad(aLat);
    const lat2 = toRad(bLat);
    const h = Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
}
function toRad(deg) {
    return (deg * Math.PI) / 180;
}
let ServiceDirectoryService = class ServiceDirectoryService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async find(opts = {}) {
        const limit = opts.limit ?? 20;
        const hasCoords = typeof opts.lat === 'number' &&
            typeof opts.lng === 'number' &&
            !Number.isNaN(opts.lat) &&
            !Number.isNaN(opts.lng);
        const rows = await this.prisma.servicePoint.findMany({
            where: {
                ...(opts.domaine
                    ? { domaine: { in: [opts.domaine, 'both'] } }
                    : {}),
                ...(opts.type ? { type: opts.type } : {}),
            },
            orderBy: [{ ville: 'asc' }, { nom: 'asc' }],
        });
        const views = rows.map((r) => ({ ...r }));
        if (hasCoords) {
            for (const v of views) {
                v.distanceKm =
                    Math.round(haversineKm(opts.lat, opts.lng, v.latitude, v.longitude) * 10) / 10;
            }
            views.sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
        }
        return views.slice(0, limit);
    }
};
exports.ServiceDirectoryService = ServiceDirectoryService;
exports.ServiceDirectoryService = ServiceDirectoryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ServiceDirectoryService);
//# sourceMappingURL=service-directory.service.js.map