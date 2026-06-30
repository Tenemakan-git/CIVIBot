"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdministrativeFolder = void 0;
const folder_status_vo_1 = require("./folder-status.vo");
const progress_vo_1 = require("./progress.vo");
class AdministrativeFolder {
    id;
    userId;
    _domaine;
    _titre;
    _procedureSlug;
    _statut;
    _progression;
    _conversationId;
    createdAt;
    _updatedAt;
    constructor(id, userId, _domaine, _titre, _procedureSlug, _statut, _progression, _conversationId, createdAt, _updatedAt) {
        this.id = id;
        this.userId = userId;
        this._domaine = _domaine;
        this._titre = _titre;
        this._procedureSlug = _procedureSlug;
        this._statut = _statut;
        this._progression = _progression;
        this._conversationId = _conversationId;
        this.createdAt = createdAt;
        this._updatedAt = _updatedAt;
    }
    static create(props) {
        const now = new Date();
        return new AdministrativeFolder(props.id ?? crypto.randomUUID(), props.userId, props.domaine, props.titre, props.procedureSlug ?? null, folder_status_vo_1.FolderStatus.Ouvert, progress_vo_1.Progress.zero(), props.conversationId ?? null, now, now);
    }
    static fromSnapshot(s) {
        return new AdministrativeFolder(s.id, s.userId, s.domaine, s.titre, s.procedureSlug, (0, folder_status_vo_1.assertValidStatus)(s.statut), progress_vo_1.Progress.of(s.progression), s.conversationId, s.createdAt, s.updatedAt);
    }
    get domaine() {
        return this._domaine;
    }
    get titre() {
        return this._titre;
    }
    get procedureSlug() {
        return this._procedureSlug;
    }
    get statut() {
        return this._statut;
    }
    get progression() {
        return this._progression.value;
    }
    get conversationId() {
        return this._conversationId;
    }
    get updatedAt() {
        return this._updatedAt;
    }
    rename(titre) {
        if (!titre.trim())
            throw new Error('Le titre du dossier ne peut être vide');
        this._titre = titre.trim();
        this.touch();
    }
    attachConversation(conversationId) {
        this._conversationId = conversationId;
        this.touch();
    }
    setProcedure(slug) {
        this._procedureSlug = slug;
        this.touch();
    }
    updateProgress(value) {
        this._progression = progress_vo_1.Progress.of(value);
        if (this._statut === folder_status_vo_1.FolderStatus.Termine)
            return;
        if (this._progression.isComplete()) {
            this.transitionTo(folder_status_vo_1.FolderStatus.Complet);
        }
        else if (this._progression.value > 0) {
            this.transitionTo(folder_status_vo_1.FolderStatus.EnCours);
        }
        this.touch();
    }
    terminate() {
        this.transitionTo(folder_status_vo_1.FolderStatus.Termine);
        this.touch();
    }
    transitionTo(status) {
        if (!(0, folder_status_vo_1.canTransition)(this._statut, status)) {
            throw new Error(`Transition de statut interdite: ${this._statut} → ${status}`);
        }
        this._statut = status;
        this.touch();
    }
    touch() {
        this._updatedAt = new Date();
    }
    toSnapshot() {
        return {
            id: this.id,
            userId: this.userId,
            domaine: this._domaine,
            procedureSlug: this._procedureSlug,
            titre: this._titre,
            statut: this._statut,
            progression: this._progression.value,
            conversationId: this._conversationId,
            createdAt: this.createdAt,
            updatedAt: this._updatedAt,
        };
    }
}
exports.AdministrativeFolder = AdministrativeFolder;
//# sourceMappingURL=administrative-folder.entity.js.map