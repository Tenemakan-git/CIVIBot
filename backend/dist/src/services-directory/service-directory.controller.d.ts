import { ServiceDirectoryService, ServicePointView } from './service-directory.service';
export declare class ServiceDirectoryController {
    private readonly directory;
    constructor(directory: ServiceDirectoryService);
    find(domaine?: string, type?: string, lat?: string, lng?: string, limit?: string): Promise<ServicePointView[]>;
}
