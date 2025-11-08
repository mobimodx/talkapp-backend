"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkPremiumOptional = exports.requirePremium = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
const revenuecat_service_1 = __importDefault(require("../services/revenuecat.service"));
const errors_1 = require("../utils/errors");
const logger_1 = __importDefault(require("../utils/logger"));
const requirePremium = async (req, _res, next) => {
    try {
        const userId = req.user.userId;
        const user = await user_model_1.default.findById(userId);
        if (!user) {
            throw new errors_1.ForbiddenError('User not found');
        }
        const hasPremiumInDb = await user_model_1.default.hasActivePremium(userId);
        if (user.revenuecatUserId) {
            try {
                const shouldSync = !user.subscriptionLastSyncedAt ||
                    (new Date().getTime() - new Date(user.subscriptionLastSyncedAt).getTime() > 5 * 60 * 1000);
                if (shouldSync) {
                    const entitlementInfo = await revenuecat_service_1.default.checkPremiumEntitlement(user.revenuecatUserId);
                    if (!entitlementInfo.isPremium && hasPremiumInDb) {
                        logger_1.default.warn('Premium status mismatch - RevenueCat says no premium, updating DB', {
                            userId,
                            revenuecatUserId: user.revenuecatUserId,
                        });
                        await user_model_1.default.updateRevenueCatSubscription(userId, {
                            isPremium: false,
                            subscriptionStatus: 'expired',
                            subscriptionExpiresAt: null,
                        });
                        throw new errors_1.ForbiddenError('Premium subscription expired');
                    }
                    if (entitlementInfo.isPremium && !hasPremiumInDb) {
                        logger_1.default.info('Premium status mismatch - RevenueCat says premium, updating DB', {
                            userId,
                            revenuecatUserId: user.revenuecatUserId,
                        });
                        await user_model_1.default.updateRevenueCatSubscription(userId, {
                            isPremium: true,
                            subscriptionStatus: 'active',
                            subscriptionExpiresAt: entitlementInfo.expiresAt || undefined,
                            subscriptionProductId: entitlementInfo.productId || undefined,
                            subscriptionStore: entitlementInfo.store || undefined,
                            subscriptionWillRenew: entitlementInfo.willRenew,
                            subscriptionPeriodType: entitlementInfo.periodType || undefined,
                            subscriptionEntitlements: entitlementInfo.entitlements || [],
                        });
                        next();
                        return;
                    }
                    if (shouldSync) {
                        await user_model_1.default.updateRevenueCatSubscription(userId, {});
                    }
                }
            }
            catch (syncError) {
                logger_1.default.error('Failed to sync with RevenueCat during premium check', {
                    userId,
                    error: syncError,
                });
            }
        }
        if (!hasPremiumInDb) {
            throw new errors_1.ForbiddenError('Premium subscription required');
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.requirePremium = requirePremium;
const checkPremiumOptional = async (req, _res, next) => {
    try {
        if (!req.user) {
            req.isPremium = false;
            next();
            return;
        }
        const userId = req.user.userId;
        const user = await user_model_1.default.findById(userId);
        if (!user) {
            req.isPremium = false;
            next();
            return;
        }
        const hasPremium = await user_model_1.default.hasActivePremium(userId);
        req.isPremium = hasPremium;
        next();
    }
    catch (error) {
        req.isPremium = false;
        next();
    }
};
exports.checkPremiumOptional = checkPremiumOptional;
//# sourceMappingURL=premium.js.map