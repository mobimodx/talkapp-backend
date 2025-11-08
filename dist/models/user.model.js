"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const connection_1 = require("../database/connection");
const errors_1 = require("../utils/errors");
const helpers_1 = require("../utils/helpers");
class UserModel {
    async create(data) {
        const existing = await this.findByEmail(data.email);
        if (existing) {
            throw new errors_1.ConflictError('Email already exists');
        }
        const hashedPassword = await (0, helpers_1.hashPassword)(data.password);
        const result = await (0, connection_1.query)(`INSERT INTO users (email, password, first_name, last_name) 
       VALUES (?, ?, ?, ?)`, [data.email, hashedPassword, data.firstName, data.lastName]);
        const user = await this.findById(result.insertId);
        if (!user) {
            throw new Error('Failed to create user');
        }
        return user;
    }
    async findById(id) {
        const rows = await (0, connection_1.query)('SELECT * FROM users WHERE id = ?', [id]);
        if (rows.length === 0)
            return null;
        return this.mapRowToUser(rows[0]);
    }
    async findByEmail(email) {
        const rows = await (0, connection_1.query)('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0)
            return null;
        return this.mapRowToUser(rows[0]);
    }
    mapRowToUser(row) {
        let subscriptionEntitlements;
        if (row.subscription_entitlements) {
            try {
                subscriptionEntitlements = JSON.parse(row.subscription_entitlements);
            }
            catch (e) {
                subscriptionEntitlements = undefined;
            }
        }
        return {
            id: row.id,
            email: row.email,
            password: row.password,
            firstName: row.first_name,
            lastName: row.last_name,
            profileImage: row.profile_image || undefined,
            isPremium: Boolean(row.is_premium),
            premiumStartDate: row.premium_start_date || undefined,
            premiumEndDate: row.premium_end_date || undefined,
            revenuecatUserId: row.revenuecat_user_id || undefined,
            subscriptionStatus: row.subscription_status || undefined,
            subscriptionProductId: row.subscription_product_id || undefined,
            subscriptionStore: row.subscription_store || undefined,
            subscriptionExpiresAt: row.subscription_expires_at || undefined,
            subscriptionPeriodType: row.subscription_period_type || undefined,
            subscriptionWillRenew: row.subscription_will_renew !== undefined ? Boolean(row.subscription_will_renew) : undefined,
            subscriptionUnsubscribeDetectedAt: row.subscription_unsubscribe_detected_at || undefined,
            subscriptionBillingIssuesDetectedAt: row.subscription_billing_issues_detected_at || undefined,
            subscriptionOriginalPurchaseDate: row.subscription_original_purchase_date || undefined,
            subscriptionEntitlements: subscriptionEntitlements,
            subscriptionLastSyncedAt: row.subscription_last_synced_at || undefined,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    }
    async update(id, data) {
        const updates = [];
        const values = [];
        if (data.firstName) {
            updates.push('first_name = ?');
            values.push(data.firstName);
        }
        if (data.lastName) {
            updates.push('last_name = ?');
            values.push(data.lastName);
        }
        if (data.profileImage !== undefined) {
            updates.push('profile_image = ?');
            values.push(data.profileImage);
        }
        if (data.isPremium !== undefined) {
            updates.push('is_premium = ?');
            values.push(data.isPremium);
        }
        if (updates.length === 0) {
            const user = await this.findById(id);
            if (!user) {
                throw new errors_1.NotFoundError('User not found');
            }
            return user;
        }
        values.push(id);
        await (0, connection_1.query)(`UPDATE users SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, values);
        const user = await this.findById(id);
        if (!user) {
            throw new errors_1.NotFoundError('User not found');
        }
        return user;
    }
    async delete(id) {
        await (0, connection_1.query)('DELETE FROM users WHERE id = ?', [id]);
    }
    async updatePremium(id, isPremium, endDate) {
        const updates = [];
        const values = [];
        updates.push('is_premium = ?');
        values.push(isPremium);
        if (isPremium && endDate) {
            updates.push('premium_start_date = CURRENT_TIMESTAMP');
            updates.push('premium_end_date = ?');
            values.push(endDate);
        }
        else if (!isPremium) {
            updates.push('premium_start_date = NULL');
            updates.push('premium_end_date = NULL');
        }
        values.push(id);
        await (0, connection_1.query)(`UPDATE users SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, values);
        const user = await this.findById(id);
        if (!user) {
            throw new errors_1.NotFoundError('User not found');
        }
        return user;
    }
    async hasActivePremium(id) {
        const user = await this.findById(id);
        if (!user || !user.isPremium) {
            return false;
        }
        if (user.premiumEndDate && new Date(user.premiumEndDate) < new Date()) {
            await this.updatePremium(id, false);
            return false;
        }
        return true;
    }
    toResponse(user) {
        return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            profileImage: user.profileImage,
            isPremium: user.isPremium,
            premiumStartDate: user.premiumStartDate,
            premiumEndDate: user.premiumEndDate,
            subscriptionStatus: user.subscriptionStatus,
            subscriptionProductId: user.subscriptionProductId,
            subscriptionExpiresAt: user.subscriptionExpiresAt,
            subscriptionWillRenew: user.subscriptionWillRenew,
            createdAt: user.createdAt,
        };
    }
    async updateRevenueCatSubscription(userId, data) {
        const updates = [];
        const values = [];
        if (data.revenuecatUserId !== undefined) {
            updates.push('revenuecat_user_id = ?');
            values.push(data.revenuecatUserId);
        }
        if (data.subscriptionStatus !== undefined) {
            updates.push('subscription_status = ?');
            values.push(data.subscriptionStatus);
        }
        if (data.subscriptionProductId !== undefined) {
            updates.push('subscription_product_id = ?');
            values.push(data.subscriptionProductId);
        }
        if (data.subscriptionStore !== undefined) {
            updates.push('subscription_store = ?');
            values.push(data.subscriptionStore);
        }
        if (data.subscriptionExpiresAt !== undefined) {
            updates.push('subscription_expires_at = ?');
            values.push(data.subscriptionExpiresAt);
        }
        if (data.subscriptionPeriodType !== undefined) {
            updates.push('subscription_period_type = ?');
            values.push(data.subscriptionPeriodType);
        }
        if (data.subscriptionWillRenew !== undefined) {
            updates.push('subscription_will_renew = ?');
            values.push(data.subscriptionWillRenew);
        }
        if (data.subscriptionUnsubscribeDetectedAt !== undefined) {
            updates.push('subscription_unsubscribe_detected_at = ?');
            values.push(data.subscriptionUnsubscribeDetectedAt);
        }
        if (data.subscriptionBillingIssuesDetectedAt !== undefined) {
            updates.push('subscription_billing_issues_detected_at = ?');
            values.push(data.subscriptionBillingIssuesDetectedAt);
        }
        if (data.subscriptionOriginalPurchaseDate !== undefined) {
            updates.push('subscription_original_purchase_date = ?');
            values.push(data.subscriptionOriginalPurchaseDate);
        }
        if (data.subscriptionEntitlements !== undefined) {
            updates.push('subscription_entitlements = ?');
            values.push(JSON.stringify(data.subscriptionEntitlements));
        }
        if (data.isPremium !== undefined) {
            updates.push('is_premium = ?');
            values.push(data.isPremium);
        }
        updates.push('subscription_last_synced_at = CURRENT_TIMESTAMP');
        if (updates.length === 0) {
            const user = await this.findById(userId);
            if (!user) {
                throw new errors_1.NotFoundError('User not found');
            }
            return user;
        }
        values.push(userId);
        await (0, connection_1.query)(`UPDATE users SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, values);
        const user = await this.findById(userId);
        if (!user) {
            throw new errors_1.NotFoundError('User not found');
        }
        return user;
    }
    async findByRevenueCatUserId(revenuecatUserId) {
        const rows = await (0, connection_1.query)('SELECT * FROM users WHERE revenuecat_user_id = ?', [revenuecatUserId]);
        if (rows.length === 0)
            return null;
        return this.mapRowToUser(rows[0]);
    }
    async linkRevenueCatUserId(userId, revenuecatUserId) {
        await (0, connection_1.query)('UPDATE users SET revenuecat_user_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [revenuecatUserId, userId]);
        const user = await this.findById(userId);
        if (!user) {
            throw new errors_1.NotFoundError('User not found');
        }
        return user;
    }
}
exports.default = new UserModel();
//# sourceMappingURL=user.model.js.map