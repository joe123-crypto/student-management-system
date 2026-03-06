import { PrismaClient, UserRole, AuthProvider } from '@prisma/client';
import { hash } from '@node-rs/argon2';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    // Hash the password for our test users
    const testPasswordHash = await hash('password123');

    // 1. Insert a Test Student
    const student = await prisma.authUser.upsert({
        where: {
            role_loginId: {
                role: UserRole.STUDENT,
                loginId: 'STUDENT123',
            },
        },
        update: {},
        create: {
            role: UserRole.STUDENT,
            loginId: 'STUDENT123',
            subject: 'Computer Science',
            authProvider: AuthProvider.student_inscription,
            passwordHash: testPasswordHash,
            isActive: true,
        },
    });

    console.log('Created Student:', student.loginId);

    // 2. Insert a Test Attaché
    const attache = await prisma.authUser.upsert({
        where: {
            role_loginId: {
                role: UserRole.ATTACHE,
                loginId: 'admin@scholarsalger.dz',
            },
        },
        update: {},
        create: {
            role: UserRole.ATTACHE,
            loginId: 'admin@scholarsalger.dz',
            subject: 'Administration',
            authProvider: AuthProvider.attache_email,
            passwordHash: testPasswordHash,
            isActive: true,
        },
    });

    console.log('Created Attaché:', attache.loginId);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
