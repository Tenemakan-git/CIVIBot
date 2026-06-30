export interface QuestionnaireOption {
    value: string;
    label: string;
    next?: string;
}
export interface QuestionnaireNode {
    id: string;
    question: string;
    options: QuestionnaireOption[];
}
export interface Questionnaire {
    start: string;
    questions: QuestionnaireNode[];
}
export declare function getQuestionnaire(): Questionnaire;
