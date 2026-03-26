import mysql from 'mysql2/promise';

// Define the shape of our global object for hot reload consistency in development
declare global {
  var _mysqlPool: mysql.Pool | undefined;
}

function createPool(): mysql.Pool {
  const connectionUri = process.env.DATABASE_URL?.trim();

  if (connectionUri) {
    try {
      const url = new URL(connectionUri);
      
      // DIAGNOSTICS: Character code logging to find invisible garbage characters
      const host = url.hostname;
      const charCodes = Array.from(host).map(c => c.charCodeAt(0)).join(',');
      console.log(`[DB] Parsing hostname: "${host}" (Length: ${host.length}, CharCodes: ${charCodes})`);

      const config: any = {
        host: host,
        port: parseInt(url.port) || 3306,
        user: url.username,
        password: url.password,
        database: url.pathname.substring(1),
        ssl: {
          rejectUnauthorized: false
        },
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0
      };

      console.log(`[DB] Pool Config: host=${config.host}, port=${config.port}, user=${config.user}, database=${config.database}`);

      return mysql.createPool(config);
    } catch (e: any) {
      console.error("[DB] Critical Error during pool creation:", e.message || e);
      throw e;
    }
  } else {
    // Fallback for local development
    return mysql.createPool({
      host: process.env.DB_HOST || "127.0.0.1",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "hotel_db",
      connectionLimit: 10,
      waitForConnections: true,
    });
  }
}

// Preserve the connection pool across hot reloads in development
if (!global._mysqlPool) {
  global._mysqlPool = createPool();
}

export const pool = global._mysqlPool;

export default pool;
