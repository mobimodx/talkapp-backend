import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
export declare const errorHandler: (err: Error | AppError, req: Request, res: Response, _next: NextFunction) => void;
export declare const notFoundHandler: (req: Request, res: Response) => void;
//# sourceMappingURL=errorHandler.d.ts.map