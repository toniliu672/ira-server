// prisma/seed.js

import { PrismaClient } from '@prisma/client'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { spawn } from 'child_process'

const prisma = new PrismaClient()
const __dirname = dirname(fileURLToPath(import.meta.url))

async function main() {
  // Uncomment seed yang diperlukan
  
  // Seed Admin
  // spawn('node', [join(__dirname, 'seeds', 'admin.js')], { stdio: 'inherit' })
  
// Seed Essay Quiz
 spawn('node', [join(__dirname, 'seeds', 'essay.js')], { stdio: 'inherit' })

  // Seed Quiz
  spawn('node', [join(__dirname, 'seeds', 'quiz.js')], { stdio: 'inherit' })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })