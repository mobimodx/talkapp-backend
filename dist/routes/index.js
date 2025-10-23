"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("./auth.routes"));
const teacher_routes_1 = __importDefault(require("./teacher.routes"));
const translation_routes_1 = __importDefault(require("./translation.routes"));
const router = (0, express_1.Router)();
router.get('/health', (_req, res) => {
    res.json({
        success: true,
        message: 'TalkApp API is running',
        timestamp: new Date().toISOString(),
    });
});
router.use('/auth', auth_routes_1.default);
router.use('/translation', translation_routes_1.default);
router.use('/teacher', teacher_routes_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map