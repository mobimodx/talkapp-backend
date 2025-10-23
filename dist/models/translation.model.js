"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const connection_1 = require("../database/connection");
class TranslationModel {
    async createSession(userId, sourceLang, targetLang) {
        const result = await (0, connection_1.query)(`INSERT INTO translation_sessions (user_id, source_lang, target_lang) 
       VALUES (?, ?, ?)`, [userId, sourceLang, targetLang]);
        return result.insertId;
    }
    async endSession(sessionId) {
        await (0, connection_1.query)('UPDATE translation_sessions SET ended_at = CURRENT_TIMESTAMP WHERE id = ?', [sessionId]);
    }
    async saveHistory(data) {
        const result = await (0, connection_1.query)(`INSERT INTO translation_history 
       (user_id, session_id, original_text, corrected_text, translated_text, source_lang, target_lang)
       VALUES (?, ?, ?, ?, ?, ?, ?)`, [
            data.userId,
            data.sessionId || null,
            data.originalText,
            data.correctedText,
            data.translatedText,
            data.sourceLang,
            data.targetLang,
        ]);
        return result.insertId;
    }
    async getUserHistory(userId, limit = 50, offset = 0) {
        return await (0, connection_1.query)(`SELECT * FROM translation_history 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`, [userId, limit, offset]);
    }
    async getSessionHistory(sessionId) {
        return await (0, connection_1.query)(`SELECT * FROM translation_history 
       WHERE session_id = ? 
       ORDER BY created_at ASC`, [sessionId]);
    }
    async getUserActiveSessions(userId) {
        return await (0, connection_1.query)(`SELECT * FROM translation_sessions 
       WHERE user_id = ? AND ended_at IS NULL 
       ORDER BY started_at DESC`, [userId]);
    }
}
exports.default = new TranslationModel();
//# sourceMappingURL=translation.model.js.map