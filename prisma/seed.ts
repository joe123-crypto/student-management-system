import { PrismaClient, UserRole, AuthProvider } from '@prisma/client';
import { hash } from '@node-rs/argon2';

const prisma = new PrismaClient();

function dateOnly(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

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

function normalizeCode(value: string): string {
  return value.trim().replace(/\s+/g, '_').toUpperCase() || 'GENERAL';
}

async function getOrCreateAwardType(code: string, label: string) {
  const normalizedCode = normalizeCode(code);
  const existing = await prisma.awardType.findFirst({
    where: {
      code: {
        equals: normalizedCode,
        mode: 'insensitive',
      },
    },
  });

  if (existing) {
    return existing;
  }

  return prisma.awardType.create({
    data: {
      code: normalizedCode,
      label,
    },
  });
}

async function getOrCreateProgram(name: string, departmentId: number, systemType: string, durationYears: number) {
  const normalizedSystemType = normalizeCode(systemType);
  const existing = await prisma.program.findFirst({
    where: {
      name: {
        equals: name,
        mode: 'insensitive',
      },
      departmentId,
      systemType: normalizedSystemType,
    },
  });

  if (existing) {
    if (existing.durationYears !== durationYears) {
      return prisma.program.update({
        where: { id: existing.id },
        data: {
          durationYears,
        },
      });
    }
    return existing;
  }

  return prisma.program.create({
    data: {
      name,
      departmentId,
      systemType: normalizedSystemType,
      durationYears,
    },
  });
}

async function getOrCreateProgramAward(programId: number, awardTypeId: number, sequenceNo: number, nominalYear: number) {
  const existing = await prisma.programAward.findFirst({
    where: {
      programId,
      sequenceNo,
    },
  });

  if (existing) {
    return prisma.programAward.update({
      where: { id: existing.id },
      data: {
        awardTypeId,
        nominalYear,
      },
    });
  }

  return prisma.programAward.create({
    data: {
      programId,
      awardTypeId,
      sequenceNo,
      nominalYear,
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

  const seedAuthPassword = process.env.SEED_AUTH_PASSWORD?.trim();
  if (!seedAuthPassword) {
    throw new Error('SEED_AUTH_PASSWORD is required to seed auth users.');
  }

  const testPasswordHash = await hash(seedAuthPassword);

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
  const awardType = await getOrCreateAwardType('LICENCE', 'Licence');
  const program = await getOrCreateProgram('Computer Science', department.id, 'LMD', 4);
  const programAward = await getOrCreateProgramAward(program.id, awardType.id, 1, 4);
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
          dob: null,
          gender: 'M',
          homeAddressId: homeAddress.id,
        },
      })
    : await prisma.person.create({
        data: {
          givenName: 'Seed',
          familyName: 'Student',
          dob: null,
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
        issueDate: null,
        expiry: null,
      },
    });
  } else {
    await prisma.passport.create({
      data: {
        passportNo: '',
        issueDate: null,
        expiry: null,
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
        createdAt: new Date(),
      },
    });
  }

  const existingEnrollment = await prisma.enrollment.findFirst({
    where: {
      studentId: student.id,
    },
    orderBy: [{ startYear: 'desc' }, { id: 'desc' }],
  });

  const enrollment = existingEnrollment
    ? await prisma.enrollment.update({
        where: {
          id: existingEnrollment.id,
        },
        data: {
          startYear: 2026,
          endYear: 2030,
          currentStatus: 'pending',
          programId: program.id,
        },
      })
    : await prisma.enrollment.create({
        data: {
          startYear: 2026,
          endYear: 2030,
          currentStatus: 'pending',
          studentId: student.id,
          programId: program.id,
        },
      });

  await prisma.studentAward.deleteMany({
    where: {
      enrollmentId: enrollment.id,
    },
  });

  await prisma.enrollmentProgress.deleteMany({
    where: {
      enrollmentId: enrollment.id,
    },
  });

  await prisma.enrollmentProgress.create({
    data: {
      stageCode: 'L1',
      academicYear: '2026/2027',
      statusDate: dateOnly('2026-06-15'),
      resultStatus: 'pending',
      moyenne: null,
      enrollmentId: enrollment.id,
    },
  });

  await prisma.studentAward.create({
    data: {
      studentId: student.id,
      enrollmentId: enrollment.id,
      programAwardId: programAward.id,
      awardDate: null,
      status: 'pending',
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
          dateCreated: null,
          branchId: branch.id,
        },
    });
  } else {
    await prisma.account.create({
      data: {
        accountNo: '',
        rib: BigInt(0),
        currency: '',
        dateCreated: null,
        branchId: branch.id,
        personId: person.id,
      },
    });
  }

  console.log('Created Student:', studentAuthUser.loginId);
  console.log('Created Attache:', attacheAuthUser.loginId);
  console.log('Seed auth password:', seedAuthPassword);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
