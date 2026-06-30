"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getQuestionnaire = getQuestionnaire;
const QUESTIONNAIRE = {
    start: 'domaine',
    questions: [
        {
            id: 'domaine',
            question: 'Quelle démarche souhaitez-vous effectuer ?',
            options: [
                { value: 'etat_civil', label: 'État civil', next: 'ec_acte' },
                { value: 'creation_entreprise', label: "Création d'entreprise", next: 'ce_forme' },
            ],
        },
        {
            id: 'ec_acte',
            question: 'Quel acte ou document recherchez-vous ?',
            options: [
                { value: 'acte_naissance', label: 'Acte de naissance', next: 'ec_naissance_cas' },
                { value: 'acte_mariage', label: 'Acte de mariage', next: 'ec_situation' },
                { value: 'acte_deces', label: 'Acte de décès', next: 'ec_situation' },
                { value: 'certificat_nationalite', label: 'Certificat de nationalité', next: 'ec_situation' },
            ],
        },
        {
            id: 'ec_naissance_cas',
            question: 'Dans quelle situation êtes-vous ?',
            options: [
                { value: 'premiere_demande', label: 'Première demande ou copie', next: 'ec_situation' },
                { value: 'acte_perdu', label: 'Acte perdu ou détruit', next: 'ec_situation' },
                { value: 'erreur_acte', label: 'Erreur à corriger sur l’acte', next: 'ec_situation' },
                { value: 'naissance_etranger', label: 'Naissance survenue à l’étranger', next: 'ec_situation' },
                { value: 'sans_acte', label: 'Aucun acte n’existe (jugement supplétif)', next: 'ec_situation' },
            ],
        },
        {
            id: 'ec_situation',
            question: 'Pour qui effectuez-vous cette démarche ?',
            options: [
                { value: 'moi', label: 'Pour moi-même' },
                { value: 'enfant', label: 'Pour mon enfant' },
                { value: 'proche', label: 'Pour un proche' },
            ],
        },
        {
            id: 'ce_forme',
            question: 'Quelle forme juridique envisagez-vous ?',
            options: [
                { value: 'entreprise_individuelle', label: 'Entreprise individuelle', next: 'ce_secteur' },
                { value: 'sarl', label: 'SARL', next: 'ce_associes' },
                { value: 'sarlu', label: 'SARL unipersonnelle (SARLU)', next: 'ce_secteur' },
                { value: 'sa', label: 'Société anonyme (SA)', next: 'ce_associes' },
                { value: 'indecis', label: 'Je ne sais pas encore', next: 'ce_associes' },
            ],
        },
        {
            id: 'ce_associes',
            question: 'Combien serez-vous d’associés ?',
            options: [
                { value: 'seul', label: 'Seul', next: 'ce_secteur' },
                { value: '2_5', label: 'De 2 à 5', next: 'ce_secteur' },
                { value: 'plus_5', label: 'Plus de 5', next: 'ce_secteur' },
            ],
        },
        {
            id: 'ce_secteur',
            question: 'Quel est votre secteur d’activité ?',
            options: [
                { value: 'commerce', label: 'Commerce' },
                { value: 'services', label: 'Services' },
                { value: 'artisanat', label: 'Artisanat / production' },
                { value: 'agriculture', label: 'Agriculture' },
                { value: 'numerique', label: 'Numérique / tech' },
                { value: 'autre', label: 'Autre' },
            ],
        },
    ],
};
function getQuestionnaire() {
    return QUESTIONNAIRE;
}
//# sourceMappingURL=questionnaire.js.map