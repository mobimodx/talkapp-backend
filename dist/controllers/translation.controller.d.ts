import { Request, Response, NextFunction } from 'express';
declare class TranslationController {
    translate(req: Request, res: Response, next: NextFunction): Promise<void>;
    getHistory(req: Request, res: Response, next: NextFunction): Promise<void>;
    createSession(req: Request, res: Response, next: NextFunction): Promise<void>;
    endSession(req: Request, res: Response, next: NextFunction): Promise<void>;
    getSessionHistory(req: Request, res: Response, next: NextFunction): Promise<void>;
}
declare const _default: TranslationController;
export default _default;
//# sourceMappingURL=translation.controller.d.ts.map