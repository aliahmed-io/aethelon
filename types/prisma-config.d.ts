import '@prisma/config';

declare module '@prisma/config' {
    export interface PrismaConfig {
        datasource?: {
            url?: string;
            directUrl?: string;
            shadowDatabaseUrl?: string;
        }
    }
}
