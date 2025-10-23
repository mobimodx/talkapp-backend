import { NextFunction, Request, Response } from 'express';
declare class TeacherController {
    startSession(req: Request, res: Response, next: NextFunction): Promise<void>;
    completeWord(req: Request, res: Response, next: NextFunction): Promise<void>;
    getWordAudio(req: Request, res: Response, next: NextFunction): Promise<void>;
    getDailyProgress(req: Request, res: Response, next: NextFunction): Promise<void>;
    getProgressHistory(req: Request, res: Response, next: NextFunction): Promise<void>;
    getSession(req: Request, res: Response, next: NextFunction): Promise<void>;
    getLearnedWordsCount(req: Request, res: Response, next: NextFunction): Promise<void>;
}
declare const _default: TeacherController;
export default _default;
//# sourceMappingURL=teacher.controller.d.ts.map