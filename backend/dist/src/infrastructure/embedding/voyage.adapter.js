"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoyageAdapter = void 0;
const common_1 = require("@nestjs/common");
let VoyageAdapter = class VoyageAdapter {
    dimensions = 1024;
    apiKey = process.env.VOYAGE_API_KEY;
    model = process.env.VOYAGE_MODEL || 'voyage-3';
    apiUrl = 'https://api.voyageai.com/v1/embeddings';
    async embed(text) {
        const [vector] = await this.request([text]);
        return vector;
    }
    async embedBatch(texts) {
        if (texts.length === 0)
            return [];
        return this.request(texts);
    }
    async request(input) {
        const res = await fetch(this.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.apiKey}`,
            },
            body: JSON.stringify({ model: this.model, input }),
        });
        if (!res.ok) {
            throw new Error(`Voyage AI a répondu ${res.status}: ${await res.text()}`);
        }
        const data = (await res.json());
        return data.data.map((d) => d.embedding);
    }
};
exports.VoyageAdapter = VoyageAdapter;
exports.VoyageAdapter = VoyageAdapter = __decorate([
    (0, common_1.Injectable)()
], VoyageAdapter);
//# sourceMappingURL=voyage.adapter.js.map