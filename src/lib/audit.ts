import { pool } from "./db";

/**
 * Antigravity High-Performance Audit Logic
 * Pulls data from the transactions table and groups them by interval.
 */
export async function getAuditReport(interval = 'day', startDate?: string, endDate?: string) {
  const connection = await pool.getConnection();
  try {
    // 1. Dynamic Date Grouping based on Admin need
    let dateGroup = "DATE_FORMAT(createdAt, '%Y-%m-%d')"; // Default: Day
    if (interval === 'week') dateGroup = "YEARWEEK(createdAt)";
    if (interval === 'month') dateGroup = "DATE_FORMAT(createdAt, '%Y-%m')";

    let query = `
      SELECT 
        ${dateGroup} as period,
        SUM(CASE WHEN type = 'ROOM' THEN amount ELSE 0 END) as roomRevenue,
        SUM(CASE WHEN type = 'FOOD' THEN amount ELSE 0 END) as foodRevenue,
        SUM(CASE WHEN type = 'MEMBERSHIP' THEN amount ELSE 0 END) as membershipRevenue,
        SUM(amount) as totalGrossETB,
        COUNT(CASE WHEN type = 'ROOM' THEN 1 END) as roomCount,
        COUNT(CASE WHEN type = 'FOOD' THEN 1 END) as orderCount,
        COUNT(CASE WHEN type = 'MEMBERSHIP' THEN 1 END) as membershipCount
      FROM transactions 
    `;

    const params: any[] = [];
    if (startDate && endDate) {
      query += " WHERE createdAt BETWEEN ? AND ? ";
      params.push(startDate, endDate);
    }

    query += `
      GROUP BY period 
      ORDER BY period DESC
    `;

    const [rows]: any = await connection.execute(query, params);
    
    // Also get the total available rooms
    const [rooms]: any = await connection.execute('SELECT COUNT(*) as total FROM room');
    const totalRooms = rooms[0]?.total || 0;

    const [activeRoomsRow]: any = await connection.execute("SELECT COUNT(*) as active FROM room WHERE status = 'OCCUPIED'");
    const activeRooms = activeRoomsRow[0]?.active || 0;

    const [availableRoomsRow]: any = await connection.execute("SELECT COUNT(*) as available FROM room WHERE status = 'AVAILABLE'");
    const availableRooms = availableRoomsRow[0]?.available || 0;

    const [allRooms]: any = await connection.execute("SELECT id, roomNumber, status FROM room ORDER BY roomNumber ASC");

    return {
      report: rows,
      totalRooms,
      activeRooms,
      availableRooms,
      allRooms
    };
  } finally {
    connection.release(); // Prevent the 'Lock wait timeout' error
  }
}

/**
 * Fetches detailed records for a specific transaction type.
 */
export async function getDetailedAudit(type: 'ROOM' | 'FOOD' | 'MEMBERSHIP', startDate?: string, endDate?: string) {
  const connection = await pool.getConnection();
  try {
    let query = "";
    const params: any[] = [];

    if (type === 'ROOM') {
      query = `
        SELECT t.id, t.amount, t.createdAt, b.guestName, b.roomId, b.checkIn, b.checkOut
        FROM transactions t
        JOIN booking b ON t.sourceId = b.id
        WHERE t.type = 'ROOM'
      `;
    } else if (type === 'FOOD') {
      query = `
        SELECT t.id, t.amount, t.createdAt, u.name as customerName, o.order_type as orderType
        FROM transactions t
        JOIN orders o ON t.sourceId = o.id
        LEFT JOIN User u ON o.userId = u.id
        WHERE t.type = 'FOOD'
      `;
    } else if (type === 'MEMBERSHIP') {
      query = `
        SELECT t.id, t.amount, t.createdAt, u.name as memberName, m.type as membershipType, m.membershipId
        FROM transactions t
        JOIN Memberships m ON t.sourceId = m.id
        JOIN User u ON m.userId = u.id
        WHERE t.type = 'MEMBERSHIP'
      `;
    }

    if (startDate && endDate) {
      query += " AND t.createdAt BETWEEN ? AND ? ";
      params.push(startDate, endDate);
    }

    query += " ORDER BY t.createdAt DESC ";

    const [rows] = await connection.execute(query, params);
    return rows;
  } finally {
    connection.release();
  }
}

/**
 * Fetches a consolidated list of all transactions with details from all categories.
 */
export async function getAllTransactionsDetail(startDate?: string, endDate?: string) {
  const connection = await pool.getConnection();
  try {
    let query = `
      SELECT 
        t.id, t.type, t.amount, t.createdAt,
        b.guestName, b.roomId,
        u_o.name as customerName, o.order_type as orderType,
        u_m.name as memberName, m.membershipId, m.type as membershipType
      FROM transactions t
      LEFT JOIN booking b ON t.sourceId = b.id AND t.type = 'ROOM'
      LEFT JOIN orders o ON t.sourceId = o.id AND t.type = 'FOOD'
      LEFT JOIN User u_o ON o.userId = u_o.id
      LEFT JOIN Memberships m ON t.sourceId = m.id AND t.type = 'MEMBERSHIP'
      LEFT JOIN User u_m ON m.userId = u_m.id
    `;

    const params: any[] = [];
    if (startDate && endDate) {
      query += " WHERE t.createdAt BETWEEN ? AND ? ";
      params.push(startDate, endDate);
    }

    query += " ORDER BY t.createdAt DESC ";

    const [rows] = await connection.execute(query, params);
    return rows;
  } finally {
    connection.release();
  }
}

/**
 * Records a new transaction in the audit log.
 */
export async function recordTransaction(type: 'ROOM' | 'FOOD' | 'MEMBERSHIP', amount: number, sourceId: string | number) {
  const connection = await pool.getConnection();
  try {
    await connection.execute(
      "INSERT INTO transactions (type, amount, sourceId) VALUES (?, ?, ?)",
      [type, amount, sourceId]
    );
  } finally {
    connection.release();
  }
}
