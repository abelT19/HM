import mysql from 'mysql2/promise';

const limit = 5;

// Define the shape of our global object
declare global {
  var _mysqlPool: mysql.Pool | undefined;
}

function createPool(): mysql.Pool {
  console.log("[DB] Creating new pool (connectionLimit=" + limit + ")");
  let instance: mysql.Pool;
  const connectionUri = process.env.DATABASE_URL;

  if (connectionUri) {
    console.log("[DB] using DATABASE_URL connection string");
    instance = mysql.createPool({
      uri: connectionUri,
      waitForConnections: true,
      connectionLimit: limit,
      ssl: {
        rejectUnauthorized: false
      },
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    } as any);
  } else {
    const pwd = process.env.DB_PASSWORD ?? "";
    if (pwd && (process.env.DB_USER === "root" || !process.env.DB_USER)) {
      console.warn("[DB] WARNING: non-empty password provided for root user. Check your .env.");
    }

    const config = {
      host: process.env.DB_HOST || "127.0.0.1",
      user: process.env.DB_USER || "root",
      password: pwd,
      database: process.env.DB_NAME || "hotel_db",
      connectionLimit: limit,
      waitForConnections: true,
    } as const;

    console.log("[DB] pool config:", {
      host: config.host,
      user: config.user,
      database: config.database,
      passwordSet: !!config.password,
    });

    instance = mysql.createPool(config);
  }
  return instance;
}

// Preserve the connection pool across hot reloads in development
if (!global._mysqlPool) {
  global._mysqlPool = createPool();
}

export const pool = global._mysqlPool;

export default pool;
