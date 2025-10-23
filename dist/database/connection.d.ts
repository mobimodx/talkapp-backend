import mysql from 'mysql2/promise';
export declare const createDatabasePool: () => mysql.Pool;
export declare const getConnection: () => Promise<mysql.PoolConnection>;
export declare const query: <T = any>(sql: string, params?: any[]) => Promise<T>;
export declare const closeDatabasePool: () => Promise<void>;
declare const _default: {
    createDatabasePool: () => mysql.Pool;
    getConnection: () => Promise<mysql.PoolConnection>;
    query: <T = any>(sql: string, params?: any[]) => Promise<T>;
    closeDatabasePool: () => Promise<void>;
};
export default _default;
//# sourceMappingURL=connection.d.ts.map