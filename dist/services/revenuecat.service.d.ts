import { RevenueCatEntitlementInfo, RevenueCatSubscriberResponse } from '../types';
declare class RevenueCatService {
    private readonly baseUrl;
    private readonly secretKey;
    constructor();
    getSubscriberInfo(appUserId: string): Promise<RevenueCatSubscriberResponse | null>;
    checkPremiumEntitlement(appUserId: string, entitlementId?: string): Promise<RevenueCatEntitlementInfo>;
    getActiveEntitlements(appUserId: string): Promise<string[]>;
    verifyWebhookAuthorization(authHeader: string | undefined): boolean;
    parseSubscriptionStatus(eventType: string, hasActiveEntitlement: boolean): 'active' | 'expired' | 'canceled' | 'billing_issue' | 'trial' | 'grace_period' | null;
}
declare const _default: RevenueCatService;
export default _default;
//# sourceMappingURL=revenuecat.service.d.ts.map