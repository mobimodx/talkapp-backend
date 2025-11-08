"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const connection_1 = require("../database/connection");
const user_model_1 = __importDefault(require("../models/user.model"));
const revenuecat_service_1 = __importDefault(require("../services/revenuecat.service"));
const errors_1 = require("../utils/errors");
const helpers_1 = require("../utils/helpers");
const logger_1 = __importDefault(require("../utils/logger"));
class RevenueCatController {
    async handleWebhook(req, res, next) {
        try {
            const authHeader = req.headers.authorization;
            if (!revenuecat_service_1.default.verifyWebhookAuthorization(authHeader)) {
                logger_1.default.warn('Unauthorized webhook attempt', {
                    ip: req.ip,
                    authHeader: authHeader ? 'present' : 'missing',
                });
                throw new errors_1.AuthenticationError('Unauthorized webhook');
            }
            const webhookData = req.body;
            const { event } = webhookData;
            logger_1.default.info('RevenueCat webhook received', {
                eventId: event.id,
                eventType: event.type,
                appUserId: event.app_user_id,
                productId: event.product_id,
                store: event.store,
            });
            await this.logWebhook(event.type, event.app_user_id, webhookData);
            const eventExists = await this.checkEventExists(event.id);
            if (eventExists) {
                logger_1.default.info('Duplicate webhook event detected, skipping', { eventId: event.id });
                res.status(200).json({ status: 'already_processed' });
                return;
            }
            await this.processWebhookEvent(webhookData);
            await this.logEventProcessed(event, webhookData);
            res.status(200).json({ status: 'ok' });
        }
        catch (error) {
            logger_1.default.error('Error processing webhook', { error });
            try {
                const webhookData = req.body;
                await this.logWebhookFailed(webhookData.event.type, webhookData.event.app_user_id, webhookData, error instanceof Error ? error.message : 'Unknown error');
            }
            catch (logError) {
                logger_1.default.error('Failed to log webhook error', { logError });
            }
            next(error);
        }
    }
    async processWebhookEvent(webhookData) {
        const { event } = webhookData;
        const { type, app_user_id, entitlement_ids, expiration_at_ms, product_id, store, period_type } = event;
        let user = await user_model_1.default.findByRevenueCatUserId(app_user_id);
        if (!user) {
            if (app_user_id.includes('@')) {
                user = await user_model_1.default.findByEmail(app_user_id);
                if (user) {
                    await user_model_1.default.linkRevenueCatUserId(user.id, app_user_id);
                    logger_1.default.info('Linked RevenueCat user ID to existing user', {
                        userId: user.id,
                        revenuecatUserId: app_user_id,
                    });
                }
            }
        }
        if (!user) {
            logger_1.default.warn('User not found for webhook event', {
                appUserId: app_user_id,
                eventType: type,
            });
            return;
        }
        const hasActiveEntitlement = entitlement_ids && entitlement_ids.length > 0;
        const subscriptionStatus = revenuecat_service_1.default.parseSubscriptionStatus(type, hasActiveEntitlement || false);
        const updateData = {
            subscriptionStatus,
            subscriptionProductId: product_id || null,
            subscriptionStore: store || null,
            subscriptionExpiresAt: expiration_at_ms ? new Date(expiration_at_ms) : null,
            subscriptionPeriodType: period_type || null,
            subscriptionEntitlements: entitlement_ids || [],
        };
        switch (type) {
            case 'INITIAL_PURCHASE':
                updateData.isPremium = true;
                updateData.subscriptionOriginalPurchaseDate = event.purchased_at_ms ? new Date(event.purchased_at_ms) : new Date();
                updateData.subscriptionWillRenew = true;
                updateData.subscriptionUnsubscribeDetectedAt = null;
                updateData.subscriptionBillingIssuesDetectedAt = null;
                logger_1.default.info('Processing INITIAL_PURCHASE', { userId: user.id, productId: product_id });
                break;
            case 'RENEWAL':
                updateData.isPremium = true;
                updateData.subscriptionWillRenew = true;
                updateData.subscriptionBillingIssuesDetectedAt = null;
                logger_1.default.info('Processing RENEWAL', { userId: user.id, productId: product_id });
                break;
            case 'CANCELLATION':
                updateData.subscriptionWillRenew = false;
                updateData.subscriptionUnsubscribeDetectedAt = new Date();
                logger_1.default.info('Processing CANCELLATION', { userId: user.id, expiresAt: updateData.subscriptionExpiresAt });
                break;
            case 'UNCANCELLATION':
                updateData.isPremium = true;
                updateData.subscriptionWillRenew = true;
                updateData.subscriptionUnsubscribeDetectedAt = null;
                logger_1.default.info('Processing UNCANCELLATION', { userId: user.id });
                break;
            case 'EXPIRATION':
                updateData.isPremium = false;
                updateData.subscriptionWillRenew = false;
                updateData.subscriptionExpiresAt = null;
                updateData.subscriptionEntitlements = [];
                logger_1.default.info('Processing EXPIRATION', { userId: user.id });
                break;
            case 'BILLING_ISSUE':
                updateData.subscriptionBillingIssuesDetectedAt = new Date();
                logger_1.default.warn('Processing BILLING_ISSUE', { userId: user.id });
                break;
            case 'PRODUCT_CHANGE':
                updateData.isPremium = true;
                updateData.subscriptionProductId = event.new_product_id || product_id;
                logger_1.default.info('Processing PRODUCT_CHANGE', {
                    userId: user.id,
                    oldProduct: product_id,
                    newProduct: event.new_product_id,
                });
                break;
            case 'SUBSCRIPTION_EXTENDED':
                updateData.isPremium = true;
                logger_1.default.info('Processing SUBSCRIPTION_EXTENDED', { userId: user.id });
                break;
            default:
                logger_1.default.info('Processing other event type', { userId: user.id, eventType: type });
        }
        await user_model_1.default.updateRevenueCatSubscription(user.id, updateData);
        logger_1.default.info('User subscription updated', {
            userId: user.id,
            eventType: type,
            isPremium: updateData.isPremium,
            subscriptionStatus: updateData.subscriptionStatus,
        });
    }
    async checkPremiumStatus(req, res, next) {
        try {
            const userId = req.user.userId;
            const { forceSync } = req.query;
            const user = await user_model_1.default.findById(userId);
            if (!user) {
                throw new errors_1.AuthenticationError('User not found');
            }
            if (user.revenuecatUserId && forceSync === 'true') {
                await this.syncUserWithRevenueCat(user.id, user.revenuecatUserId);
                const updatedUser = await user_model_1.default.findById(userId);
                if (updatedUser) {
                    res.json((0, helpers_1.successResponse)({
                        isPremium: updatedUser.isPremium,
                        subscriptionStatus: updatedUser.subscriptionStatus,
                        subscriptionProductId: updatedUser.subscriptionProductId,
                        subscriptionExpiresAt: updatedUser.subscriptionExpiresAt,
                        subscriptionWillRenew: updatedUser.subscriptionWillRenew,
                        lastSyncedAt: updatedUser.subscriptionLastSyncedAt,
                    }));
                    return;
                }
            }
            res.json((0, helpers_1.successResponse)({
                isPremium: user.isPremium,
                subscriptionStatus: user.subscriptionStatus,
                subscriptionProductId: user.subscriptionProductId,
                subscriptionExpiresAt: user.subscriptionExpiresAt,
                subscriptionWillRenew: user.subscriptionWillRenew,
                lastSyncedAt: user.subscriptionLastSyncedAt,
            }));
        }
        catch (error) {
            next(error);
        }
    }
    async linkRevenueCatUser(req, res, next) {
        try {
            const userId = req.user.userId;
            const { revenuecatUserId } = req.body;
            if (!revenuecatUserId) {
                throw new errors_1.ValidationError('revenuecatUserId is required');
            }
            const user = await user_model_1.default.linkRevenueCatUserId(userId, revenuecatUserId);
            await this.syncUserWithRevenueCat(user.id, revenuecatUserId);
            const updatedUser = await user_model_1.default.findById(userId);
            if (!updatedUser) {
                throw new errors_1.AuthenticationError('User not found after linking');
            }
            logger_1.default.info('RevenueCat user linked and synced', {
                userId,
                revenuecatUserId,
            });
            res.json((0, helpers_1.successResponse)(user_model_1.default.toResponse(updatedUser), 'RevenueCat user linked successfully'));
        }
        catch (error) {
            next(error);
        }
    }
    async syncUserWithRevenueCat(userId, revenuecatUserId) {
        const entitlementInfo = await revenuecat_service_1.default.checkPremiumEntitlement(revenuecatUserId);
        const updateData = {
            subscriptionStatus: entitlementInfo.isPremium ? 'active' : 'expired',
            isPremium: entitlementInfo.isPremium,
            subscriptionExpiresAt: entitlementInfo.expiresAt || null,
            subscriptionProductId: entitlementInfo.productId || null,
            subscriptionStore: entitlementInfo.store || null,
            subscriptionPeriodType: entitlementInfo.periodType || null,
            subscriptionWillRenew: entitlementInfo.willRenew !== undefined ? entitlementInfo.willRenew : null,
            subscriptionEntitlements: entitlementInfo.entitlements || [],
        };
        await user_model_1.default.updateRevenueCatSubscription(userId, updateData);
        logger_1.default.info('User synced with RevenueCat', {
            userId,
            revenuecatUserId,
            isPremium: entitlementInfo.isPremium,
        });
    }
    async checkEventExists(eventId) {
        const rows = await (0, connection_1.query)('SELECT id FROM revenuecat_event_logs WHERE event_id = ?', [eventId]);
        return rows.length > 0;
    }
    async logEventProcessed(event, webhookData) {
        const user = await user_model_1.default.findByRevenueCatUserId(event.app_user_id);
        await (0, connection_1.query)(`INSERT INTO revenuecat_event_logs 
      (event_id, event_type, app_user_id, user_id, product_id, entitlement_ids, event_timestamp, store, environment, payload) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            event.id,
            event.type,
            event.app_user_id,
            user?.id || null,
            event.product_id || null,
            JSON.stringify(event.entitlement_ids || []),
            event.event_timestamp_ms ? new Date(event.event_timestamp_ms) : null,
            event.store || null,
            event.environment || null,
            JSON.stringify(webhookData),
        ]);
    }
    async logWebhook(eventType, appUserId, webhookData) {
        await (0, connection_1.query)(`INSERT INTO revenuecat_webhook_logs 
      (event_type, app_user_id, payload, processing_status) 
      VALUES (?, ?, ?, 'success')`, [eventType, appUserId, JSON.stringify(webhookData)]);
    }
    async logWebhookFailed(eventType, appUserId, webhookData, errorMessage) {
        await (0, connection_1.query)(`INSERT INTO revenuecat_webhook_logs 
      (event_type, app_user_id, payload, processing_status, error_message) 
      VALUES (?, ?, ?, 'failed', ?)`, [eventType, appUserId, JSON.stringify(webhookData), errorMessage]);
    }
}
exports.default = new RevenueCatController();
//# sourceMappingURL=revenuecat.controller.js.map