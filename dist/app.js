"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const compression_1 = __importDefault(require("compression"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const config_1 = __importDefault(require("./config"));
const connection_1 = require("./database/connection");
const errorHandler_1 = require("./middleware/errorHandler");
const routes_1 = __importDefault(require("./routes"));
const logger_1 = __importDefault(require("./utils/logger"));
class App {
    constructor() {
        this.app = (0, express_1.default)();
        this.initializeDatabase();
        this.initializeMiddlewares();
        this.initializeRoutes();
        this.initializeErrorHandling();
    }
    initializeDatabase() {
        try {
            (0, connection_1.createDatabasePool)();
            logger_1.default.info('Database connection pool created');
        }
        catch (error) {
            logger_1.default.error('Failed to create database pool', error);
            process.exit(1);
        }
    }
    initializeMiddlewares() {
        this.app.set('trust proxy', 1);
        this.app.use((0, helmet_1.default)());
        this.app.use((0, cors_1.default)({
            origin: config_1.default.cors.origin,
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization'],
        }));
        this.app.use(express_1.default.json({ limit: '10mb' }));
        this.app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
        this.app.use((0, compression_1.default)());
        if (config_1.default.env === 'development') {
            this.app.use((0, morgan_1.default)('dev'));
        }
        else {
            this.app.use((0, morgan_1.default)('combined'));
        }
        const limiter = (0, express_rate_limit_1.default)({
            windowMs: config_1.default.rateLimit.windowMs,
            max: config_1.default.rateLimit.maxRequests,
            message: 'Too many requests from this IP, please try again later.',
            standardHeaders: true,
            legacyHeaders: false,
        });
        this.app.use('/api/', limiter);
    }
    initializeRoutes() {
        this.app.use(`/api/${config_1.default.apiVersion}`, routes_1.default);
        this.app.get('/', (_req, res) => {
            res.json({
                success: true,
                message: 'Welcome to TalkApp API',
                version: config_1.default.apiVersion,
                docs: `/api/${config_1.default.apiVersion}/health`,
            });
        });
    }
    initializeErrorHandling() {
        this.app.use(errorHandler_1.notFoundHandler);
        this.app.use(errorHandler_1.errorHandler);
    }
    listen() {
        this.app.listen(config_1.default.port, () => {
            logger_1.default.info(`
╔═══════════════════════════════════════╗
║                                       ║
║     🎙️  TalkApp API Server  🎙️       ║
║                                       ║
║  Environment: ${config_1.default.env.padEnd(24)}║
║  Port:        ${config_1.default.port.toString().padEnd(24)}║
║  API Version: ${config_1.default.apiVersion.padEnd(24)}║
║                                       ║
║  🌐 http://localhost:${config_1.default.port}           ║
║  📚 http://localhost:${config_1.default.port}/api/${config_1.default.apiVersion}/health  ║
║                                       ║
╚═══════════════════════════════════════╝
      `);
        });
    }
}
const app = new App();
app.listen();
process.on('SIGTERM', () => {
    logger_1.default.info('SIGTERM signal received: closing HTTP server');
    process.exit(0);
});
process.on('SIGINT', () => {
    logger_1.default.info('SIGINT signal received: closing HTTP server');
    process.exit(0);
});
exports.default = app;
//# sourceMappingURL=app.js.map