import { SupportedLanguage } from '../types';
interface TranslationHistory {
    id: number;
    userId: number;
    sessionId?: number;
    originalText: string;
    correctedText: string;
    translatedText: string;
    sourceLang: SupportedLanguage;
    targetLang: SupportedLanguage;
    createdAt: Date;
}
interface TranslationSession {
    id: number;
    userId: number;
    sourceLang: SupportedLanguage;
    targetLang: SupportedLanguage;
    startedAt: Date;
    endedAt?: Date;
}
declare class TranslationModel {
    createSession(userId: number, sourceLang: SupportedLanguage, targetLang: SupportedLanguage): Promise<number>;
    endSession(sessionId: number): Promise<void>;
    saveHistory(data: {
        userId: number;
        sessionId?: number;
        originalText: string;
        correctedText: string;
        translatedText: string;
        sourceLang: SupportedLanguage;
        targetLang: SupportedLanguage;
    }): Promise<number>;
    getUserHistory(userId: number, limit?: number, offset?: number): Promise<TranslationHistory[]>;
    getSessionHistory(sessionId: number): Promise<TranslationHistory[]>;
    getUserActiveSessions(userId: number): Promise<TranslationSession[]>;
}
declare const _default: TranslationModel;
export default _default;
//# sourceMappingURL=translation.model.d.ts.map