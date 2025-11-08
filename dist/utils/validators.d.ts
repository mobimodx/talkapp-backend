import Joi from 'joi';
import { SupportedLanguage } from '../types';
export declare const paginationSchema: Joi.ObjectSchema<any>;
export declare const supportedLanguages: SupportedLanguage[];
export declare const languageSchema: Joi.StringSchema<string>;
export declare const registerSchema: Joi.ObjectSchema<any>;
export declare const loginSchema: Joi.ObjectSchema<any>;
export declare const activatePremiumSchema: Joi.ObjectSchema<any>;
export declare const translationRequestSchema: Joi.ObjectSchema<any>;
export declare const audioTranslationRequestSchema: Joi.ObjectSchema<any>;
export declare const teacherStartSessionSchema: Joi.ObjectSchema<any>;
export declare const teacherCompleteWordSchema: Joi.ObjectSchema<any>;
export declare const validate: <T>(schema: Joi.ObjectSchema, data: any) => T;
//# sourceMappingURL=validators.d.ts.map