import { DailyProgress, SupportedLanguage } from '../types';
interface TeacherSession {
    id: number;
    userId: number;
    language: SupportedLanguage;
    wordsCount: number;
    completedWords: number;
    progress: number;
    startedAt: Date;
    completedAt?: Date;
}
interface TeacherSessionWord {
    id: number;
    sessionId: number;
    wordId: number;
    word: string;
    translation?: string;
    isCompleted: boolean;
    completedAt?: Date;
}
declare class TeacherModel {
    getOrCreateWord(data: {
        word: string;
        language: SupportedLanguage;
        translation?: string;
        difficulty?: 'beginner' | 'intermediate' | 'advanced';
        category?: string;
    }): Promise<number>;
    getUserLearnedWords(userId: number, language: SupportedLanguage): Promise<string[]>;
    createSession(userId: number, language: SupportedLanguage, wordsCount: number): Promise<number>;
    addWordsToSession(sessionId: number, words: Array<{
        wordId: number;
        word: string;
        translation?: string;
    }>): Promise<void>;
    getSession(sessionId: number): Promise<TeacherSession | null>;
    getSessionWords(sessionId: number): Promise<TeacherSessionWord[]>;
    completeSessionWord(sessionId: number, wordId: number): Promise<void>;
    updateSessionProgress(sessionId: number): Promise<void>;
    markWordAsLearned(userId: number, wordId: number, word: string, language: SupportedLanguage): Promise<void>;
    updateDailyProgress(userId: number): Promise<void>;
    getDailyProgress(userId: number, date?: string): Promise<DailyProgress | null>;
    getProgressHistory(userId: number, days?: number): Promise<DailyProgress[]>;
    getUserLearnedWordsCount(userId: number, language?: SupportedLanguage): Promise<number>;
}
declare const _default: TeacherModel;
export default _default;
//# sourceMappingURL=teacher.model.d.ts.map