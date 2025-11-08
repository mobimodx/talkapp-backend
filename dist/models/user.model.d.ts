import { RegisterRequest, User, UserResponse } from '../types';
declare class UserModel {
    create(data: RegisterRequest): Promise<User>;
    findById(id: number): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    private mapRowToUser;
    update(id: number, data: Partial<User>): Promise<User>;
    delete(id: number): Promise<void>;
    updatePremium(id: number, isPremium: boolean, endDate?: Date): Promise<User>;
    hasActivePremium(id: number): Promise<boolean>;
    toResponse(user: User): UserResponse;
    updateRevenueCatSubscription(userId: number, data: {
        revenuecatUserId?: string;
        subscriptionStatus?: 'active' | 'expired' | 'canceled' | 'billing_issue' | 'trial' | 'grace_period' | null;
        subscriptionProductId?: string;
        subscriptionStore?: string;
        subscriptionExpiresAt?: Date | null;
        subscriptionPeriodType?: string;
        subscriptionWillRenew?: boolean;
        subscriptionUnsubscribeDetectedAt?: Date | null;
        subscriptionBillingIssuesDetectedAt?: Date | null;
        subscriptionOriginalPurchaseDate?: Date | null;
        subscriptionEntitlements?: string[];
        isPremium?: boolean;
    }): Promise<User>;
    findByRevenueCatUserId(revenuecatUserId: string): Promise<User | null>;
    linkRevenueCatUserId(userId: number, revenuecatUserId: string): Promise<User>;
}
declare const _default: UserModel;
export default _default;
//# sourceMappingURL=user.model.d.ts.map