"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const config_1 = __importDefault(require("../config"));
const errors_1 = require("../utils/errors");
const logger_1 = __importDefault(require("../utils/logger"));
class GPTService {
    constructor() {
        this.baseURL = 'https://api.openai.com/v1';
        this.model = 'gpt-4o-mini';
        this.apiKey = config_1.default.openai.apiKey;
    }
    async translateAndCorrect(request) {
        try {
            const languageNames = this.getLanguageNames(request.sourceLang, request.targetLang);
            const systemPrompt = `You are a professional translator and language corrector for a real-time conversation translator app.

CONTEXT: Two people speaking different languages - ${languageNames.source} and ${languageNames.target}.

YOUR TASK:
1. Detect which language the text is in (either ${languageNames.source} or ${languageNames.target})
2. Correct any errors in the text (grammar, spelling, sentence structure from speech recognition)
3. Translate it naturally to the OTHER language in a conversational way

IMPORTANT: If text is in ${languageNames.source}, translate to ${languageNames.target}. If text is in ${languageNames.target}, translate to ${languageNames.source}.

Respond ONLY with a JSON object in this exact format:
{
  "correctedText": "the corrected version in original language",
  "translatedText": "the natural translation in the other language"
}`;
            const userPrompt = `Languages: ${languageNames.source} ↔ ${languageNames.target}
Text to process: "${request.text}"

Detect the language, correct if needed, and translate to the other language naturally as if a native speaker is speaking.`;
            const response = await axios_1.default.post(`${this.baseURL}/chat/completions`, {
                model: this.model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt },
                ],
                temperature: 0.3,
                max_tokens: 500,
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
            });
            const content = response.data.choices[0]?.message?.content;
            if (!content) {
                throw new Error('No response from GPT');
            }
            const result = JSON.parse(content);
            logger_1.default.debug('GPT Translation completed', {
                original: request.text,
                corrected: result.correctedText,
                translated: result.translatedText,
            });
            return result;
        }
        catch (error) {
            logger_1.default.error('GPT Translation failed', error);
            if (axios_1.default.isAxiosError(error)) {
                throw new errors_1.ExternalServiceError(`OpenAI API error: ${error.response?.data?.error?.message || error.message}`, error.response?.status || 502);
            }
            throw new errors_1.ExternalServiceError('Failed to translate text');
        }
    }
    async generateWords(request) {
        try {
            const languageName = this.getLanguageName(request.language);
            const translationLanguageName = this.getLanguageName(request.translationLang);
            const excludeWordsLower = request.excludeWords?.map(w => w.toLowerCase()) || [];
            const excludeList = excludeWordsLower.length
                ? `\n\nIMPORTANT: DO NOT include these words (already learned): ${excludeWordsLower.join(', ')}`
                : '';
            const difficultyGuide = {
                beginner: 'very basic, common everyday words (like: hello, water, cat, house)',
                intermediate: 'commonly used words in daily conversations',
                advanced: 'more sophisticated vocabulary',
            };
            const systemPrompt = `You are a language teacher. Generate ${request.count} NEW random words in ${languageName} for language learning.
${request.difficulty ? `Focus on ${difficultyGuide[request.difficulty]} level words.` : 'Mix beginner and intermediate level words.'}
${excludeList}

CRITICAL: Generate ONLY words that are NOT in the exclude list above!

Respond ONLY with a JSON array in this exact format:
[
  {
    "word": "the word in ${languageName}",
    "translation": "translation to ${translationLanguageName}",
    "difficulty": "beginner|intermediate|advanced",
    "category": "category name (e.g., greetings, food, animals, etc.)"
  }
]`;
            const userPrompt = `Generate ${request.count} unique, NEW ${languageName} words that are NOT in the exclude list. Make them practical and commonly used.`;
            const response = await axios_1.default.post(`${this.baseURL}/chat/completions`, {
                model: this.model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt },
                ],
                temperature: 0.8,
                max_tokens: 1000,
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
            });
            const content = response.data.choices[0]?.message?.content;
            if (!content) {
                throw new Error('No response from GPT');
            }
            let words = JSON.parse(content);
            if (excludeWordsLower.length > 0) {
                const beforeCount = words.length;
                words = words.filter(w => !excludeWordsLower.includes(w.word.toLowerCase()));
                if (beforeCount !== words.length) {
                    logger_1.default.warn('GPT returned already learned words, filtered them out', {
                        before: beforeCount,
                        after: words.length,
                        removed: beforeCount - words.length,
                    });
                }
            }
            logger_1.default.debug('GPT Word Generation completed', {
                language: request.language,
                count: words.length,
                excludedCount: excludeWordsLower.length,
            });
            return words;
        }
        catch (error) {
            logger_1.default.error('GPT Word Generation failed', error);
            if (axios_1.default.isAxiosError(error)) {
                throw new errors_1.ExternalServiceError(`OpenAI API error: ${error.response?.data?.error?.message || error.message}`, error.response?.status || 502);
            }
            throw new errors_1.ExternalServiceError('Failed to generate words');
        }
    }
    getLanguageName(code) {
        const languageMap = {
            en: 'English',
            tr: 'Turkish',
            es: 'Spanish',
            fr: 'French',
            de: 'German',
            it: 'Italian',
            pt: 'Portuguese',
            ru: 'Russian',
            ar: 'Arabic',
            ja: 'Japanese',
            ko: 'Korean',
            zh: 'Chinese',
        };
        return languageMap[code] || code;
    }
    getLanguageNames(sourceLang, targetLang) {
        return {
            source: this.getLanguageName(sourceLang),
            target: this.getLanguageName(targetLang),
        };
    }
}
exports.default = new GPTService();
//# sourceMappingURL=gpt.service.js.map