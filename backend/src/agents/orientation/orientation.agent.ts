import { Injectable } from '@nestjs/common';
import { AgentName } from '../../core/agent/agent-name.enum';
import { AgentContext } from '../../core/agent/agent-context';
import { AgentRunOutput } from '../../core/agent/agent-result';
import { BaseAgent } from '../../core/agent/base-agent.abstract';
import { ServiceDirectoryService } from '../../services-directory/service-directory.service';
import { IOrientationAgent } from './contracts/orientation.contract';
import { OrientationDto } from './dto/orientation.dto';

/**
 * Orientation Agent — déterministe : à partir du domaine de l'intention,
 * remonte les services administratifs compétents (« où déposer mon dossier »).
 * Le tri par proximité reste une affaire du front/REST (géolocalisation
 * navigateur) ; ici on fournit les points de référence du domaine.
 */
@Injectable()
export class OrientationAgent
  extends BaseAgent<OrientationDto>
  implements IOrientationAgent
{
  readonly name = AgentName.Orientation;

  constructor(private readonly directory: ServiceDirectoryService) {
    super();
  }

  protected async run(
    ctx: AgentContext,
  ): Promise<AgentRunOutput<OrientationDto>> {
    const domaine = ctx.intent?.domain;
    if (!domaine) {
      return { data: { servicePoints: [] }, confidence: 0.3, status: 'partial' };
    }

    // Position du navigateur transmise par le Conversation Agent (optionnelle).
    const loc = ctx.metadata?.userLocation as
      | { lat: number; lng: number }
      | undefined;
    const opts: { domaine: string; limit: number; lat?: number; lng?: number } =
      { domaine, limit: 5 };
    if (loc) {
      opts.lat = loc.lat;
      opts.lng = loc.lng;
    }

    const points = await this.directory.find(opts);

    return {
      data: {
        servicePoints: points.map((p) => ({
          id: p.id,
          type: p.type,
          nom: p.nom,
          adresse: p.adresse,
          ville: p.ville,
          telephone: p.telephone,
          horaires: p.horaires,
          url: p.url,
          distanceKm: p.distanceKm ?? null,
        })),
      },
      confidence: points.length > 0 ? 1 : 0.4,
      status: points.length > 0 ? 'success' : 'partial',
    };
  }
}
