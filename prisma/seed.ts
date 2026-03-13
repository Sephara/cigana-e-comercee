import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import * as bcrypt from 'bcryptjs'

const url = process.env.DATABASE_URL
if (!url) throw new Error('DATABASE_URL não configurada')

const pool = new Pool({ connectionString: url })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const DEFAULT_CATEGORIES = ['geral', 'boné', 'conjunto']

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@cigana.com'
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'

  const existingUser = await prisma.user.findUnique({ where: { email: adminEmail } })
  if (!existingUser) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10)
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: 'Admin',
        role: 'admin',
      },
    })
    console.log('Admin criado:', adminEmail, '| Senha:', adminPassword)
  } else {
    console.log('Admin já existe:', adminEmail)
  }

  for (const name of DEFAULT_CATEGORIES) {
    await prisma.category.upsert({
      where: { name },
      create: { name },
      update: {},
    })
  }
  console.log('Categorias padrão:', DEFAULT_CATEGORIES.join(', '))
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
