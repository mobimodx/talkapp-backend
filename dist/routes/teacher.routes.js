"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const teacher_controller_1 = __importDefault(require("../controllers/teacher.controller"));
const auth_1 = require("../middleware/auth");
const validator_1 = require("../middleware/validator");
const validators_1 = require("../utils/validators");
const router = (0, express_1.Router)();
router.post('/session/start', auth_1.authenticate, (0, validator_1.validateRequest)(validators_1.teacherStartSessionSchema), teacher_controller_1.default.startSession);
router.post('/word/complete', auth_1.authenticate, (0, validator_1.validateRequest)(validators_1.teacherCompleteWordSchema), teacher_controller_1.default.completeWord);
router.get('/word/:wordId/audio', auth_1.authenticate, teacher_controller_1.default.getWordAudio);
router.get('/session/:sessionId', auth_1.authenticate, teacher_controller_1.default.getSession);
router.get('/progress/daily', auth_1.authenticate, teacher_controller_1.default.getDailyProgress);
router.get('/progress/history', auth_1.authenticate, teacher_controller_1.default.getProgressHistory);
router.get('/progress/learned-count', auth_1.authenticate, teacher_controller_1.default.getLearnedWordsCount);
exports.default = router;
//# sourceMappingURL=teacher.routes.js.map