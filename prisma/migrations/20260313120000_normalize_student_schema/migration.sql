-- Normalize student persistence and remove auth-domain leakage from AuthUser.

-- Deduplicate student auth records that only differ by login-id casing before normalizing login IDs.
WITH ranked AS (
    SELECT id, canonical_id
    FROM (
        SELECT
            au.id,
            FIRST_VALUE(au.id) OVER (
                PARTITION BY au.role, UPPER(au."loginId")
                ORDER BY
                    CASE
                        WHEN EXISTS (
                            SELECT 1
                            FROM "StudentProfileRecord" spr
                            WHERE spr."authUserId" = au.id
                        ) THEN 0
                        ELSE 1
                    END,
                    au."createdAt",
                    au.id
            ) AS canonical_id,
            ROW_NUMBER() OVER (
                PARTITION BY au.role, UPPER(au."loginId")
                ORDER BY
                    CASE
                        WHEN EXISTS (
                            SELECT 1
                            FROM "StudentProfileRecord" spr
                            WHERE spr."authUserId" = au.id
                        ) THEN 0
                        ELSE 1
                    END,
                    au."createdAt",
                    au.id
            ) AS rn
        FROM "AuthUser" au
        WHERE au.role = 'STUDENT'
    ) dedup
    WHERE rn > 1
)
UPDATE "AuditLog" al
SET "userId" = ranked.canonical_id
FROM ranked
WHERE al."userId" = ranked.id;

WITH ranked AS (
    SELECT id, canonical_id
    FROM (
        SELECT
            au.id,
            FIRST_VALUE(au.id) OVER (
                PARTITION BY au.role, UPPER(au."loginId")
                ORDER BY
                    CASE
                        WHEN EXISTS (
                            SELECT 1
                            FROM "StudentProfileRecord" spr
                            WHERE spr."authUserId" = au.id
                        ) THEN 0
                        ELSE 1
                    END,
                    au."createdAt",
                    au.id
            ) AS canonical_id,
            ROW_NUMBER() OVER (
                PARTITION BY au.role, UPPER(au."loginId")
                ORDER BY
                    CASE
                        WHEN EXISTS (
                            SELECT 1
                            FROM "StudentProfileRecord" spr
                            WHERE spr."authUserId" = au.id
                        ) THEN 0
                        ELSE 1
                    END,
                    au."createdAt",
                    au.id
            ) AS rn
        FROM "AuthUser" au
        WHERE au.role = 'STUDENT'
    ) dedup
    WHERE rn > 1
)
UPDATE "StudentProfileRecord" spr
SET "authUserId" = ranked.canonical_id
FROM ranked
WHERE spr."authUserId" = ranked.id;

WITH ranked AS (
    SELECT id
    FROM (
        SELECT
            au.id,
            ROW_NUMBER() OVER (
                PARTITION BY au.role, UPPER(au."loginId")
                ORDER BY
                    CASE
                        WHEN EXISTS (
                            SELECT 1
                            FROM "StudentProfileRecord" spr
                            WHERE spr."authUserId" = au.id
                        ) THEN 0
                        ELSE 1
                    END,
                    au."createdAt",
                    au.id
            ) AS rn
        FROM "AuthUser" au
        WHERE au.role = 'STUDENT'
    ) dedup
    WHERE rn > 1
)
DELETE FROM "AuthUser" au
USING ranked
WHERE au.id = ranked.id;

UPDATE "AuthUser"
SET "loginId" = UPPER("loginId")
WHERE role = 'STUDENT';

