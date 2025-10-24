"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const speech_1 = require("@google-cloud/speech");
const config_1 = __importDefault(require("../config"));
const errors_1 = require("../utils/errors");
const logger_1 = __importDefault(require("../utils/logger"));
class SpeechService {
    constructor() {
        if (config_1.default.google.apiKey) {
            this.client = new speech_1.SpeechClient({
                apiKey: config_1.default.google.apiKey,
            });
        }
        else {
            this.client = new speech_1.SpeechClient();
        }
    }
    async speechToText(audioBase64, primaryLang, alternativeLang) {
        try {
            logger_1.default.debug('Speech-to-Text V2 request (Chirp 3 - Auto Detection)', {
                primaryLanguage: primaryLang || 'auto',
                alternativeLanguage: alternativeLang || 'none',
                audioSize: audioBase64.length,
            });
            const request = {
                config: {
                    languageCode: 'auto',
                    model: 'latest_long',
                    enableAutomaticPunctuation: true,
                    useEnhanced: true,
                },
                audio: {
                    content: audioBase64,
                },
            };
            const [response] = await this.client.recognize(request);
            if (!response.results || response.results.length === 0) {
                throw new Error('No transcription results');
            }
            const result = response.results[0];
            const alternative = result.alternatives?.[0];
            const transcription = alternative?.transcript || '';
            const detectedLanguageCode = result.languageCode || 'en-US';
            if (!transcription) {
                throw new Error('Empty transcription');
            }
            logger_1.default.debug('Speech-to-Text V2 completed', {
                transcription: transcription.substring(0, 50),
                confidence: alternative?.confidence || 0,
                detectedLanguage: detectedLanguageCode,
            });
            return {
                text: transcription,
                detectedLang: detectedLanguageCode,
            };
        }
        catch (error) {
            logger_1.default.error('Speech-to-Text V2 failed', error);
            throw new errors_1.ExternalServiceError(`Google Speech API error: ${error.message || 'Failed to transcribe'}`, error.code || 502);
        }
    }
}
exports.default = new SpeechService();
//# sourceMappingURL=speech.service.js.map