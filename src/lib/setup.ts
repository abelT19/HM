import { pool } from "./db";

export async function ensureDatabaseSetup() {
  try {
    // 1. Create User Table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS User (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(100),
        email VARCHAR(100) UNIQUE,
        phone VARCHAR(20),
        password VARCHAR(255),
        role VARCHAR(20) DEFAULT 'GUEST',
        status VARCHAR(20) DEFAULT 'ACTIVE',
        government_id_url VARCHAR(255),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // 2. Create Room Table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS Room (
        id VARCHAR(36) PRIMARY KEY,
        roomNumber VARCHAR(10) UNIQUE,
        type VARCHAR(20),
        price DECIMAL(10,2),
        capacity INT DEFAULT 2,
        status VARCHAR(20) DEFAULT 'AVAILABLE',
        isAvailable BOOLEAN DEFAULT TRUE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // 3. Create Booking Table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS Booking (
        id VARCHAR(36) PRIMARY KEY,
        userId VARCHAR(36),
        guestName VARCHAR(100),
        guestEmail VARCHAR(100),
        numGuests INT DEFAULT 1,
        checkIn DATE,
        checkOut DATE,
        totalPrice DECIMAL(10,2),
        status VARCHAR(30) DEFAULT 'PENDING_VERIFICATION',
        roomId VARCHAR(36),
        payment_proof_url VARCHAR(255),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (roomId) REFERENCES Room(id)
      )
    `);

    // 4. Create Orders & Transactions
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS Orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId VARCHAR(36),
        dishName VARCHAR(255) NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        unit_price DECIMAL(10,2),
        total_price DECIMAL(10,2),
        receipt_url VARCHAR(255),
        delivery_details VARCHAR(255),
        status ENUM('PENDING', 'APPROVED', 'REJECTED', 'PREPARING', 'DELIVERED') DEFAULT 'PENDING',
        rejection_reason TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        type ENUM('ROOM', 'FOOD', 'MEMBERSHIP'),
        amount DECIMAL(10,2),
        sourceId VARCHAR(36),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS Memberships (
        id VARCHAR(36) PRIMARY KEY,
        userId VARCHAR(36),
        type VARCHAR(20),
        receipt_url VARCHAR(255),
        membershipId VARCHAR(50) UNIQUE,
        status VARCHAR(20) DEFAULT 'PENDING',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 5. Seed Rooms if empty
    const [rooms]: any = await pool.execute("SELECT COUNT(*) as count FROM Room");
    if (rooms[0].count === 0) {
      console.log("[Setup] Seeding initial rooms...");
      const initialRooms = [
        [crypto.randomUUID(), '101', 'SINGLE', 2000, 1],
        [crypto.randomUUID(), '102', 'SINGLE', 2000, 1],
        [crypto.randomUUID(), '201', 'DOUBLE', 4000, 2],
        [crypto.randomUUID(), '202', 'DOUBLE', 4000, 2],
        [crypto.randomUUID(), '301', 'FAMILY', 6000, 4],
        [crypto.randomUUID(), '401', 'PRESIDENTIAL', 12000, 2]
      ];

      for (const [id, roomNumber, type, price, capacity] of initialRooms) {
        await pool.execute(
          "INSERT INTO Room (id, roomNumber, type, price, capacity, status, isAvailable) VALUES (?, ?, ?, ?, ?, 'AVAILABLE', true)",
          [id, roomNumber, type, price, capacity]
        );
      }
    }

    console.log("[Setup] Database self-healing check complete.");
  } catch (error) {
    console.error("[Setup] Critical Database Setup Error:", error);
    // Silent fail to allow the app to try to run anyway
  }
}
