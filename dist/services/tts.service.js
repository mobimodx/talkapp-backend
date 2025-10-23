"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const config_1 = __importDefault(require("../config"));
const logger_1 = __importDefault(require("../utils/logger"));
const errors_1 = require("../utils/errors");
class TTSService {
    constructor() {
        this.baseURL = 'https://api.openai.com/v1';
        this.apiKey = config_1.default.openai.apiKey;
    }
    async textToSpeech(request) {
        try {
            const voice = request.voice || this.getDefaultVoice(request.language);
            logger_1.default.debug('TTS request', {
                text: request.text.substring(0, 50),
                language: request.language,
                voice,
            });
            const response = await axios_1.default.post(`${this.baseURL}/audio/speech`, {
                model: 'tts-1',
                input: request.text,
                voice: voice,
                response_format: 'mp3',
                speed: 1.0,
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
                responseType: 'arraybuffer',
            });
            const audioBuffer = Buffer.from(response.data);
            const audioBase64 = audioBuffer.toString('base64');
            logger_1.default.debug('TTS completed', {
                textLength: request.text.length,
                audioSize: audioBuffer.length,
            });
            return {
                audioBuffer,
                audioBase64,
                contentType: 'audio/mpeg',
            };
        }
        catch (error) {
            logger_1.default.error('TTS failed', error);
            if (axios_1.default.isAxiosError(error)) {
                throw new errors_1.ExternalServiceError(`OpenAI TTS error: ${error.response?.data?.error?.message || error.message}`, error.response?.status || 502);
            }
            throw new errors_1.ExternalServiceError('Failed to convert text to speech');
        }
    }
    getDefaultVoice(language) {
        const voiceMap = {
            en: 'nova',
            tr: 'alloy',
            es: 'nova',
            fr: 'shimmer',
            de: 'onyx',
            it: 'nova',
            pt: 'alloy',
            ru: 'onyx',
            ar: 'fable',
            ja: 'shimmer',
            ko: 'alloy',
            zh: 'shimmer',
        };
        return voiceMap[language] || 'alloy';
    }
    getAvailableVoices() {
        return ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];
    }
}
exports.default = new TTSService();
//# sourceMappingURL=tts.service.js.map