-- Create normalized student tables.
CREATE TABLE "PROVINCE" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "PROVINCE_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ADDRESS" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "wilaya_id" INTEGER,

    CONSTRAINT "ADDRESS_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PERSON" (
    "id" SERIAL NOT NULL,
    "given_name" TEXT NOT NULL,
    "family_name" TEXT NOT NULL,
    "dob" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "home_address_id" INTEGER,

    CONSTRAINT "PERSON_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "STUDENT" (
    "id" SERIAL NOT NULL,
    "person_id" INTEGER NOT NULL,
    "inscription_no" TEXT NOT NULL,
    "address_id" INTEGER,

    CONSTRAINT "STUDENT_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PASSPORT" (
    "id" SERIAL NOT NULL,
    "passport_no" TEXT NOT NULL,
    "issue_date" TEXT NOT NULL,
    "expiry" TEXT NOT NULL,
    "person_id" INTEGER NOT NULL,

    CONSTRAINT "PASSPORT_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CONTACT" (
    "id" SERIAL NOT NULL,
    "owner_id" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TEXT NOT NULL,

    CONSTRAINT "CONTACT_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "UNIVERSITY" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "acronym" TEXT NOT NULL,
    "address_id" INTEGER,

    CONSTRAINT "UNIVERSITY_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DEPARTMENT" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "DEPARTMENT_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PROGRAMTYPE" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "default_duration" INTEGER NOT NULL,

    CONSTRAINT "PROGRAMTYPE_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PROGRAM" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "department_id" INTEGER NOT NULL,
    "programtype_id" INTEGER NOT NULL,

    CONSTRAINT "PROGRAM_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ENROLLMENT" (
    "id" SERIAL NOT NULL,
    "registration_no" TEXT NOT NULL,
    "date_enrolled" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "student_id" INTEGER NOT NULL,
    "program_id" INTEGER NOT NULL,

    CONSTRAINT "ENROLLMENT_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PROGRESS" (
    "id" SERIAL NOT NULL,
    "date" TEXT NOT NULL,
    "semester" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "enrollment_id" INTEGER NOT NULL,

    CONSTRAINT "PROGRESS_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BANK" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" INTEGER NOT NULL,
    "address_id" INTEGER,

    CONSTRAINT "BANK_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BRANCH" (
    "id" SERIAL NOT NULL,
    "code" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "address_id" INTEGER,
    "bank_id" INTEGER NOT NULL,

    CONSTRAINT "BRANCH_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ACCOUNT" (
    "id" SERIAL NOT NULL,
    "account_no" TEXT NOT NULL,
    "rib" BIGINT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT '',
    "date_created" TEXT NOT NULL,
    "branch_id" INTEGER NOT NULL,
    "person_id" INTEGER NOT NULL,

    CONSTRAINT "ACCOUNT_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "STUDENT_person_id_key" ON "STUDENT"("person_id");
CREATE UNIQUE INDEX "STUDENT_inscription_no_key" ON "STUDENT"("inscription_no");
CREATE INDEX "ADDRESS_name_idx" ON "ADDRESS"("name");
CREATE INDEX "ADDRESS_wilaya_id_idx" ON "ADDRESS"("wilaya_id");
CREATE INDEX "PROVINCE_name_idx" ON "PROVINCE"("name");
CREATE INDEX "PERSON_given_name_idx" ON "PERSON"("given_name");
CREATE INDEX "PERSON_family_name_idx" ON "PERSON"("family_name");
CREATE INDEX "PERSON_home_address_id_idx" ON "PERSON"("home_address_id");
CREATE INDEX "STUDENT_address_id_idx" ON "STUDENT"("address_id");
CREATE INDEX "PASSPORT_person_id_idx" ON "PASSPORT"("person_id");
CREATE INDEX "PASSPORT_passport_no_idx" ON "PASSPORT"("passport_no");
CREATE INDEX "CONTACT_owner_id_type_idx" ON "CONTACT"("owner_id", "type");
CREATE INDEX "CONTACT_owner_id_type_label_idx" ON "CONTACT"("owner_id", "type", "label");
CREATE INDEX "UNIVERSITY_name_idx" ON "UNIVERSITY"("name");
CREATE INDEX "UNIVERSITY_address_id_idx" ON "UNIVERSITY"("address_id");
CREATE INDEX "DEPARTMENT_name_idx" ON "DEPARTMENT"("name");
CREATE INDEX "PROGRAMTYPE_name_idx" ON "PROGRAMTYPE"("name");
CREATE INDEX "PROGRAM_name_idx" ON "PROGRAM"("name");
CREATE INDEX "PROGRAM_department_id_idx" ON "PROGRAM"("department_id");
CREATE INDEX "PROGRAM_programtype_id_idx" ON "PROGRAM"("programtype_id");
CREATE INDEX "ENROLLMENT_student_id_idx" ON "ENROLLMENT"("student_id");
CREATE INDEX "ENROLLMENT_program_id_idx" ON "ENROLLMENT"("program_id");
CREATE INDEX "ENROLLMENT_status_idx" ON "ENROLLMENT"("status");
CREATE INDEX "PROGRESS_enrollment_id_idx" ON "PROGRESS"("enrollment_id");
CREATE INDEX "BANK_name_idx" ON "BANK"("name");
CREATE INDEX "BANK_code_idx" ON "BANK"("code");
CREATE INDEX "BANK_address_id_idx" ON "BANK"("address_id");
CREATE INDEX "BRANCH_code_idx" ON "BRANCH"("code");
CREATE INDEX "BRANCH_address_id_idx" ON "BRANCH"("address_id");
CREATE INDEX "BRANCH_bank_id_idx" ON "BRANCH"("bank_id");
CREATE INDEX "ACCOUNT_person_id_idx" ON "ACCOUNT"("person_id");
CREATE INDEX "ACCOUNT_branch_id_idx" ON "ACCOUNT"("branch_id");

ALTER TABLE "ADDRESS" ADD CONSTRAINT "ADDRESS_wilaya_id_fkey"
    FOREIGN KEY ("wilaya_id") REFERENCES "PROVINCE"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PERSON" ADD CONSTRAINT "PERSON_home_address_id_fkey"
    FOREIGN KEY ("home_address_id") REFERENCES "ADDRESS"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "STUDENT" ADD CONSTRAINT "STUDENT_person_id_fkey"
    FOREIGN KEY ("person_id") REFERENCES "PERSON"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "STUDENT" ADD CONSTRAINT "STUDENT_address_id_fkey"
    FOREIGN KEY ("address_id") REFERENCES "ADDRESS"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PASSPORT" ADD CONSTRAINT "PASSPORT_person_id_fkey"
    FOREIGN KEY ("person_id") REFERENCES "PERSON"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CONTACT" ADD CONSTRAINT "CONTACT_owner_id_fkey"
    FOREIGN KEY ("owner_id") REFERENCES "PERSON"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UNIVERSITY" ADD CONSTRAINT "UNIVERSITY_address_id_fkey"
    FOREIGN KEY ("address_id") REFERENCES "ADDRESS"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PROGRAM" ADD CONSTRAINT "PROGRAM_department_id_fkey"
    FOREIGN KEY ("department_id") REFERENCES "DEPARTMENT"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PROGRAM" ADD CONSTRAINT "PROGRAM_programtype_id_fkey"
    FOREIGN KEY ("programtype_id") REFERENCES "PROGRAMTYPE"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ENROLLMENT" ADD CONSTRAINT "ENROLLMENT_student_id_fkey"
    FOREIGN KEY ("student_id") REFERENCES "STUDENT"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ENROLLMENT" ADD CONSTRAINT "ENROLLMENT_program_id_fkey"
    FOREIGN KEY ("program_id") REFERENCES "PROGRAM"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PROGRESS" ADD CONSTRAINT "PROGRESS_enrollment_id_fkey"
    FOREIGN KEY ("enrollment_id") REFERENCES "ENROLLMENT"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BANK" ADD CONSTRAINT "BANK_address_id_fkey"
    FOREIGN KEY ("address_id") REFERENCES "ADDRESS"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "BRANCH" ADD CONSTRAINT "BRANCH_address_id_fkey"
    FOREIGN KEY ("address_id") REFERENCES "ADDRESS"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "BRANCH" ADD CONSTRAINT "BRANCH_bank_id_fkey"
    FOREIGN KEY ("bank_id") REFERENCES "BANK"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ACCOUNT" ADD CONSTRAINT "ACCOUNT_branch_id_fkey"
    FOREIGN KEY ("branch_id") REFERENCES "BRANCH"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ACCOUNT" ADD CONSTRAINT "ACCOUNT_person_id_fkey"
    FOREIGN KEY ("person_id") REFERENCES "PERSON"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE OR REPLACE FUNCTION ensure_province(province_name TEXT) RETURNS INTEGER AS $$
DECLARE
    normalized_name TEXT := NULLIF(BTRIM(province_name), '');
    province_id INTEGER;
BEGIN
    IF normalized_name IS NULL THEN
        RETURN NULL;
    END IF;

    SELECT id
    INTO province_id
    FROM "PROVINCE"
    WHERE LOWER(name) = LOWER(normalized_name)
    LIMIT 1;

    IF province_id IS NOT NULL THEN
        RETURN province_id;
    END IF;

    INSERT INTO "PROVINCE" ("name")
    VALUES (normalized_name)
    RETURNING id INTO province_id;

    RETURN province_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION ensure_address(address_name TEXT, province_name TEXT) RETURNS INTEGER AS $$
DECLARE
    normalized_name TEXT := NULLIF(BTRIM(address_name), '');
    province_id INTEGER;
    address_id INTEGER;
BEGIN
    IF normalized_name IS NULL THEN
        RETURN NULL;
    END IF;

    province_id := ensure_province(province_name);

    SELECT id
    INTO address_id
    FROM "ADDRESS"
    WHERE LOWER(name) = LOWER(normalized_name)
      AND (
        ("wilaya_id" IS NULL AND province_id IS NULL)
        OR "wilaya_id" = province_id
      )
    LIMIT 1;

    IF address_id IS NOT NULL THEN
        RETURN address_id;
    END IF;

    INSERT INTO "ADDRESS" ("name", "wilaya_id")
    VALUES (normalized_name, province_id)
    RETURNING id INTO address_id;

    RETURN address_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION ensure_department(department_name TEXT) RETURNS INTEGER AS $$
DECLARE
    normalized_name TEXT := COALESCE(NULLIF(BTRIM(department_name), ''), 'General Studies');
    department_id INTEGER;
BEGIN
    SELECT id
    INTO department_id
    FROM "DEPARTMENT"
    WHERE LOWER(name) = LOWER(normalized_name)
    LIMIT 1;

    IF department_id IS NOT NULL THEN
        RETURN department_id;
    END IF;

    INSERT INTO "DEPARTMENT" ("name", "description")
    VALUES (normalized_name, normalized_name || ' department')
    RETURNING id INTO department_id;

    RETURN department_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION ensure_programtype(programtype_name TEXT) RETURNS INTEGER AS $$
DECLARE
    normalized_name TEXT := COALESCE(NULLIF(BTRIM(programtype_name), ''), 'Program');
    programtype_id INTEGER;
BEGIN
    SELECT id
    INTO programtype_id
    FROM "PROGRAMTYPE"
    WHERE LOWER(name) = LOWER(normalized_name)
    LIMIT 1;

    IF programtype_id IS NOT NULL THEN
        RETURN programtype_id;
    END IF;

    INSERT INTO "PROGRAMTYPE" ("name", "default_duration")
    VALUES (normalized_name, 2)
    RETURNING id INTO programtype_id;

    RETURN programtype_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION ensure_program(program_name TEXT, department_id INTEGER, programtype_id INTEGER) RETURNS INTEGER AS $$
DECLARE
    normalized_name TEXT := COALESCE(NULLIF(BTRIM(program_name), ''), 'General Studies');
    program_id INTEGER;
BEGIN
    SELECT id
    INTO program_id
    FROM "PROGRAM"
    WHERE LOWER(name) = LOWER(normalized_name)
      AND "department_id" = department_id
      AND "programtype_id" = programtype_id
    LIMIT 1;

    IF program_id IS NOT NULL THEN
        RETURN program_id;
    END IF;

    INSERT INTO "PROGRAM" ("name", "description", "department_id", "programtype_id")
    VALUES (normalized_name, normalized_name, department_id, programtype_id)
    RETURNING id INTO program_id;

    RETURN program_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION ensure_bank(bank_name TEXT, bank_code INTEGER, address_id INTEGER) RETURNS INTEGER AS $$
DECLARE
    normalized_name TEXT := COALESCE(NULLIF(BTRIM(bank_name), ''), 'Default Bank');
    normalized_code INTEGER := COALESCE(bank_code, 10000);
    bank_id INTEGER;
BEGIN
    SELECT id
    INTO bank_id
    FROM "BANK"
    WHERE LOWER(name) = LOWER(normalized_name)
      AND code = normalized_code
    LIMIT 1;

    IF bank_id IS NOT NULL THEN
        IF address_id IS NOT NULL THEN
            UPDATE "BANK"
            SET "address_id" = COALESCE("address_id", address_id)
            WHERE id = bank_id;
        END IF;
        RETURN bank_id;
    END IF;

    INSERT INTO "BANK" ("name", "code", "address_id")
    VALUES (normalized_name, normalized_code, address_id)
    RETURNING id INTO bank_id;

    RETURN bank_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION ensure_branch(branch_name TEXT, branch_code INTEGER, address_id INTEGER, bank_id INTEGER) RETURNS INTEGER AS $$
DECLARE
    normalized_name TEXT := COALESCE(NULLIF(BTRIM(branch_name), ''), 'Main Branch');
    normalized_code INTEGER := COALESCE(branch_code, 1001);
    branch_id INTEGER;
BEGIN
    SELECT id
    INTO branch_id
    FROM "BRANCH"
    WHERE "bank_id" = bank_id
      AND code = normalized_code
    LIMIT 1;

    IF branch_id IS NOT NULL THEN
        UPDATE "BRANCH"
        SET
            "name" = COALESCE(NULLIF(BTRIM(branch_name), ''), "name"),
            "address_id" = COALESCE(address_id, "address_id")
        WHERE id = branch_id;
        RETURN branch_id;
    END IF;

    INSERT INTO "BRANCH" ("code", "name", "address_id", "bank_id")
    VALUES (normalized_code, normalized_name, address_id, bank_id)
    RETURNING id INTO branch_id;

    RETURN branch_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION normalize_profile_status(status_value TEXT) RETURNS TEXT AS $$
DECLARE
    normalized_status TEXT := UPPER(COALESCE(NULLIF(BTRIM(status_value), ''), 'PENDING'));
BEGIN
    IF normalized_status IN ('ACTIVE', 'COMPLETED') THEN
        RETURN normalized_status;
    END IF;

    RETURN 'PENDING';
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
    profile_row RECORD;
    auth_row RECORD;
    profile JSONB;
    person_id INTEGER;
    student_id INTEGER;
    home_address_id INTEGER;
    current_address_id INTEGER;
    university_address_id INTEGER;
    department_id INTEGER;
    programtype_id INTEGER;
    program_id INTEGER;
    enrollment_id INTEGER;
    bank_address_id INTEGER;
    bank_id INTEGER;
    branch_id INTEGER;
    numeric_value BIGINT;
BEGIN
    FOR profile_row IN
        SELECT *
        FROM "StudentProfileRecord"
        ORDER BY "createdAt", id
    LOOP
        profile := profile_row.profile;

        home_address_id := ensure_address(
            COALESCE(NULLIF(profile #>> '{address,homeCountryAddress}', ''), 'Unknown address'),
            COALESCE(
                NULLIF(profile #>> '{address,wilaya}', ''),
                NULLIF(profile #>> '{address,city}', ''),
                'Unknown'
            )
        );

        current_address_id := ensure_address(
            COALESCE(
                NULLIF(profile #>> '{address,currentHostAddress}', ''),
                NULLIF(profile #>> '{address,street}', '')
            ),
            COALESCE(
                NULLIF(profile #>> '{address,wilaya}', ''),
                NULLIF(profile #>> '{address,city}', ''),
                'Unknown'
            )
        );

        INSERT INTO "PERSON" ("given_name", "family_name", "dob", "gender", "home_address_id")
        VALUES (
            COALESCE(NULLIF(profile #>> '{student,givenName}', ''), SPLIT_PART(COALESCE(NULLIF(profile #>> '{student,fullName}', ''), profile_row."fullName"), ' ', 1)),
            COALESCE(
                NULLIF(profile #>> '{student,familyName}', ''),
                NULLIF(REPLACE(COALESCE(NULLIF(profile #>> '{student,fullName}', ''), profile_row."fullName"), SPLIT_PART(COALESCE(NULLIF(profile #>> '{student,fullName}', ''), profile_row."fullName"), ' ', 1), ''), ''),
                'Student'
            ),
            COALESCE(profile #>> '{student,dateOfBirth}', ''),
            COALESCE(NULLIF(profile #>> '{student,gender}', ''), 'M'),
            home_address_id
        )
        RETURNING id INTO person_id;

        INSERT INTO "STUDENT" ("person_id", "inscription_no", "address_id")
        VALUES (
            person_id,
            UPPER(COALESCE(NULLIF(profile #>> '{student,inscriptionNumber}', ''), profile_row."inscriptionNumber")),
            current_address_id
        )
        RETURNING id INTO student_id;

        INSERT INTO "PASSPORT" ("passport_no", "issue_date", "expiry", "person_id")
        VALUES (
            COALESCE(profile #>> '{passport,passportNumber}', ''),
            COALESCE(profile #>> '{passport,issueDate}', ''),
            COALESCE(profile #>> '{passport,expiryDate}', ''),
            person_id
        );

        INSERT INTO "CONTACT" ("owner_id", "type", "value", "label", "is_primary", "created_at")
        VALUES
            (person_id, 'EMAIL', COALESCE(profile #>> '{contact,email}', ''), 'primary', true, NOW()::TEXT),
            (person_id, 'PHONE', COALESCE(profile #>> '{contact,phone}', ''), 'mobile', true, NOW()::TEXT),
            (person_id, 'EMERGENCY', COALESCE(profile #>> '{contact,emergencyContactName}', ''), 'name', false, NOW()::TEXT),
            (person_id, 'EMERGENCY', COALESCE(profile #>> '{contact,emergencyContactPhone}', ''), 'phone', false, NOW()::TEXT);

        university_address_id := ensure_address(
            profile #>> '{university,campus}',
            COALESCE(NULLIF(profile #>> '{university,city}', ''), 'Unknown')
        );

        IF COALESCE(NULLIF(profile #>> '{university,universityName}', ''), NULLIF(profile #>> '{university,acronym}', ''), '') <> '' THEN
            IF NOT EXISTS (
                SELECT 1
                FROM "UNIVERSITY"
                WHERE LOWER(name) = LOWER(COALESCE(profile #>> '{university,universityName}', ''))
                  AND LOWER(acronym) = LOWER(COALESCE(profile #>> '{university,acronym}', ''))
            ) THEN
                INSERT INTO "UNIVERSITY" ("name", "acronym", "address_id")
                VALUES (
                    COALESCE(profile #>> '{university,universityName}', ''),
                    COALESCE(profile #>> '{university,acronym}', ''),
                    university_address_id
                );
            END IF;
        END IF;

        department_id := ensure_department(profile #>> '{university,department}');
        programtype_id := ensure_programtype(
            COALESCE(
                NULLIF(profile #>> '{program,degreeLevel}', ''),
                NULLIF(profile #>> '{program,programType}', '')
            )
        );
        program_id := ensure_program(profile #>> '{program,major}', department_id, programtype_id);

        INSERT INTO "ENROLLMENT" ("registration_no", "date_enrolled", "status", "student_id", "program_id")
        VALUES (
            COALESCE(
                NULLIF(profile #>> '{student,registrationNumber}', ''),
                'REG-' || EXTRACT(YEAR FROM NOW())::TEXT || '-' || student_id::TEXT
            ),
            COALESCE(NULLIF(profile #>> '{program,startDate}', ''), CURRENT_DATE::TEXT),
            normalize_profile_status(COALESCE(profile ->> 'status', profile_row.status::TEXT)),
            student_id,
            program_id
        )
        RETURNING id INTO enrollment_id;

        INSERT INTO "PROGRESS" ("date", "semester", "level", "grade", "status", "enrollment_id")
        SELECT
            COALESCE(entry ->> 'date', ''),
            COALESCE(entry ->> 'year', ''),
            COALESCE(entry ->> 'level', ''),
            COALESCE(entry ->> 'grade', ''),
            COALESCE(NULLIF(entry ->> 'status', ''), 'PENDING'),
            enrollment_id
        FROM JSONB_ARRAY_ELEMENTS(COALESCE(profile -> 'academicHistory', '[]'::JSONB)) AS entry;

        bank_address_id := ensure_address(
            profile #>> '{bank,branchAddress}',
            COALESCE(
                NULLIF(profile #>> '{address,wilaya}', ''),
                NULLIF(profile #>> '{address,city}', ''),
                'Unknown'
            )
        );

        bank_id := ensure_bank(
            profile #>> '{bank,bankName}',
            COALESCE(
                NULLIF(REGEXP_REPLACE(COALESCE(profile #>> '{bankAccount,swiftCode}', ''), '\D', '', 'g'), '')::INTEGER,
                10000
            ),
            bank_address_id
        );

        branch_id := ensure_branch(
            profile #>> '{bank,branchName}',
            COALESCE(
                NULLIF(REGEXP_REPLACE(COALESCE(profile #>> '{bank,branchCode}', ''), '\D', '', 'g'), '')::INTEGER,
                1001
            ),
            bank_address_id,
            bank_id
        );

        numeric_value := COALESCE(
            NULLIF(REGEXP_REPLACE(COALESCE(profile #>> '{bankAccount,iban}', ''), '\D', '', 'g'), '')::BIGINT,
            0
        );

        INSERT INTO "ACCOUNT" ("account_no", "rib", "currency", "date_created", "branch_id", "person_id")
        VALUES (
            COALESCE(profile #>> '{bankAccount,accountNumber}', ''),
            numeric_value,
            '',
            COALESCE(NULLIF(profile #>> '{bankAccount,dateCreated}', ''), CURRENT_DATE::TEXT),
            branch_id,
            person_id
        );
    END LOOP;

    FOR auth_row IN
        SELECT au.*
        FROM "AuthUser" au
        WHERE au.role = 'STUDENT'
          AND NOT EXISTS (
              SELECT 1
              FROM "STUDENT" s
              WHERE s."inscription_no" = UPPER(au."loginId")
          )
    LOOP
        INSERT INTO "PERSON" ("given_name", "family_name", "dob", "gender", "home_address_id")
        VALUES (
            UPPER(auth_row."loginId"),
            'Student',
            '',
            'M',
            NULL
        )
        RETURNING id INTO person_id;

        INSERT INTO "STUDENT" ("person_id", "inscription_no", "address_id")
        VALUES (
            person_id,
            UPPER(auth_row."loginId"),
            NULL
        )
        RETURNING id INTO student_id;

        IF COALESCE(NULLIF(BTRIM(auth_row.subject), ''), '') <> '' THEN
            department_id := ensure_department('General Studies');
            programtype_id := ensure_programtype('Program');
            program_id := ensure_program(auth_row.subject, department_id, programtype_id);

            INSERT INTO "ENROLLMENT" ("registration_no", "date_enrolled", "status", "student_id", "program_id")
            VALUES (
                'REG-' || EXTRACT(YEAR FROM NOW())::TEXT || '-' || student_id::TEXT,
                CURRENT_DATE::TEXT,
                'PENDING',
                student_id,
                program_id
            );
        END IF;
    END LOOP;
END $$;

DROP FUNCTION normalize_profile_status(TEXT);
DROP FUNCTION ensure_branch(TEXT, INTEGER, INTEGER, INTEGER);
DROP FUNCTION ensure_bank(TEXT, INTEGER, INTEGER);
DROP FUNCTION ensure_program(TEXT, INTEGER, INTEGER);
DROP FUNCTION ensure_programtype(TEXT);
DROP FUNCTION ensure_department(TEXT);
DROP FUNCTION ensure_address(TEXT, TEXT);
DROP FUNCTION ensure_province(TEXT);

ALTER TABLE "AuthUser" DROP COLUMN "subject";

DROP TABLE "StudentProfileRecord";
DROP TYPE "StudentProfileStatus";
