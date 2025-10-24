"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const config_1 = __importDefault(require("../config"));
const errors_1 = require("../utils/errors");
const logger_1 = __importDefault(require("../utils/logger"));
class SpeechService {
    constructor() {
        this.baseURL = 'https://speech.googleapis.com/v1';
        this.apiKey = config_1.default.google.apiKey;
    }
    async speechToText(audioBase64, language) {
        try {
            const languageCode = this.getLanguageCode(language);
            logger_1.default.debug('Speech-to-Text request', {
                language: languageCode,
                audioSize: audioBase64.length,
            });
            const response = await axios_1.default.post(`${this.baseURL}/speech:recognize?key=${this.apiKey}`, {
                config: {
                    encoding: 'WEBM_OPUS',
                    sampleRateHertz: 48000,
                    languageCode: languageCode,
                    enableAutomaticPunctuation: true,
                    model: 'default',
                },
                audio: {
                    content: audioBase64,
                },
            }, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const results = response.data.results;
            if (!results || results.length === 0) {
                throw new Error('No transcription results');
            }
            const transcription = results[0]?.alternatives?.[0]?.transcript || '';
            if (!transcription) {
                throw new Error('Empty transcription');
            }
            logger_1.default.debug('Speech-to-Text completed', {
                transcription: transcription.substring(0, 50),
                confidence: results[0]?.alternatives?.[0]?.confidence || 0,
            });
            return transcription;
        }
        catch (error) {
            logger_1.default.error('Speech-to-Text failed', error);
            if (axios_1.default.isAxiosError(error)) {
                throw new errors_1.ExternalServiceError(`Google Speech API error: ${error.response?.data?.error?.message || error.message}`, error.response?.status || 502);
            }
            throw new errors_1.ExternalServiceError('Failed to convert speech to text');
        }
    }
    getLanguageCode(language) {
        const languageMap = {
            en: 'en-US',
            tr: 'tr-TR',
            es: 'es-ES',
            fr: 'fr-FR',
            de: 'de-DE',
            it: 'it-IT',
            pt: 'pt-PT',
            ru: 'ru-RU',
            ar: 'ar-SA',
            ja: 'ja-JP',
            ko: 'ko-KR',
            zh: 'zh-CN',
        };
        return languageMap[language] || 'en-US';
    }
}
exports.default = new SpeechService();
//# sourceMappingURL=speech.service.js.map