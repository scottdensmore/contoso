import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

export interface CreateUserInput {
  email: string
  password: string
  name?: string
}

export async function createUser(data: CreateUserInput) {
  const hashedPassword = await bcrypt.hash(data.password, 12)
  
  return prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      name: data.name,
    },
  })
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  })
}
