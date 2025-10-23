"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorResponse = exports.successResponse = exports.addDays = exports.getCurrentDate = exports.getRandomItems = exports.shuffleArray = exports.sanitizeText = exports.generateRandomId = exports.verifyRefreshToken = exports.verifyAccessToken = exports.generateRefreshToken = exports.generateAccessToken = exports.comparePassword = exports.hashPassword = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../config"));
const hashPassword = async (password) => {
    const salt = await bcryptjs_1.default.genSalt(10);
    return await bcryptjs_1.default.hash(password, salt);
};
exports.hashPassword = hashPassword;
const comparePassword = async (password, hashedPassword) => {
    return await bcryptjs_1.default.compare(password, hashedPassword);
};
exports.comparePassword = comparePassword;
const generateAccessToken = (payload) => {
    return jsonwebtoken_1.default.sign(payload, config_1.default.jwt.secret, {
        expiresIn: config_1.default.jwt.expire,
    });
};
exports.generateAccessToken = generateAccessToken;
const generateRefreshToken = (payload) => {
    return jsonwebtoken_1.default.sign(payload, config_1.default.jwt.refreshSecret, {
        expiresIn: config_1.default.jwt.refreshExpire,
    });
};
exports.generateRefreshToken = generateRefreshToken;
const verifyAccessToken = (token) => {
    return jsonwebtoken_1.default.verify(token, config_1.default.jwt.secret);
};
exports.verifyAccessToken = verifyAccessToken;
const verifyRefreshToken = (token) => {
    return jsonwebtoken_1.default.verify(token, config_1.default.jwt.refreshSecret);
};
exports.verifyRefreshToken = verifyRefreshToken;
const generateRandomId = () => {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
};
exports.generateRandomId = generateRandomId;
const sanitizeText = (text) => {
    return text.trim().replace(/\s+/g, ' ');
};
exports.sanitizeText = sanitizeText;
const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};
exports.shuffleArray = shuffleArray;
const getRandomItems = (array, count) => {
    const shuffled = (0, exports.shuffleArray)(array);
    return shuffled.slice(0, Math.min(count, array.length));
};
exports.getRandomItems = getRandomItems;
const getCurrentDate = () => {
    return new Date().toISOString().split('T')[0];
};
exports.getCurrentDate = getCurrentDate;
const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};
exports.addDays = addDays;
const successResponse = (data, message) => {
    return {
        success: true,
        message: message || 'Success',
        data,
    };
};
exports.successResponse = successResponse;
const errorResponse = (message, error) => {
    return {
        success: false,
        message,
        error: error || undefined,
    };
};
exports.errorResponse = errorResponse;
//# sourceMappingURL=helpers.js.map