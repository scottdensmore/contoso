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
  password?: string // Added password here
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
