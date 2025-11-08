import { NextFunction, Request, Response } from 'express';
declare class AuthController {
    register(req: Request, res: Response, next: NextFunction): Promise<void>;
    login(req: Request, res: Response, next: NextFunction): Promise<void>;
    getProfile(req: Request, res: Response, next: NextFunction): Promise<void>;
    logout(req: Request, res: Response, next: NextFunction): Promise<void>;
    activatePremium(req: Request, res: Response, next: NextFunction): Promise<void>;
    deactivatePremium(req: Request, res: Response, next: NextFunction): Promise<void>;
    checkPremiumStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
}
declare const _default: AuthController;
export default _default;
//# sourceMappingURL=auth.controller.d.ts.map