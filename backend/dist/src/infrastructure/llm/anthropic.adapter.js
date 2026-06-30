"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var AnthropicAdapter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnthropicAdapter = void 0;
const common_1 = require("@nestjs/common");
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
const generative_ai_1 = require("@google/generative-ai");
const prisma_service_1 = require("../../prisma/prisma.service");
let AnthropicAdapter = AnthropicAdapter_1 = class AnthropicAdapter {
    prisma;
    logger = new common_1.Logger(AnthropicAdapter_1.name);
    claude = new sdk_1.default({
        apiKey: process.env.ANTHROPIC_API_KEY,
    });
    gemini = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    models = {
        reasoning: process.env.ANTHROPIC_REASONING_MODEL || 'claude-opus-4-8',
        generation: process.env.ANTHROPIC_GENERATION_MODEL || 'claude-sonnet-4-6',
    };
    constructor(prisma) {
        this.prisma = prisma;
    }
    async defaults() {
        let settings = await this.prisma.aiSettings.findFirst();
        if (!settings)
            settings = await this.prisma.aiSettings.create({ data: {} });
        return {
            temperature: settings.temperature,
            maxTokens: settings.maxTokens,
            fallbackModel: settings.modeleSecours || 'gemini-2.0-flash',
        };
    }
    resolveModel(options) {
        if (options.model)
            return options.model;
        return this.models[options.tier ?? 'generation'];
    }
    samplingParams(model, temperature) {
        return /(opus-4-[78]|fable-5|mythos)/.test(model) ? {} : { temperature };
    }
    async complete(options) {
        const { temperature, maxTokens, fallbackModel } = await this.defaults();
        const model = this.resolveModel(options);
        try {
            const msg = await this.claude.messages.create({
                model,
                max_tokens: options.maxTokens ?? maxTokens,
                ...this.samplingParams(model, options.temperature ?? temperature),
                system: options.system,
                messages: options.messages,
            });
            const text = msg.content
                .filter((b) => b.type === 'text')
                .map((b) => b.text)
                .join('');
            return {
                text,
                model,
                inputTokens: msg.usage.input_tokens,
                outputTokens: msg.usage.output_tokens,
            };
        }
        catch (err) {
            this.logger.warn(`Claude indisponible (${err.message}) → repli Gemini`);
            return this.completeWithGemini(fallbackModel, options);
        }
    }
    async completeJson(options) {
        const jsonSystem = [
            options.system,
            'Réponds STRICTEMENT avec un JSON valide, sans texte ni balises markdown.',
        ]
            .filter(Boolean)
            .join('\n\n');
        const { text } = await this.complete({ ...options, system: jsonSystem });
        return this.parseJson(text);
    }
    async stream(options, handlers) {
        const { temperature, maxTokens, fallbackModel } = await this.defaults();
        const model = this.resolveModel(options);
        try {
            return await this.streamWithClaude(model, maxTokens, temperature, options, handlers);
        }
        catch (err) {
            this.logger.warn(`Claude stream indisponible (${err.message}) → repli Gemini`);
            return this.streamWithGemini(fallbackModel, options, handlers);
        }
    }
    streamWithClaude(model, defaultMaxTokens, defaultTemperature, options, handlers) {
        return new Promise((resolve, reject) => {
            let text = '';
            const stream = this.claude.messages.stream({
                model,
                max_tokens: options.maxTokens ?? defaultMaxTokens,
                ...this.samplingParams(model, options.temperature ?? defaultTemperature),
                system: options.system,
                messages: options.messages,
            });
            stream.on('text', (chunk) => {
                text += chunk;
                handlers.onText(chunk);
            });
            stream.on('message', (msg) => {
                resolve({
                    text,
                    model,
                    inputTokens: msg.usage.input_tokens,
                    outputTokens: msg.usage.output_tokens,
                });
            });
            stream.on('error', (err) => reject(err));
        });
    }
    async completeWithGemini(model, options) {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('Aucune IA disponible (Claude KO, GEMINI_API_KEY absente)');
        }
        const genModel = this.gemini.getGenerativeModel({
            model,
            systemInstruction: options.system,
        });
        const { history, last } = this.toGeminiHistory(options.messages);
        const chat = genModel.startChat({ history });
        const result = await chat.sendMessage(last);
        return {
            text: result.response.text(),
            model,
            inputTokens: 0,
            outputTokens: 0,
        };
    }
    async streamWithGemini(model, options, handlers) {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('Aucune IA disponible (Claude KO, GEMINI_API_KEY absente)');
        }
        const genModel = this.gemini.getGenerativeModel({
            model,
            systemInstruction: options.system,
        });
        const { history, last } = this.toGeminiHistory(options.messages);
        const chat = genModel.startChat({ history });
        const result = await chat.sendMessageStream(last);
        let text = '';
        for await (const chunk of result.stream) {
            const t = chunk.text();
            if (t) {
                text += t;
                handlers.onText(t);
            }
        }
        return { text, model, inputTokens: 0, outputTokens: 0 };
    }
    toGeminiHistory(messages) {
        const history = messages.slice(0, -1).map((m) => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }],
        }));
        const last = messages[messages.length - 1]?.content ?? '';
        return { history, last };
    }
    parseJson(raw) {
        const cleaned = raw.replace(/```json|```/g, '').trim();
        const start = cleaned.search(/[[{]/);
        const candidate = start >= 0 ? cleaned.slice(start) : cleaned;
        try {
            return JSON.parse(candidate);
        }
        catch {
            throw new Error(`Sortie LLM non-JSON exploitable: "${raw.slice(0, 200)}"`);
        }
    }
};
exports.AnthropicAdapter = AnthropicAdapter;
exports.AnthropicAdapter = AnthropicAdapter = AnthropicAdapter_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AnthropicAdapter);
//# sourceMappingURL=anthropic.adapter.js.map