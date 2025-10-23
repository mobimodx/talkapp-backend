"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const connection_1 = require("../database/connection");
const helpers_1 = require("../utils/helpers");
const errors_1 = require("../utils/errors");
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
        return rows.length > 0 ? rows[0] : null;
    }
    async findByEmail(email) {
        const rows = await (0, connection_1.query)('SELECT * FROM users WHERE email = ?', [email]);
        return rows.length > 0 ? rows[0] : null;
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
    toResponse(user) {
        return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            profileImage: user.profileImage,
            createdAt: user.createdAt,
        };
    }
}
exports.default = new UserModel();
//# sourceMappingURL=user.model.js.map