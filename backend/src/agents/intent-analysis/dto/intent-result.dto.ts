import {
  IsArray,
  IsEnum,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { AgentName } from '../../../core/agent/agent-name.enum';
import { Domain } from '../../../core/agent/domain.enum';
import type {
  IntentPriority,
  IntentResult,
} from '../../../core/agent/intent.types';

/** Sortie STRICTEMENT structurée de l'Intent Analysis Agent. */
export class IntentResultDto implements IntentResult {
  @IsString()
  intent!: string;

  @IsEnum(Domain)
  domain!: Domain;

  @IsOptional()
  @IsString()
  procedure!: string | null;

  @IsNumber()
  @Min(0)
  @Max(1)
  confidence!: number;

  @IsIn(['low', 'normal', 'high'])
  priority!: IntentPriority;

  @IsArray()
  @IsString({ each: true })
  detectedNeeds!: string[];

  @IsArray()
  @IsEnum(AgentName, { each: true })
  actions!: AgentName[];
}
