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
        const clientConfig = {
            apiEndpoint: 'us-speech.googleapis.com',
        };
        if (config_1.default.google.credentials) {
            try {
                const credentials = JSON.parse(config_1.default.google.credentials);
                this.client = new speech_1.v2.SpeechClient({
                    ...clientConfig,
                    credentials
                });
                logger_1.default.info('Speech-to-Text initialized with JSON credentials (US region)');
            }
            catch (error) {
                logger_1.default.error('Failed to parse Google credentials JSON', error);
                throw new Error('Invalid Google credentials JSON format');
            }
        }
        else if (config_1.default.google.apiKey) {
            this.client = new speech_1.v2.SpeechClient({
                ...clientConfig,
                apiKey: config_1.default.google.apiKey,
            });
            logger_1.default.info('Speech-to-Text initialized with API Key (US region)');
        }
        else {
            this.client = new speech_1.v2.SpeechClient(clientConfig);
            logger_1.default.info('Speech-to-Text initialized with default credentials (US region)');
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
            const recognizerPath = `projects/${config_1.default.google.projectId}/locations/us/recognizers/_`;
            const request = {
                recognizer: recognizerPath,
                config: {
                    autoDecodingConfig: {},
                    languageCodes: languageCodes,
                    model: 'long',
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
    createStreamingRecognition(primaryLang, alternativeLang, interimResults = true) {
        try {
            const languageCodes = [];
            if (primaryLang)
                languageCodes.push(this.getLanguageCode(primaryLang));
            if (alternativeLang)
                languageCodes.push(this.getLanguageCode(alternativeLang));
            if (languageCodes.length === 0) {
                languageCodes.push('tr-TR', 'en-US', 'es-ES', 'fr-FR', 'de-DE', 'it-IT', 'pt-PT', 'ru-RU', 'ar-SA', 'ja-JP');
            }
            logger_1.default.debug('Creating streaming recognition session', {
                primaryLanguage: primaryLang || 'multi-language auto-detect',
                alternativeLanguage: alternativeLang || 'none',
                interimResults,
                languageCodesCount: languageCodes.length,
            });
            const recognizerPath = `projects/${config_1.default.google.projectId}/locations/us/recognizers/_`;
            const streamingConfig = {
                config: {
                    explicitDecodingConfig: {
                        encoding: 'LINEAR16',
                        sampleRateHertz: 16000,
                        audioChannelCount: 1,
                    },
                    languageCodes: languageCodes,
                    model: 'long',
                    features: {
                        enableAutomaticPunctuation: true,
                    },
                },
                streamingFeatures: {
                    interimResults: interimResults,
                },
            };
            const stream = this.client._streamingRecognize();
            logger_1.default.info('Streaming recognition session created', {
                recognizerPath,
                model: 'long',
                languageCodes,
                encoding: 'LINEAR16',
            });
            return {
                stream,
                configRequest: {
                    recognizer: recognizerPath,
                    streamingConfig: streamingConfig,
                },
            };
        }
        catch (error) {
            logger_1.default.error('Failed to create streaming recognition session', error);
            throw new errors_1.ExternalServiceError(`Failed to create streaming session: ${error.message}`);
        }
    }
}
exports.default = new SpeechService();
//# sourceMappingURL=speech.service.js.map