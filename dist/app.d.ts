import { Application } from 'express';
import { Server as HttpServer } from 'http';
declare class App {
    app: Application;
    server: HttpServer;
    private wss;
    constructor();
    private initializeDatabase;
    private initializeMiddlewares;
    private initializeRoutes;
    private initializeErrorHandling;
    private initializeWebSocket;
    listen(): void;
}
declare const app: App;
export default app;
//# sourceMappingURL=app.d.ts.map