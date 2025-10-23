import { JWTPayload, RefreshTokenPayload } from '../types';
export declare const hashPassword: (password: string) => Promise<string>;
export declare const comparePassword: (password: string, hashedPassword: string) => Promise<boolean>;
export declare const generateAccessToken: (payload: JWTPayload) => string;
export declare const generateRefreshToken: (payload: RefreshTokenPayload) => string;
export declare const verifyAccessToken: (token: string) => JWTPayload;
export declare const verifyRefreshToken: (token: string) => RefreshTokenPayload;
export declare const generateRandomId: () => string;
export declare const sanitizeText: (text: string) => string;
export declare const shuffleArray: <T>(array: T[]) => T[];
export declare const getRandomItems: <T>(array: T[], count: number) => T[];
export declare const getCurrentDate: () => string;
export declare const addDays: (date: Date, days: number) => Date;
export declare const successResponse: <T>(data: T, message?: string) => {
    success: boolean;
    message: string;
    data: T;
};
export declare const errorResponse: (message: string, error?: any) => {
    success: boolean;
    message: string;
    error: any;
};
//# sourceMappingURL=helpers.d.ts.map