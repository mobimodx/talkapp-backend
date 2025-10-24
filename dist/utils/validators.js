"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = exports.teacherCompleteWordSchema = exports.teacherStartSessionSchema = exports.audioTranslationRequestSchema = exports.translationRequestSchema = exports.loginSchema = exports.registerSchema = exports.languageSchema = exports.supportedLanguages = exports.paginationSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.paginationSchema = joi_1.default.object({
    page: joi_1.default.number().integer().min(1).default(1),
    limit: joi_1.default.number().integer().min(1).max(100).default(10),
});
exports.supportedLanguages = [
    'en', 'tr', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ar', 'ja', 'ko', 'zh'
];
exports.languageSchema = joi_1.default.string().valid(...exports.supportedLanguages);
exports.registerSchema = joi_1.default.object({
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().min(6).max(100).required(),
    firstName: joi_1.default.string().min(2).max(100).required(),
    lastName: joi_1.default.string().min(2).max(100).required(),
});
exports.loginSchema = joi_1.default.object({
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().required(),
});
exports.translationRequestSchema = joi_1.default.object({
    text: joi_1.default.string().min(1).max(5000).required(),
    sourceLang: exports.languageSchema.required(),
    targetLang: exports.languageSchema.required(),
}).custom((value, helpers) => {
    if (value.sourceLang === value.targetLang) {
        return helpers.error('any.invalid', { message: 'Source and target languages must be different' });
    }
    return value;
});
exports.audioTranslationRequestSchema = joi_1.default.object({
    audio: joi_1.default.string().required(),
    sourceLang: exports.languageSchema.required(),
    targetLang: exports.languageSchema.required(),
}).custom((value, helpers) => {
    if (value.sourceLang === value.targetLang) {
        return helpers.error('any.invalid', { message: 'Source and target languages must be different' });
    }
    return value;
});
exports.teacherStartSessionSchema = joi_1.default.object({
    language: exports.languageSchema.required(),
    translationLang: exports.languageSchema.default('en'),
    wordsCount: joi_1.default.number().integer().min(1).max(10).default(5),
    difficulty: joi_1.default.string().valid('beginner', 'intermediate', 'advanced').optional(),
});
exports.teacherCompleteWordSchema = joi_1.default.object({
    sessionId: joi_1.default.number().integer().required(),
    wordId: joi_1.default.number().integer().required(),
});
const validate = (schema, data) => {
    const { error, value } = schema.validate(data, {
        abortEarly: false,
        stripUnknown: true,
    });
    if (error) {
        const errors = error.details.map(detail => detail.message).join(', ');
        throw new Error(errors);
    }
    return value;
};
exports.validate = validate;
//# sourceMappingURL=validators.js.map