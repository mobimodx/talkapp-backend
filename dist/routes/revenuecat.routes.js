"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const revenuecat_controller_1 = __importDefault(require("../controllers/revenuecat.controller"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post('/webhook', revenuecat_controller_1.default.handleWebhook);
router.get('/status', auth_1.authenticate, revenuecat_controller_1.default.checkPremiumStatus);
router.post('/link', auth_1.authenticate, revenuecat_controller_1.default.linkRevenueCatUser);
exports.default = router;
//# sourceMappingURL=revenuecat.routes.js.map