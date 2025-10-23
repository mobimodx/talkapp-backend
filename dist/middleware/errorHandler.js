"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = exports.errorHandler = void 0;
const errors_1 = require("../utils/errors");
const logger_1 = __importDefault(require("../utils/logger"));
const config_1 = __importDefault(require("../config"));
const errorHandler = (err, req, res, _next) => {
    let statusCode = 500;
    let message = 'Internal server error';
    if (err instanceof errors_1.AppError) {
        statusCode = err.statusCode;
        message = err.message;
    }
    if (statusCode >= 500) {
        logger_1.default.error('Server Error', err, {
            url: req.url,
            method: req.method,
            userId: req.user?.userId,
        });
    }
    else {
        logger_1.default.warn('Client Error', {
            message: err.message,
            statusCode,
            url: req.url,
            method: req.method,
        });
    }
    const response = {
        success: false,
        message,
    };
    if (config_1.default.env === 'development' && err.stack) {
        response.stack = err.stack;
    }
    res.status(statusCode).json(response);
};
exports.errorHandler = errorHandler;
const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.url} not found`,
    });
};
exports.notFoundHandler = notFoundHandler;
//# sourceMappingURL=errorHandler.js.map