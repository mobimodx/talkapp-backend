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
    isPremium: boolean;
    premiumStartDate?: Date;
    premiumEndDate?: Date;
    revenuecatUserId?: string;
    subscriptionStatus?: 'active' | 'expired' | 'canceled' | 'billing_issue' | 'trial' | 'grace_period' | null;
    subscriptionProductId?: string;
    subscriptionStore?: string;
    subscriptionExpiresAt?: Date;
    subscriptionPeriodType?: string;
    subscriptionWillRenew?: boolean;
    subscriptionUnsubscribeDetectedAt?: Date;
    subscriptionBillingIssuesDetectedAt?: Date;
    subscriptionOriginalPurchaseDate?: Date;
    subscriptionEntitlements?: string[];
    subscriptionLastSyncedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export interface UserResponse {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
    isPremium: boolean;
    premiumStartDate?: Date;
    premiumEndDate?: Date;
    subscriptionStatus?: 'active' | 'expired' | 'canceled' | 'billing_issue' | 'trial' | 'grace_period' | null;
    subscriptionProductId?: string;
    subscriptionExpiresAt?: Date;
    subscriptionWillRenew?: boolean;
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
export interface RevenueCatWebhookEvent {
    api_version: string;
    event: {
        id: string;
        type: RevenueCatEventType;
        event_timestamp_ms: number;
        app_user_id: string;
        original_app_user_id: string;
        aliases?: string[];
        product_id?: string;
        entitlement_ids?: string[];
        entitlement_id?: string | null;
        period_type?: string;
        purchased_at_ms?: number;
        expiration_at_ms?: number | null;
        store?: string;
        environment?: string;
        transaction_id?: string;
        original_transaction_id?: string;
        is_family_share?: boolean;
        country_code?: string;
        currency?: string;
        price?: number;
        price_in_purchased_currency?: number;
        subscriber_attributes?: Record<string, any>;
        takehome_percentage?: number;
        tax_percentage?: number;
        commission_percentage?: number;
        cancellation_reason?: string;
        new_product_id?: string;
        presented_offering_id?: string | null;
    };
}
export type RevenueCatEventType = 'INITIAL_PURCHASE' | 'RENEWAL' | 'CANCELLATION' | 'UNCANCELLATION' | 'NON_RENEWING_PURCHASE' | 'EXPIRATION' | 'BILLING_ISSUE' | 'PRODUCT_CHANGE' | 'SUBSCRIPTION_PAUSED' | 'TRANSFER' | 'SUBSCRIPTION_EXTENDED';
export interface RevenueCatSubscriberResponse {
    request_date: string;
    request_date_ms: number;
    subscriber: {
        original_app_user_id: string;
        first_seen: string;
        last_seen: string;
        management_url: string | null;
        entitlements: {
            [key: string]: {
                expires_date: string | null;
                grace_period_expires_date: string | null;
                purchase_date: string;
                product_identifier: string;
                product_plan_identifier?: string | null;
            };
        };
        subscriptions: {
            [key: string]: {
                expires_date: string | null;
                purchase_date: string;
                original_purchase_date: string;
                period_type: string;
                store: string;
                is_sandbox: boolean;
                unsubscribe_detected_at: string | null;
                billing_issues_detected_at: string | null;
                grace_period_expires_date: string | null;
                refunded_at: string | null;
                auto_resume_date: string | null;
            };
        };
        non_subscriptions: Record<string, any>;
        other_purchases: Record<string, any>;
    };
}
export interface RevenueCatEntitlementInfo {
    isPremium: boolean;
    expiresAt?: Date;
    productId?: string;
    store?: string;
    willRenew?: boolean;
    periodType?: string;
    entitlements?: string[];
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