import { PrismaClient, UserRole, AuthProvider, StudentProfileStatus } from '@prisma/client';
import { hash } from '@node-rs/argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const testPasswordHash = await hash('password123');

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

  await prisma.studentProfileRecord.upsert({
    where: {
      inscriptionNumber: student.loginId,
    },
    update: {
      authUserId: student.id,
    },
    create: {
      id: 'student-profile-student123',
      authUserId: student.id,
      inscriptionNumber: student.loginId,
      fullName: 'Seed Student',
      status: StudentProfileStatus.PENDING,
      profile: {
        id: 'student-profile-student123',
        student: {
          fullName: 'Seed Student',
          givenName: 'Seed',
          familyName: 'Student',
          inscriptionNumber: student.loginId,
          registrationNumber: '',
          dateOfBirth: '',
          nationality: '',
          gender: 'M',
        },
        passport: {
          passportNumber: '',
          issueDate: '',
          expiryDate: '',
          issuingCountry: '',
        },
        university: {
          universityName: '',
          acronym: '',
          campus: '',
          city: '',
          department: '',
        },
        program: {
          degreeLevel: '',
          major: '',
          startDate: '',
          expectedEndDate: '',
          programType: '',
        },
        bankAccount: {
          accountHolderName: 'Seed Student',
          accountNumber: '',
          iban: '',
          swiftCode: '',
          dateCreated: '',
        },
        bank: {
          bankName: '',
          branchName: '',
          branchAddress: '',
          branchCode: '',
        },
        contact: {
          email: '',
          phone: '',
          emergencyContactName: '',
          emergencyContactPhone: '',
        },
        address: {
          homeCountryAddress: '',
          currentHostAddress: '',
          street: '',
          city: '',
          state: '',
          countryCode: '',
          wilaya: '',
        },
        status: 'PENDING',
        academicHistory: [],
      },
    },
  });

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

  console.log('Created Attache:', attache.loginId);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
