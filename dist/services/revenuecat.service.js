"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const config_1 = __importDefault(require("../config"));
const logger_1 = __importDefault(require("../utils/logger"));
class RevenueCatService {
    constructor() {
        this.baseUrl = 'https://api.revenuecat.com/v1';
        this.secretKey = config_1.default.revenuecat.secretKey;
    }
    async getSubscriberInfo(appUserId) {
        try {
            if (!this.secretKey) {
                logger_1.default.error('RevenueCat secret key not configured');
                return null;
            }
            const response = await axios_1.default.get(`${this.baseUrl}/subscribers/${encodeURIComponent(appUserId)}`, {
                headers: {
                    'Authorization': `Bearer ${this.secretKey}`,
                    'Content-Type': 'application/json',
                },
                timeout: 10000,
            });
            return response.data;
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                const axiosError = error;
                if (axiosError.response?.status === 404) {
                    logger_1.default.info('RevenueCat subscriber not found', { appUserId });
                    return null;
                }
                logger_1.default.error('RevenueCat API error', {
                    appUserId,
                    status: axiosError.response?.status,
                    message: axiosError.message,
                    data: axiosError.response?.data,
                });
            }
            else {
                logger_1.default.error('Unexpected error fetching subscriber info', { error });
            }
            return null;
        }
    }
    async checkPremiumEntitlement(appUserId, entitlementId = 'premium') {
        const subscriberInfo = await this.getSubscriberInfo(appUserId);
        if (!subscriberInfo) {
            return { isPremium: false };
        }
        const { entitlements, subscriptions } = subscriberInfo.subscriber;
        const entitlement = entitlements[entitlementId];
        if (!entitlement) {
            return { isPremium: false };
        }
        const now = new Date();
        const expiresDate = entitlement.expires_date ? new Date(entitlement.expires_date) : null;
        const isActive = !expiresDate || expiresDate > now;
        if (!isActive) {
            return {
                isPremium: false,
                expiresAt: expiresDate || undefined,
                productId: entitlement.product_identifier,
            };
        }
        const productId = entitlement.product_identifier;
        const subscription = subscriptions[productId];
        const activeEntitlements = Object.keys(entitlements).filter((key) => {
            const ent = entitlements[key];
            const expires = ent.expires_date ? new Date(ent.expires_date) : null;
            return !expires || expires > now;
        });
        return {
            isPremium: true,
            expiresAt: expiresDate || undefined,
            productId: entitlement.product_identifier,
            store: subscription?.store,
            willRenew: subscription ? !subscription.unsubscribe_detected_at : undefined,
            periodType: subscription?.period_type,
            entitlements: activeEntitlements,
        };
    }
    async getActiveEntitlements(appUserId) {
        const subscriberInfo = await this.getSubscriberInfo(appUserId);
        if (!subscriberInfo) {
            return [];
        }
        const { entitlements } = subscriberInfo.subscriber;
        const now = new Date();
        return Object.keys(entitlements).filter((key) => {
            const entitlement = entitlements[key];
            const expiresDate = entitlement.expires_date ? new Date(entitlement.expires_date) : null;
            return !expiresDate || expiresDate > now;
        });
    }
    verifyWebhookAuthorization(authHeader) {
        if (!authHeader) {
            return false;
        }
        const expectedAuth = `Bearer ${config_1.default.revenuecat.webhookSecret}`;
        return authHeader === expectedAuth;
    }
    parseSubscriptionStatus(eventType, hasActiveEntitlement) {
        if (!hasActiveEntitlement) {
            if (eventType === 'EXPIRATION')
                return 'expired';
            if (eventType === 'CANCELLATION')
                return 'canceled';
            return null;
        }
        switch (eventType) {
            case 'INITIAL_PURCHASE':
            case 'RENEWAL':
            case 'UNCANCELLATION':
            case 'SUBSCRIPTION_EXTENDED':
                return 'active';
            case 'BILLING_ISSUE':
                return 'billing_issue';
            case 'CANCELLATION':
                return 'canceled';
            case 'EXPIRATION':
                return 'expired';
            default:
                return 'active';
        }
    }
}
exports.default = new RevenueCatService();
//# sourceMappingURL=revenuecat.service.js.map