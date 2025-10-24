"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const connection_1 = require("../database/connection");
const helpers_1 = require("../utils/helpers");
class TeacherModel {
    async getOrCreateWord(data) {
        const existing = await (0, connection_1.query)('SELECT id FROM words WHERE word = ? AND language = ?', [data.word, data.language]);
        if (existing.length > 0) {
            return existing[0].id;
        }
        const result = await (0, connection_1.query)(`INSERT INTO words (word, language, translation, difficulty, category) 
       VALUES (?, ?, ?, ?, ?)`, [data.word, data.language, data.translation || null, data.difficulty || 'beginner', data.category || null]);
        return result.insertId;
    }
    async getUserLearnedWords(userId, language) {
        const rows = await (0, connection_1.query)('SELECT word FROM learned_words WHERE user_id = ? AND language = ?', [userId, language]);
        return rows.map(row => row.word);
    }
    async createSession(userId, language, wordsCount) {
        const result = await (0, connection_1.query)(`INSERT INTO teacher_sessions (user_id, language, words_count, completed_words, progress)
       VALUES (?, ?, ?, 0, 0)`, [userId, language, wordsCount]);
        return result.insertId;
    }
    async addWordsToSession(sessionId, words) {
        const values = words.map(w => [sessionId, w.wordId, w.word, w.translation || null]);
        for (const value of values) {
            await (0, connection_1.query)(`INSERT INTO teacher_session_words (session_id, word_id, word, translation, is_completed)
         VALUES (?, ?, ?, ?, FALSE)`, value);
        }
    }
    async getSession(sessionId) {
        const rows = await (0, connection_1.query)(`SELECT 
        id,
        user_id as userId,
        language,
        words_count as wordsCount,
        completed_words as completedWords,
        progress,
        started_at as startedAt,
        completed_at as completedAt
       FROM teacher_sessions 
       WHERE id = ?`, [sessionId]);
        return rows.length > 0 ? rows[0] : null;
    }
    async getSessionWords(sessionId) {
        const rows = await (0, connection_1.query)(`SELECT 
        id,
        session_id as sessionId,
        word_id as wordId,
        word,
        translation,
        is_completed as isCompleted,
        completed_at as completedAt
       FROM teacher_session_words 
       WHERE session_id = ? 
       ORDER BY id`, [sessionId]);
        return rows;
    }
    async completeSessionWord(sessionId, wordId) {
        await (0, connection_1.query)(`UPDATE teacher_session_words 
       SET is_completed = TRUE, completed_at = CURRENT_TIMESTAMP 
       WHERE session_id = ? AND word_id = ?`, [sessionId, wordId]);
        await this.updateSessionProgress(sessionId);
    }
    async updateSessionProgress(sessionId) {
        const session = await this.getSession(sessionId);
        if (!session)
            return;
        const completed = await (0, connection_1.query)('SELECT COUNT(*) as count FROM teacher_session_words WHERE session_id = ? AND is_completed = TRUE', [sessionId]);
        const completedCount = completed[0]?.count || 0;
        const progress = (completedCount / session.wordsCount) * 100;
        await (0, connection_1.query)(`UPDATE teacher_sessions 
       SET completed_words = ?, progress = ? ${completedCount === session.wordsCount ? ', completed_at = CURRENT_TIMESTAMP' : ''}
       WHERE id = ?`, [completedCount, progress, sessionId]);
    }
    async markWordAsLearned(userId, wordId, word, language) {
        try {
            const result = await (0, connection_1.query)(`INSERT INTO learned_words (user_id, word_id, language, word, review_count, last_reviewed_at)
         VALUES (?, ?, ?, ?, 1, CURRENT_TIMESTAMP)
         ON DUPLICATE KEY UPDATE review_count = review_count + 1, last_reviewed_at = CURRENT_TIMESTAMP`, [userId, wordId, language, word]);
            console.log(`✅ Word marked as learned: userId=${userId}, wordId=${wordId}, word="${word}", affectedRows=${result.affectedRows}`);
            await this.updateDailyProgress(userId);
        }
        catch (error) {
            console.error('❌ Error marking word as learned:', error);
            throw error;
        }
    }
    async updateDailyProgress(userId) {
        try {
            const today = (0, helpers_1.getCurrentDate)();
            const result = await (0, connection_1.query)(`SELECT COUNT(*) as count FROM learned_words 
         WHERE user_id = ? AND DATE(learned_at) = ?`, [userId, today]);
            const wordsLearned = result[0]?.count || 0;
            const totalWords = 10;
            const progressPercentage = Math.min((wordsLearned / totalWords) * 100, 100);
            console.log(`📊 Daily progress: userId=${userId}, today=${today}, wordsLearned=${wordsLearned}, progress=${progressPercentage}%`);
            await (0, connection_1.query)(`INSERT INTO daily_progress (user_id, date, words_learned, total_words, progress_percentage)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE 
           words_learned = ?, 
           progress_percentage = ?`, [userId, today, wordsLearned, totalWords, progressPercentage, wordsLearned, progressPercentage]);
        }
        catch (error) {
            console.error('❌ Error updating daily progress:', error);
            throw error;
        }
    }
    async getDailyProgress(userId, date) {
        const targetDate = date || (0, helpers_1.getCurrentDate)();
        const rows = await (0, connection_1.query)(`SELECT 
        user_id as userId,
        date,
        words_learned as wordsLearned,
        total_words as totalWords,
        progress_percentage as progressPercentage
       FROM daily_progress 
       WHERE user_id = ? AND date = ?`, [userId, targetDate]);
        if (rows.length === 0) {
            return {
                userId,
                date: targetDate,
                wordsLearned: 0,
                totalWords: 10,
                progressPercentage: 0,
            };
        }
        return rows[0];
    }
    async getProgressHistory(userId, days = 7) {
        const rows = await (0, connection_1.query)(`SELECT 
        user_id as userId,
        date,
        words_learned as wordsLearned,
        total_words as totalWords,
        progress_percentage as progressPercentage
       FROM daily_progress 
       WHERE user_id = ? 
       ORDER BY date DESC 
       LIMIT ?`, [userId, days]);
        return rows;
    }
    async getUserLearnedWordsCount(userId, language) {
        const languageFilter = language ? 'AND language = ?' : '';
        const params = language ? [userId, language] : [userId];
        const result = await (0, connection_1.query)(`SELECT COUNT(*) as count FROM learned_words WHERE user_id = ? ${languageFilter}`, params);
        return result[0]?.count || 0;
    }
}
exports.default = new TeacherModel();
//# sourceMappingURL=teacher.model.js.map