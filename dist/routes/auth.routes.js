"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = __importDefault(require("../controllers/auth.controller"));
const auth_1 = require("../middleware/auth");
const validator_1 = require("../middleware/validator");
const validators_1 = require("../utils/validators");
const router = (0, express_1.Router)();
router.post('/register', (0, validator_1.validateRequest)(validators_1.registerSchema), auth_controller_1.default.register);
router.post('/login', (0, validator_1.validateRequest)(validators_1.loginSchema), auth_controller_1.default.login);
router.get('/profile', auth_1.authenticate, auth_controller_1.default.getProfile);
router.post('/logout', auth_1.authenticate, auth_controller_1.default.logout);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map