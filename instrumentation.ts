import { registerOTel } from '@vercel/otel'
import { PrismaInstrumentation } from '@prisma/instrumentation'

export function register() {
    registerOTel({
        serviceName: 'aethelon-landing',
        instrumentations: [new PrismaInstrumentation()],
    })
}
