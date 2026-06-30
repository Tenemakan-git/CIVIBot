import { OnModuleInit } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';
import { AgentName } from '../core/agent/agent-name.enum';
import { IAgent } from '../core/agent/agent.interface';
export declare class AgentRegistry implements OnModuleInit {
    private readonly discovery;
    private readonly logger;
    private readonly agents;
    private readonly validNames;
    constructor(discovery: DiscoveryService);
    onModuleInit(): void;
    has(name: AgentName): boolean;
    get(name: AgentName): IAgent;
    list(): AgentName[];
}
