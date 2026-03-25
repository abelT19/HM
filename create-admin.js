const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('12345', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'abeltariku43@gmail.com' },
    update: {
      password: hashedPassword,
      role: 'ADMIN'
    },
    create: {
      email: 'abeltariku43@gmail.com',
      password: hashedPassword,
      name: 'Abel',
      role: 'ADMIN',
    },
  });

  console.log('✅ Admin account updated with hashed password!');
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());