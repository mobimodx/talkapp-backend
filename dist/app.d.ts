import { Application } from 'express';
declare class App {
    app: Application;
    constructor();
    private initializeDatabase;
    private initializeMiddlewares;
    private initializeRoutes;
    private initializeErrorHandling;
    listen(): void;
}
declare const app: App;
export default app;
//# sourceMappingURL=app.d.ts.map