import { PrismaClient, UserRole, AuthProvider } from '@prisma/client';
import { hash } from '@node-rs/argon2';

const prisma = new PrismaClient();

async function getOrCreateProvince(name: string) {
  const existing = await prisma.province.findFirst({
    where: {
      name: {
        equals: name,
        mode: 'insensitive',
      },
    },
  });

  if (existing) {
    return existing;
  }

  return prisma.province.create({
    data: { name },
  });
}

async function getOrCreateAddress(name: string, provinceName: string) {
  const province = await getOrCreateProvince(provinceName);
  const existing = await prisma.address.findFirst({
    where: {
      name: {
        equals: name,
        mode: 'insensitive',
      },
      wilayaId: province.id,
    },
  });

  if (existing) {
    return existing;
  }

  return prisma.address.create({
    data: {
      name,
      wilayaId: province.id,
    },
  });
}

async function getOrCreateDepartment(name: string) {
  const existing = await prisma.department.findFirst({
    where: {
      name: {
        equals: name,
        mode: 'insensitive',
      },
    },
  });

  if (existing) {
    return existing;
  }

  return prisma.department.create({
    data: {
      name,
      description: `${name} department`,
    },
  });
}

async function getOrCreateProgramType(name: string, defaultDuration: number) {
  const existing = await prisma.programType.findFirst({
    where: {
      name: {
        equals: name,
        mode: 'insensitive',
      },
    },
  });

  if (existing) {
    return existing;
  }

  return prisma.programType.create({
    data: {
      name,
      defaultDuration,
    },
  });
}

async function getOrCreateProgram(name: string, departmentId: number, programTypeId: number) {
  const existing = await prisma.program.findFirst({
    where: {
      name: {
        equals: name,
        mode: 'insensitive',
      },
      departmentId,
      programTypeId,
    },
  });

  if (existing) {
    return existing;
  }

  return prisma.program.create({
    data: {
      name,
      description: name,
      departmentId,
      programTypeId,
    },
  });
}

async function getOrCreateBank(name: string, code: number, addressId: number) {
  const existing = await prisma.bank.findFirst({
    where: {
      name: {
        equals: name,
        mode: 'insensitive',
      },
      code,
    },
  });

  if (existing) {
    return existing;
  }

  return prisma.bank.create({
    data: {
      name,
      code,
      addressId,
    },
  });
}

async function getOrCreateBranch(name: string, code: number, addressId: number, bankId: number) {
  const existing = await prisma.branch.findFirst({
    where: {
      bankId,
      code,
    },
  });

  if (existing) {
    return existing;
  }

  return prisma.branch.create({
    data: {
      name,
      code,
      addressId,
      bankId,
    },
  });
}

