export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    error?: string;
}
export interface PaginationParams {
    page: number;
    limit: number;
    offset: number;
}
export interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
export interface User {
    id: number;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface UserResponse {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
    createdAt: Date;
}
export interface RegisterRequest {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}
export interface LoginRequest {
    email: string;
    password: string;
}
export interface AuthResponse {
    user: UserResponse;
    token: string;
    refreshToken: string;
}
export type SupportedLanguage = 'en' | 'tr' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'ru' | 'ar' | 'ja' | 'ko' | 'zh' | 'th';
export interface TranslationRequest {
    text: string;
    sourceLang: SupportedLanguage;
    targetLang: SupportedLanguage;
}
export interface TranslationResponse {
    originalText: string;
    correctedText: string;
    translatedText: string;
    sourceLang: SupportedLanguage;
    targetLang: SupportedLanguage;
    audioUrl?: string;
    audioBase64?: string;
}
export interface TranslationSession {
    id: number;
    userId: number;
    sourceLang: SupportedLanguage;
    targetLang: SupportedLanguage;
    startedAt: Date;
    endedAt?: Date;
}
export interface Word {
    id: number;
    word: string;
    language: SupportedLanguage;
    translation?: string;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    category?: string;
    createdAt: Date;
}
export interface LearnedWord {
    id: number;
    userId: number;
    wordId: number;
    language: SupportedLanguage;
    word: string;
    learnedAt: Date;
    reviewCount: number;
    lastReviewedAt?: Date;
}
export interface TeacherSession {
    id: number;
    userId: number;
    language: SupportedLanguage;
    wordsCount: number;
    completedWords: number;
    progress: number;
    startedAt: Date;
    completedAt?: Date;
}
export interface TeacherSessionResponse {
    sessionId: number;
    language: SupportedLanguage;
    words: WordWithAudio[];
    totalWords: number;
    progress: number;
}
export interface WordWithAudio {
    id: number;
    word: string;
    translation?: string;
    audioUrl?: string;
    audioBase64?: string;
}
export interface DailyProgress {
    userId: number;
    date: string;
    wordsLearned: number;
    totalWords: number;
    progressPercentage: number;
}
export interface GPTTranslationRequest {
    text: string;
    sourceLang: SupportedLanguage;
    targetLang: SupportedLanguage;
}
export interface GPTTranslationResult {
    correctedText: string;
    translatedText: string;
    detectedLanguage: SupportedLanguage;
}
export interface GPTWordGenerationRequest {
    language: SupportedLanguage;
    translationLang: SupportedLanguage;
    count: number;
    excludeWords?: string[];
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
}
export interface GPTGeneratedWord {
    word: string;
    translation: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    category?: string;
}
export interface TTSRequest {
    text: string;
    language: SupportedLanguage;
    voice?: string;
}
export interface TTSResponse {
    audioBuffer: Buffer;
    audioBase64: string;
    contentType: string;
}
export interface DatabaseConfig {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
}
export interface JWTPayload {
    userId: number;
    email: string;
    iat?: number;
    exp?: number;
}
export interface RefreshTokenPayload {
    userId: number;
    tokenId: string;
}
declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: number;
                email: string;
            };
        }
    }
}
//# sourceMappingURL=index.d.ts.map