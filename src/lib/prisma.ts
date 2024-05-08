import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
	return new PrismaClient()
}

type PrismaCLientSingleton = ReturnType<typeof prismaClientSingleton>

declare global {
	/* eslint-disable-next-line*/
	var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

const globalForPrisma = globalThis as unknown as {
	prisma: PrismaCLientSingleton | undefined
}

const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
