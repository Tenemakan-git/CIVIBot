/** Suggestion de documents générables, produite dans le pipeline. */
export interface OfficialDocSuggestionDto {
  availableTemplates: { key: string; titre: string; description: string }[];
}
