"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuthenticate = exports.authenticate = void 0;
const helpers_1 = require("../utils/helpers");
const errors_1 = require("../utils/errors");
const logger_1 = __importDefault(require("../utils/logger"));
const authenticate = async (req, _res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new errors_1.AuthenticationError('No token provided');
        }
        const token = authHeader.substring(7);
        try {
            const decoded = (0, helpers_1.verifyAccessToken)(token);
            req.user = {
                userId: decoded.userId,
                email: decoded.email,
            };
            next();
        }
        catch (error) {
            throw new errors_1.AuthenticationError('Invalid or expired token');
        }
    }
    catch (error) {
        next(error);
    }
};
exports.authenticate = authenticate;
const optionalAuthenticate = async (req, _res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            try {
                const decoded = (0, helpers_1.verifyAccessToken)(token);
                req.user = {
                    userId: decoded.userId,
                    email: decoded.email,
                };
            }
            catch (error) {
                logger_1.default.debug('Invalid token in optional auth', { error });
            }
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.optionalAuthenticate = optionalAuthenticate;
//# sourceMappingURL=auth.js.map