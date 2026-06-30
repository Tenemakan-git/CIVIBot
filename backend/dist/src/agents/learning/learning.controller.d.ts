import { LearningService } from './learning.service';
export declare class LearningController {
    private readonly learning;
    constructor(learning: LearningService);
    insights(): Promise<import("./dto/learning-insight.dto").LearningInsightDto[]>;
}
