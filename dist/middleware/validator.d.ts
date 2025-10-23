import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
type ValidationTarget = 'body' | 'query' | 'params';
export declare const validateRequest: (schema: Joi.ObjectSchema, target?: ValidationTarget) => (req: Request, _res: Response, next: NextFunction) => void;
export {};
//# sourceMappingURL=validator.d.ts.map