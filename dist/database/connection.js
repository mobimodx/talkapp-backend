"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeDatabasePool = exports.query = exports.getConnection = exports.createDatabasePool = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
const config_1 = __importDefault(require("../config"));
let pool = null;
const createDatabasePool = () => {
    if (pool) {
        return pool;
    }
    pool = promise_1.default.createPool({
        host: config_1.default.database.host,
        port: config_1.default.database.port,
        user: config_1.default.database.user,
        password: config_1.default.database.password,
        database: config_1.default.database.name,
        waitForConnections: true,
        connectionLimit: 10,
        maxIdle: 10,
        idleTimeout: 60000,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0,
    });
    return pool;
};
exports.createDatabasePool = createDatabasePool;
const getConnection = async () => {
    if (!pool) {
        pool = (0, exports.createDatabasePool)();
    }
    return await pool.getConnection();
};
exports.getConnection = getConnection;
const query = async (sql, params) => {
    if (!pool) {
        pool = (0, exports.createDatabasePool)();
    }
    const [rows] = await pool.execute(sql, params);
    return rows;
};
exports.query = query;
const closeDatabasePool = async () => {
    if (pool) {
        await pool.end();
        pool = null;
    }
};
exports.closeDatabasePool = closeDatabasePool;
exports.default = {
    createDatabasePool: exports.createDatabasePool,
    getConnection: exports.getConnection,
    query: exports.query,
    closeDatabasePool: exports.closeDatabasePool,
};
//# sourceMappingURL=connection.js.map