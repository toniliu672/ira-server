// prisma/seeds/admin.js

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  // Hash password
  const hashedPassword = await bcrypt.hash('12345678', 10)

  // Create admin
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@gmail.com' },
    update: {},
    create: {
      username: 'admin',
      name: 'Administrator',
      email: 'admin@gmail.com',
      password: hashedPassword,
    },
  })

  console.log({ admin })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })