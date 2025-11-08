"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const config = {
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '5000', 10),
    apiVersion: process.env.API_VERSION || 'v1',
    database: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306', 10),
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        name: process.env.DB_NAME || 'talkapp',
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
        expire: process.env.JWT_EXPIRE || '7d',
        refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret',
        refreshExpire: process.env.JWT_REFRESH_EXPIRE || '30d',
    },
    openai: {
        apiKey: process.env.OPENAI_API_KEY || '',
    },
    google: {
        apiKey: process.env.GOOGLE_SPEECH_API_KEY || '',
        projectId: process.env.GOOGLE_PROJECT_ID || 'talkapp-project',
        credentials: process.env.GOOGLE_CREDENTIALS_JSON,
    },
    cors: {
        origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
    },
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
    },
    upload: {
        maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10),
        uploadPath: process.env.UPLOAD_PATH || path_1.default.join(__dirname, '../../uploads'),
    },
    revenuecat: {
        secretKey: process.env.REVENUECAT_SECRET_KEY || '',
        publicKey: process.env.REVENUECAT_PUBLIC_KEY || '',
        webhookSecret: process.env.REVENUECAT_WEBHOOK_SECRET || '',
    },
};
if (process.env.SMTP_HOST) {
    config.email = {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        user: process.env.SMTP_USER || '',
        password: process.env.SMTP_PASSWORD || '',
        from: process.env.SMTP_FROM || 'noreply@talkapp.com',
    };
}
if (!config.openai.apiKey && config.env !== 'test') {
    console.warn('⚠️  WARNING: OPENAI_API_KEY is not set!');
}
if (!config.revenuecat.secretKey && config.env !== 'test') {
    console.warn('⚠️  WARNING: REVENUECAT_SECRET_KEY is not set!');
}
if (config.jwt.secret === 'your-secret-key-change-in-production' && config.env === 'production') {
    throw new Error('JWT_SECRET must be set in production!');
}
if (!config.revenuecat.webhookSecret && config.env === 'production') {
    throw new Error('REVENUECAT_WEBHOOK_SECRET must be set in production!');
}
exports.default = config;
//# sourceMappingURL=index.js.map