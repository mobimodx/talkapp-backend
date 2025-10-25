"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const translation_model_1 = __importDefault(require("../models/translation.model"));
const gpt_service_1 = __importDefault(require("../services/gpt.service"));
const speech_service_1 = __importDefault(require("../services/speech.service"));
const tts_service_1 = __importDefault(require("../services/tts.service"));
const helpers_1 = require("../utils/helpers");
const logger_1 = __importDefault(require("../utils/logger"));
class TranslationController {
    async translate(req, res, next) {
        try {
            const userId = req.user?.userId;
            const data = req.body;
            logger_1.default.info('Translation request', {
                userId,
                sourceLang: data.sourceLang,
                targetLang: data.targetLang,
                textLength: data.text.length,
            });
            const gptResult = await gpt_service_1.default.translateAndCorrect({
                text: data.text,
                sourceLang: data.sourceLang,
                targetLang: data.targetLang,
            });
            const ttsResult = await tts_service_1.default.textToSpeech({
                text: gptResult.translatedText,
                language: data.targetLang,
            });
            if (userId) {
                await translation_model_1.default.saveHistory({
                    userId,
                    originalText: data.text,
                    correctedText: gptResult.correctedText,
                    translatedText: gptResult.translatedText,
                    sourceLang: data.sourceLang,
                    targetLang: data.targetLang,
                });
            }
            const response = {
                originalText: data.text,
                correctedText: gptResult.correctedText,
                translatedText: gptResult.translatedText,
                sourceLang: data.sourceLang,
                targetLang: data.targetLang,
                audioBase64: ttsResult.audioBase64,
            };
            logger_1.default.info('Translation completed', {
                userId,
                originalLength: data.text.length,
                translatedLength: gptResult.translatedText.length,
            });
            res.json((0, helpers_1.successResponse)(response, 'Translation successful'));
        }
        catch (error) {
            next(error);
        }
    }
    async translateAudio(req, res, next) {
        try {
            const userId = req.user?.userId;
            const { audio, sourceLang, targetLang } = req.body;
            logger_1.default.info('Audio translation request', {
                userId,
                sourceLang,
                targetLang,
                audioSize: audio?.length || 0,
            });
            const speechResult = await speech_service_1.default.speechToText(audio, sourceLang, targetLang);
            const recognizedText = speechResult.text;
            const googleLangCode = speechResult.detectedLang.toLowerCase();
            let detectedLang = sourceLang;
            if (googleLangCode.startsWith('en')) {
                detectedLang = 'en';
            }
            else if (googleLangCode.startsWith('tr')) {
                detectedLang = 'tr';
            }
            else if (googleLangCode.startsWith('es')) {
                detectedLang = 'es';
            }
            else if (googleLangCode.startsWith('fr')) {
                detectedLang = 'fr';
            }
            else if (googleLangCode.startsWith('de')) {
                detectedLang = 'de';
            }
            else if (googleLangCode.startsWith('it')) {
                detectedLang = 'it';
            }
            else if (googleLangCode.startsWith('pt')) {
                detectedLang = 'pt';
            }
            else if (googleLangCode.startsWith('ru')) {
                detectedLang = 'ru';
            }
            else if (googleLangCode.startsWith('ar')) {
                detectedLang = 'ar';
            }
            else if (googleLangCode.startsWith('ja')) {
                detectedLang = 'ja';
            }
            else if (googleLangCode.startsWith('ko')) {
                detectedLang = 'ko';
            }
            else if (googleLangCode.startsWith('zh')) {
                detectedLang = 'zh';
            }
            logger_1.default.info('Speech recognized', {
                text: recognizedText.substring(0, 50),
                detectedLang,
                googleLangCode
            });
            const actualTargetLang = detectedLang === sourceLang ? targetLang : sourceLang;
            logger_1.default.debug('Translation direction', {
                detectedLang,
                expectedSourceLang: sourceLang,
                expectedTargetLang: targetLang,
                actualTargetLang,
            });
            const gptResult = await gpt_service_1.default.translateAndCorrect({
                text: recognizedText,
                sourceLang: detectedLang,
                targetLang: actualTargetLang,
            });
            const ttsResult = await tts_service_1.default.textToSpeech({
                text: gptResult.translatedText,
                language: actualTargetLang,
            });
            if (userId) {
                await translation_model_1.default.saveHistory({
                    userId,
                    originalText: recognizedText,
                    correctedText: gptResult.correctedText,
                    translatedText: gptResult.translatedText,
                    sourceLang,
                    targetLang,
                });
            }
            const response = {
                originalText: recognizedText,
                correctedText: gptResult.correctedText,
                translatedText: gptResult.translatedText,
                sourceLang,
                targetLang,
                audioBase64: ttsResult.audioBase64,
            };
            logger_1.default.info('Audio translation completed', {
                userId,
                originalLength: recognizedText.length,
                translatedLength: gptResult.translatedText.length,
            });
            res.json((0, helpers_1.successResponse)(response, 'Translation successful'));
        }
        catch (error) {
            next(error);
        }
    }
    async getHistory(req, res, next) {
        try {
            const userId = req.user.userId;
            const limit = parseInt(req.query.limit) || 50;
            const offset = parseInt(req.query.offset) || 0;
            const history = await translation_model_1.default.getUserHistory(userId, limit, offset);
            res.json((0, helpers_1.successResponse)(history));
        }
        catch (error) {
            next(error);
        }
    }
    async createSession(req, res, next) {
        try {
            const userId = req.user.userId;
            const { sourceLang, targetLang } = req.body;
            const sessionId = await translation_model_1.default.createSession(userId, sourceLang, targetLang);
            res.json((0, helpers_1.successResponse)({ sessionId }, 'Session created'));
        }
        catch (error) {
            next(error);
        }
    }
    async endSession(req, res, next) {
        try {
            const sessionId = parseInt(req.params.sessionId);
            await translation_model_1.default.endSession(sessionId);
            res.json((0, helpers_1.successResponse)(null, 'Session ended'));
        }
        catch (error) {
            next(error);
        }
    }
    async getSessionHistory(req, res, next) {
        try {
            const sessionId = parseInt(req.params.sessionId);
            const history = await translation_model_1.default.getSessionHistory(sessionId);
            res.json((0, helpers_1.successResponse)(history));
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new TranslationController();
//# sourceMappingURL=translation.controller.js.map