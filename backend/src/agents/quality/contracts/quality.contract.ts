import { IAgent } from '../../../core/agent/agent.interface';
import { QualityVerdictDto } from '../dto/quality-verdict.dto';

/**
 * Contrat du Quality Agent : contrôle transverse (hallucination, confiance,
 * cohérence, qualité des sources) exécuté avant la synthèse de la réponse.
 */
export interface IQualityAgent extends IAgent<QualityVerdictDto> {}