async function main() {
  console.log('Seeding database...');

  const seedPassword = (process.env.SEED_AUTH_PASSWORD ?? 'ScholarsDemo!2026').trim();
  const testPasswordHash = await hash(seedPassword);

  const studentAuthUser = await prisma.authUser.upsert({
    where: {
      role_loginId: {
        role: UserRole.STUDENT,
        loginId: 'STUDENT123',
      },
    },
    update: {
      passwordHash: testPasswordHash,
      isActive: true,
    },
    create: {
      role: UserRole.STUDENT,
      loginId: 'STUDENT123',
      authProvider: AuthProvider.student_inscription,
      passwordHash: testPasswordHash,
      isActive: true,
    },
  });

  const attacheAuthUser = await prisma.authUser.upsert({
    where: {
      role_loginId: {
        role: UserRole.ATTACHE,
        loginId: 'admin@scholarsalger.dz',
      },
    },
    update: {
      passwordHash: testPasswordHash,
      isActive: true,
    },
    create: {
      role: UserRole.ATTACHE,
      loginId: 'admin@scholarsalger.dz',
      authProvider: AuthProvider.attache_email,
      passwordHash: testPasswordHash,
      isActive: true,
    },
  });

  const homeAddress = await getOrCreateAddress('123 Example Street', 'Algiers');
  const hostAddress = await getOrCreateAddress('Campus Residence Block A', 'Oran');
  const campusAddress = await getOrCreateAddress('USTO Campus', 'Oran');
  const branchAddress = await getOrCreateAddress('Banque Nationale Branch 1', 'Oran');
  const department = await getOrCreateDepartment('Computer Science');
  const programType = await getOrCreateProgramType('Bachelors', 4);
  const program = await getOrCreateProgram('Computer Science', department.id, programType.id);
  const bank = await getOrCreateBank('Banque Nationale', 10000, branchAddress.id);
  const branch = await getOrCreateBranch('Main Branch', 1001, branchAddress.id, bank.id);

  const existingUniversity = await prisma.university.findFirst({
    where: {
      name: {
        equals: 'University of Science and Technology of Oran',
        mode: 'insensitive',
      },
      acronym: {
        equals: 'USTO',
        mode: 'insensitive',
      },
    },
  });

  if (existingUniversity) {
    await prisma.university.update({
      where: {
        id: existingUniversity.id,
      },
      data: {
        name: 'University of Science and Technology of Oran',
        acronym: 'USTO',
        addressId: campusAddress.id,
      },
    });
  } else {
    await prisma.university.create({
      data: {
        name: 'University of Science and Technology of Oran',
        acronym: 'USTO',
        addressId: campusAddress.id,
      },
    });
  }

  const existingStudent = await prisma.student.findUnique({
    where: {
      inscriptionNo: studentAuthUser.loginId,
    },
    include: {
      person: true,
    },
  });

  const person = existingStudent
    ? await prisma.person.update({
        where: {
          id: existingStudent.personId,
        },
        data: {
          givenName: 'Seed',
          familyName: 'Student',
          dob: '',
          gender: 'M',
          homeAddressId: homeAddress.id,
        },
      })
    : await prisma.person.create({
        data: {
          givenName: 'Seed',
          familyName: 'Student',
          dob: '',
          gender: 'M',
          homeAddressId: homeAddress.id,
        },
      });

  const student = existingStudent
    ? await prisma.student.update({
        where: {
          id: existingStudent.id,
        },
        data: {
          addressId: hostAddress.id,
        },
      })
    : await prisma.student.create({
        data: {
          personId: person.id,
          inscriptionNo: studentAuthUser.loginId,
          addressId: hostAddress.id,
        },
      });

  const existingPassport = await prisma.passport.findFirst({
    where: {
      personId: person.id,
    },
  });

  if (existingPassport) {
    await prisma.passport.update({
      where: {
        id: existingPassport.id,
      },
      data: {
        passportNo: '',
        issueDate: '',
        expiry: '',
      },
    });
  } else {
    await prisma.passport.create({
      data: {
        passportNo: '',
        issueDate: '',
        expiry: '',
        personId: person.id,
      },
    });
  }

  const contactSeeds = [
    { type: 'EMAIL', label: 'primary', value: '', isPrimary: true },
    { type: 'PHONE', label: 'mobile', value: '', isPrimary: true },
    { type: 'EMERGENCY', label: 'name', value: '', isPrimary: false },
    { type: 'EMERGENCY', label: 'phone', value: '', isPrimary: false },
  ] as const;

  for (const contactSeed of contactSeeds) {
    const existingContact = await prisma.contact.findFirst({
      where: {
        ownerId: person.id,
        type: contactSeed.type,
        label: contactSeed.label,
      },
    });

    if (existingContact) {
      await prisma.contact.update({
        where: {
          id: existingContact.id,
        },
        data: {
          value: contactSeed.value,
          isPrimary: contactSeed.isPrimary,
        },
      });
      continue;
    }

    await prisma.contact.create({
      data: {
        ownerId: person.id,
        type: contactSeed.type,
        label: contactSeed.label,
        value: contactSeed.value,
        isPrimary: contactSeed.isPrimary,
        createdAt: new Date().toISOString(),
      },
    });
  }

  const existingEnrollment = await prisma.enrollment.findFirst({
    where: {
      studentId: student.id,
    },
    orderBy: [{ dateEnrolled: 'desc' }, { id: 'desc' }],
  });

  const enrollment = existingEnrollment
    ? await prisma.enrollment.update({
        where: {
          id: existingEnrollment.id,
        },
        data: {
          registrationNo: 'REG-2026-001',
          dateEnrolled: '2026-01-10',
          status: 'PENDING',
          programId: program.id,
        },
      })
    : await prisma.enrollment.create({
        data: {
          registrationNo: 'REG-2026-001',
          dateEnrolled: '2026-01-10',
          status: 'PENDING',
          studentId: student.id,
          programId: program.id,
        },
      });

  await prisma.progress.deleteMany({
    where: {
      enrollmentId: enrollment.id,
    },
  });

  const existingAccount = await prisma.account.findFirst({
    where: {
      personId: person.id,
    },
  });

  if (existingAccount) {
    await prisma.account.update({
      where: {
        id: existingAccount.id,
      },
        data: {
          accountNo: '',
          rib: BigInt(0),
          currency: '',
          dateCreated: '',
          branchId: branch.id,
        },
    });
  } else {
    await prisma.account.create({
      data: {
        accountNo: '',
        rib: BigInt(0),
        currency: '',
        dateCreated: '',
        branchId: branch.id,
        personId: person.id,
      },
    });
  }

  console.log('Created Student:', studentAuthUser.loginId);
  console.log('Created Attache:', attacheAuthUser.loginId);
  console.log('Seed auth password:', seedPassword);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
