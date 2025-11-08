interface Config {
    env: string;
    port: number;
    apiVersion: string;
    database: {
        host: string;
        port: number;
        user: string;
        password: string;
        name: string;
    };
    jwt: {
        secret: string;
        expire: string;
        refreshSecret: string;
        refreshExpire: string;
    };
    openai: {
        apiKey: string;
    };
    google: {
        apiKey: string;
        projectId: string;
        credentials?: string;
    };
    cors: {
        origin: string | string[];
    };
    rateLimit: {
        windowMs: number;
        maxRequests: number;
    };
    upload: {
        maxFileSize: number;
        uploadPath: string;
    };
    email?: {
        host: string;
        port: number;
        user: string;
        password: string;
        from: string;
    };
    revenuecat: {
        secretKey: string;
        publicKey: string;
        webhookSecret: string;
    };
}
declare const config: Config;
export default config;
//# sourceMappingURL=index.d.ts.map