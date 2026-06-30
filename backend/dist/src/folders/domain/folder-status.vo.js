"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FolderStatus = void 0;
exports.canTransition = canTransition;
exports.assertValidStatus = assertValidStatus;
var FolderStatus;
(function (FolderStatus) {
    FolderStatus["Ouvert"] = "ouvert";
    FolderStatus["EnCours"] = "en_cours";
    FolderStatus["Complet"] = "complet";
    FolderStatus["Termine"] = "termine";
})(FolderStatus || (exports.FolderStatus = FolderStatus = {}));
const TRANSITIONS = {
    [FolderStatus.Ouvert]: [
        FolderStatus.EnCours,
        FolderStatus.Complet,
        FolderStatus.Termine,
    ],
    [FolderStatus.EnCours]: [
        FolderStatus.Complet,
        FolderStatus.Ouvert,
        FolderStatus.Termine,
    ],
    [FolderStatus.Complet]: [FolderStatus.Termine, FolderStatus.EnCours],
    [FolderStatus.Termine]: [],
};
function canTransition(from, to) {
    if (from === to)
        return true;
    return TRANSITIONS[from].includes(to);
}
function assertValidStatus(value) {
    if (!Object.values(FolderStatus).includes(value)) {
        throw new Error(`Statut de dossier invalide: ${value}`);
    }
    return value;
}
//# sourceMappingURL=folder-status.vo.js.map