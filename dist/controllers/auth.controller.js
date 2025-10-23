"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_model_1 = __importDefault(require("../models/user.model"));
const connection_1 = require("../database/connection");
const helpers_1 = require("../utils/helpers");
const errors_1 = require("../utils/errors");
const logger_1 = __importDefault(require("../utils/logger"));
class AuthController {
    async register(req, res, next) {
        try {
            const data = req.body;
            const user = await user_model_1.default.create(data);
            const accessToken = (0, helpers_1.generateAccessToken)({ userId: user.id, email: user.email });
            const tokenId = (0, helpers_1.generateRandomId)();
            const refreshToken = (0, helpers_1.generateRefreshToken)({ userId: user.id, tokenId });
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 30);
            await (0, connection_1.query)('INSERT INTO refresh_tokens (user_id, token, token_id, expires_at) VALUES (?, ?, ?, ?)', [user.id, refreshToken, tokenId, expiresAt]);
            const response = {
                user: user_model_1.default.toResponse(user),
                token: accessToken,
                refreshToken,
            };
            logger_1.default.info('User registered successfully', { userId: user.id, email: user.email });
            res.status(201).json((0, helpers_1.successResponse)(response, 'Registration successful'));
        }
        catch (error) {
            next(error);
        }
    }
    async login(req, res, next) {
        try {
            const data = req.body;
            const user = await user_model_1.default.findByEmail(data.email);
            if (!user) {
                throw new errors_1.AuthenticationError('Invalid credentials');
            }
            const isValidPassword = await (0, helpers_1.comparePassword)(data.password, user.password);
            if (!isValidPassword) {
                throw new errors_1.AuthenticationError('Invalid credentials');
            }
            const accessToken = (0, helpers_1.generateAccessToken)({ userId: user.id, email: user.email });
            const tokenId = (0, helpers_1.generateRandomId)();
            const refreshToken = (0, helpers_1.generateRefreshToken)({ userId: user.id, tokenId });
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 30);
            await (0, connection_1.query)('INSERT INTO refresh_tokens (user_id, token, token_id, expires_at) VALUES (?, ?, ?, ?)', [user.id, refreshToken, tokenId, expiresAt]);
            const response = {
                user: user_model_1.default.toResponse(user),
                token: accessToken,
                refreshToken,
            };
            logger_1.default.info('User logged in successfully', { userId: user.id, email: user.email });
            res.json((0, helpers_1.successResponse)(response, 'Login successful'));
        }
        catch (error) {
            next(error);
        }
    }
    async getProfile(req, res, next) {
        try {
            const userId = req.user.userId;
            const user = await user_model_1.default.findById(userId);
            if (!user) {
                throw new errors_1.AuthenticationError('User not found');
            }
            res.json((0, helpers_1.successResponse)(user_model_1.default.toResponse(user)));
        }
        catch (error) {
            next(error);
        }
    }
    async logout(req, res, next) {
        try {
            const userId = req.user.userId;
            const { refreshToken } = req.body;
            if (refreshToken) {
                await (0, connection_1.query)('DELETE FROM refresh_tokens WHERE user_id = ? AND token = ?', [userId, refreshToken]);
            }
            else {
                await (0, connection_1.query)('DELETE FROM refresh_tokens WHERE user_id = ?', [userId]);
            }
            logger_1.default.info('User logged out', { userId });
            res.json((0, helpers_1.successResponse)(null, 'Logout successful'));
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new AuthController();
//# sourceMappingURL=auth.controller.js.map