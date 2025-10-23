"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const teacher_model_1 = __importDefault(require("../models/teacher.model"));
const gpt_service_1 = __importDefault(require("../services/gpt.service"));
const tts_service_1 = __importDefault(require("../services/tts.service"));
const helpers_1 = require("../utils/helpers");
const logger_1 = __importDefault(require("../utils/logger"));
class TeacherController {
    async startSession(req, res, next) {
        try {
            const userId = req.user.userId;
            const { language, translationLang = 'en', wordsCount = 5, difficulty } = req.body;
            logger_1.default.info('Teacher session start', { userId, language, translationLang, wordsCount });
            const learnedWords = await teacher_model_1.default.getUserLearnedWords(userId, language);
            const generatedWords = await gpt_service_1.default.generateWords({
                language,
                translationLang,
                count: wordsCount,
                excludeWords: learnedWords,
                difficulty,
            });
            const sessionId = await teacher_model_1.default.createSession(userId, language, wordsCount);
            const wordsWithIds = await Promise.all(generatedWords.map(async (gptWord) => {
                const wordId = await teacher_model_1.default.getOrCreateWord({
                    word: gptWord.word,
                    language,
                    translation: gptWord.translation,
                    difficulty: gptWord.difficulty,
                    category: gptWord.category,
                });
                return {
                    wordId,
                    word: gptWord.word,
                    translation: gptWord.translation,
                };
            }));
            await teacher_model_1.default.addWordsToSession(sessionId, wordsWithIds);
            const wordsWithAudio = await Promise.all(wordsWithIds.map(async (w) => {
                const ttsResult = await tts_service_1.default.textToSpeech({
                    text: w.word,
                    language,
                });
                return {
                    id: w.wordId,
                    word: w.word,
                    translation: w.translation,
                    audioBase64: ttsResult.audioBase64,
                };
            }));
            const response = {
                sessionId,
                language,
                words: wordsWithAudio,
                totalWords: wordsCount,
                progress: 0,
            };
            logger_1.default.info('Teacher session created', { userId, sessionId, wordsCount });
            res.json((0, helpers_1.successResponse)(response, 'Session started'));
        }
        catch (error) {
            next(error);
        }
    }
    async completeWord(req, res, next) {
        try {
            const userId = req.user.userId;
            const { sessionId, wordId } = req.body;
            logger_1.default.info('Word completion', { userId, sessionId, wordId });
            await teacher_model_1.default.completeSessionWord(sessionId, wordId);
            const session = await teacher_model_1.default.getSession(sessionId);
            if (!session) {
                throw new Error('Session not found');
            }
            const sessionWords = await teacher_model_1.default.getSessionWords(sessionId);
            const wordInfo = sessionWords.find(w => w.wordId === wordId);
            if (wordInfo) {
                await teacher_model_1.default.markWordAsLearned(userId, wordId, wordInfo.word, session.language);
            }
            const updatedSession = await teacher_model_1.default.getSession(sessionId);
            const dailyProgress = await teacher_model_1.default.getDailyProgress(userId);
            res.json((0, helpers_1.successResponse)({
                sessionProgress: updatedSession?.progress || 0,
                completedWords: updatedSession?.completedWords || 0,
                totalWords: updatedSession?.wordsCount || 0,
                dailyProgress,
            }, 'Word completed'));
        }
        catch (error) {
            next(error);
        }
    }
    async getWordAudio(req, res, next) {
        try {
            const { wordId } = req.params;
            const { language } = req.query;
            const sessionWords = await teacher_model_1.default.getSessionWords(parseInt(req.query.sessionId));
            const wordInfo = sessionWords.find(w => w.wordId === parseInt(wordId));
            if (!wordInfo) {
                throw new Error('Word not found');
            }
            const ttsResult = await tts_service_1.default.textToSpeech({
                text: wordInfo.word,
                language: language,
            });
            res.json((0, helpers_1.successResponse)({
                wordId: wordInfo.wordId,
                word: wordInfo.word,
                audioBase64: ttsResult.audioBase64,
            }));
        }
        catch (error) {
            next(error);
        }
    }
    async getDailyProgress(req, res, next) {
        try {
            const userId = req.user.userId;
            const date = req.query.date;
            const progress = await teacher_model_1.default.getDailyProgress(userId, date);
            res.json((0, helpers_1.successResponse)(progress));
        }
        catch (error) {
            next(error);
        }
    }
    async getProgressHistory(req, res, next) {
        try {
            const userId = req.user.userId;
            const days = parseInt(req.query.days) || 7;
            const history = await teacher_model_1.default.getProgressHistory(userId, days);
            res.json((0, helpers_1.successResponse)(history));
        }
        catch (error) {
            next(error);
        }
    }
    async getSession(req, res, next) {
        try {
            const sessionId = parseInt(req.params.sessionId);
            const session = await teacher_model_1.default.getSession(sessionId);
            const words = await teacher_model_1.default.getSessionWords(sessionId);
            res.json((0, helpers_1.successResponse)({ session, words }));
        }
        catch (error) {
            next(error);
        }
    }
    async getLearnedWordsCount(req, res, next) {
        try {
            const userId = req.user.userId;
            const language = req.query.language;
            const count = await teacher_model_1.default.getUserLearnedWordsCount(userId, language);
            res.json((0, helpers_1.successResponse)({ count }));
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new TeacherController();
//# sourceMappingURL=teacher.controller.js.map