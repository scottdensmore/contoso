import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

export interface CreateUserInput {
  email: string
  password: string
  name?: string
}

export interface UpdateUserInput {
  name?: string
  avatar?: string
  addressLine1?: string
  addressLine2?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
  phoneNumber?: string
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

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
  })
}

export async function updateUser(id: string, data: UpdateUserInput) {
  return prisma.user.update({
    where: { id },
    data,
  })
}

// Separate from updateUser so a password can only be written through a call
// that names it. The caller is responsible for hashing.
export async function updateUserPassword(id: string, hashedPassword: string) {
  return prisma.user.update({
    where: { id },
    data: { password: hashedPassword },
  })
}
