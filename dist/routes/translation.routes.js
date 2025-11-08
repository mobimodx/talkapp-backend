"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const translation_controller_1 = __importDefault(require("../controllers/translation.controller"));
const auth_1 = require("../middleware/auth");
const premium_1 = require("../middleware/premium");
const validator_1 = require("../middleware/validator");
const validators_1 = require("../utils/validators");
const router = (0, express_1.Router)();
router.post('/translate', auth_1.optionalAuthenticate, (0, validator_1.validateRequest)(validators_1.translationRequestSchema), translation_controller_1.default.translate);
router.post('/transcribe', auth_1.optionalAuthenticate, (0, validator_1.validateRequest)(validators_1.translationRequestSchema), translation_controller_1.default.translate);
router.post('/transcribe-audio', auth_1.authenticate, premium_1.requirePremium, (0, validator_1.validateRequest)(validators_1.audioTranslationRequestSchema), translation_controller_1.default.translateAudio);
router.get('/history', auth_1.authenticate, translation_controller_1.default.getHistory);
router.post('/session', auth_1.authenticate, translation_controller_1.default.createSession);
router.post('/session/:sessionId/end', auth_1.authenticate, translation_controller_1.default.endSession);
router.get('/session/:sessionId/history', auth_1.authenticate, translation_controller_1.default.getSessionHistory);
exports.default = router;
//# sourceMappingURL=translation.routes.js.map