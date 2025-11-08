import { NextFunction, Request, Response } from 'express';
declare class RevenueCatController {
    handleWebhook(req: Request, res: Response, next: NextFunction): Promise<void>;
    private processWebhookEvent;
    checkPremiumStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
    linkRevenueCatUser(req: Request, res: Response, next: NextFunction): Promise<void>;
    private syncUserWithRevenueCat;
    private checkEventExists;
    private logEventProcessed;
    private logWebhook;
    private logWebhookFailed;
}
declare const _default: RevenueCatController;
export default _default;
//# sourceMappingURL=revenuecat.controller.d.ts.map