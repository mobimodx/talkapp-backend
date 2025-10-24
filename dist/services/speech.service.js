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
        if (config_1.default.google.credentials) {
            try {
                const credentials = JSON.parse(config_1.default.google.credentials);
                this.client = new speech_1.v2.SpeechClient({ credentials });
                logger_1.default.info('Speech-to-Text initialized with JSON credentials');
            }
            catch (error) {
                logger_1.default.error('Failed to parse Google credentials JSON', error);
                throw new Error('Invalid Google credentials JSON format');
            }
        }
        else if (config_1.default.google.apiKey) {
            this.client = new speech_1.v2.SpeechClient({
                apiKey: config_1.default.google.apiKey,
            });
            logger_1.default.info('Speech-to-Text initialized with API Key');
        }
        else {
            this.client = new speech_1.v2.SpeechClient();
            logger_1.default.info('Speech-to-Text initialized with default credentials');
        }
    }
    async speechToText(audioBase64, primaryLang, alternativeLang) {
        try {
            logger_1.default.debug('Speech-to-Text V2 request (Chirp 3 - Auto Detection)', {
                primaryLanguage: primaryLang || 'auto',
                alternativeLanguage: alternativeLang || 'none',
                audioSize: audioBase64.length,
                projectId: config_1.default.google.projectId,
            });
            const languageCodes = [];
            if (primaryLang)
                languageCodes.push(this.getLanguageCode(primaryLang));
            if (alternativeLang)
                languageCodes.push(this.getLanguageCode(alternativeLang));
            if (languageCodes.length === 0)
                languageCodes.push('auto');
            const recognizerPath = `projects/${config_1.default.google.projectId}/locations/global/recognizers/_`;
            const request = {
                recognizer: recognizerPath,
                config: {
                    autoDecodingConfig: {},
                    languageCodes: languageCodes,
                    model: 'chirp',
                    features: {
                        enableAutomaticPunctuation: true,
                        enableWordTimeOffsets: false,
                        enableWordConfidence: true,
                    },
                },
                content: audioBase64,
            };
            const [response] = await this.client.recognize(request);
            if (!response.results || response.results.length === 0) {
                throw new Error('No transcription results');
            }
            const result = response.results[0];
            const alternative = result.alternatives?.[0];
            const transcription = alternative?.transcript || '';
            const detectedLanguageCode = result.languageCode || primaryLang ? this.getLanguageCode(primaryLang) : 'en-US';
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
            let httpStatusCode = 502;
            if (error.code) {
                const grpcToHttp = {
                    1: 499,
                    2: 500,
                    3: 400,
                    4: 504,
                    5: 404,
                    7: 403,
                    8: 429,
                    9: 400,
                    13: 500,
                    14: 503,
                    16: 401,
                };
                httpStatusCode = grpcToHttp[error.code] || 502;
            }
            throw new errors_1.ExternalServiceError(`Google Speech API error: ${error.message || 'Failed to transcribe'}`, httpStatusCode);
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