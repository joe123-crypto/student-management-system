-- Create new award-related tables.
CREATE TABLE "AWARDTYPE" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "AWARDTYPE_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PROGRAMAWARD" (
    "id" SERIAL NOT NULL,
    "program_id" INTEGER NOT NULL,
    "award_type_id" INTEGER NOT NULL,
    "sequence_no" INTEGER NOT NULL,
    "nominal_year" INTEGER NOT NULL,

    CONSTRAINT "PROGRAMAWARD_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "STUDENTAWARD" (
    "id" SERIAL NOT NULL,
    "student_id" INTEGER NOT NULL,
    "enrollment_id" INTEGER NOT NULL,
    "program_award_id" INTEGER NOT NULL,
    "award_date" DATE,
    "status" TEXT NOT NULL,

    CONSTRAINT "STUDENTAWARD_pkey" PRIMARY KEY ("id")
);

-- Expand PROGRAM to the new shape and backfill from PROGRAMTYPE.
ALTER TABLE "PROGRAM"
    ADD COLUMN "system_type" TEXT,
    ADD COLUMN "duration_years" INTEGER;

UPDATE "PROGRAM" AS p
SET
    "system_type" = COALESCE(NULLIF(BTRIM(pt."name"), ''), 'GENERAL'),
    "duration_years" = COALESCE(pt."default_duration", 2)
FROM "PROGRAMTYPE" AS pt
WHERE p."programtype_id" = pt."id";

UPDATE "PROGRAM"
SET
    "system_type" = COALESCE("system_type", 'GENERAL'),
    "duration_years" = COALESCE("duration_years", 2);

ALTER TABLE "PROGRAM"
    ALTER COLUMN "system_type" SET NOT NULL,
    ALTER COLUMN "duration_years" SET NOT NULL;

ALTER TABLE "PROGRAM" DROP CONSTRAINT "PROGRAM_programtype_id_fkey";
DROP INDEX "PROGRAM_programtype_id_idx";
ALTER TABLE "PROGRAM"
    DROP COLUMN "description",
    DROP COLUMN "programtype_id";

DROP TABLE "PROGRAMTYPE";

CREATE INDEX "PROGRAM_system_type_idx" ON "PROGRAM"("system_type");
CREATE UNIQUE INDEX "PROGRAM_department_id_name_system_type_key" ON "PROGRAM"("department_id", "name", "system_type");

-- Expand ENROLLMENT to the new shape and backfill from legacy columns.
ALTER TABLE "ENROLLMENT"
    ADD COLUMN "start_year" INTEGER,
    ADD COLUMN "end_year" INTEGER,
    ADD COLUMN "current_status" TEXT;

UPDATE "ENROLLMENT" AS e
SET
    "start_year" = EXTRACT(YEAR FROM e."date_enrolled")::INTEGER,
    "end_year" = EXTRACT(YEAR FROM e."date_enrolled")::INTEGER + COALESCE(p."duration_years", 2),
    "current_status" = CASE
        WHEN UPPER(COALESCE(e."status", '')) = 'COMPLETED' THEN 'graduated'
        WHEN UPPER(COALESCE(e."status", '')) = 'ACTIVE' THEN 'active'
        WHEN UPPER(COALESCE(e."status", '')) = 'DROPPED' THEN 'dropped'
        ELSE LOWER(COALESCE(NULLIF(BTRIM(e."status"), ''), 'pending'))
    END
FROM "PROGRAM" AS p
WHERE e."program_id" = p."id";

UPDATE "ENROLLMENT"
SET
    "start_year" = COALESCE("start_year", EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER),
    "current_status" = COALESCE("current_status", 'pending');

ALTER TABLE "ENROLLMENT"
    ALTER COLUMN "start_year" SET NOT NULL,
    ALTER COLUMN "current_status" SET NOT NULL;

DROP INDEX "ENROLLMENT_status_idx";
ALTER TABLE "ENROLLMENT"
    DROP COLUMN "registration_no",
    DROP COLUMN "date_enrolled",
    DROP COLUMN "status";

CREATE INDEX "ENROLLMENT_current_status_idx" ON "ENROLLMENT"("current_status");
CREATE INDEX "ENROLLMENT_start_year_idx" ON "ENROLLMENT"("start_year");

-- Rename PROGRESS into ENROLLMENTPROGRESS and reshape its columns.
ALTER TABLE "PROGRESS" RENAME TO "ENROLLMENTPROGRESS";
ALTER TABLE "ENROLLMENTPROGRESS" RENAME COLUMN "date" TO "status_date";
ALTER TABLE "ENROLLMENTPROGRESS" RENAME COLUMN "semester" TO "academic_year";
ALTER TABLE "ENROLLMENTPROGRESS" RENAME COLUMN "level" TO "stage_code";
ALTER TABLE "ENROLLMENTPROGRESS" ADD COLUMN "result_status" TEXT;

UPDATE "ENROLLMENTPROGRESS"
SET "result_status" = COALESCE(
    NULLIF(BTRIM("grade"), ''),
    CASE
        WHEN UPPER(COALESCE("status", '')) = 'COMPLETED' THEN 'passed'
        WHEN UPPER(COALESCE("status", '')) = 'PENDING' THEN 'pending'
        WHEN UPPER(COALESCE("status", '')) = 'FAILED' THEN 'failed'
        ELSE LOWER(COALESCE(NULLIF(BTRIM("status"), ''), 'pending'))
    END
);

UPDATE "ENROLLMENTPROGRESS"
SET "result_status" = COALESCE("result_status", 'pending');

ALTER TABLE "ENROLLMENTPROGRESS"
    ALTER COLUMN "result_status" SET NOT NULL,
    DROP COLUMN "grade",
    DROP COLUMN "status";

CREATE INDEX "ENROLLMENTPROGRESS_academic_year_idx" ON "ENROLLMENTPROGRESS"("academic_year");
CREATE INDEX "ENROLLMENTPROGRESS_stage_code_idx" ON "ENROLLMENTPROGRESS"("stage_code");

-- Add relational constraints and supporting indexes for the new award tables.
CREATE UNIQUE INDEX "AWARDTYPE_code_key" ON "AWARDTYPE"("code");
CREATE INDEX "AWARDTYPE_label_idx" ON "AWARDTYPE"("label");
CREATE INDEX "PROGRAMAWARD_program_id_idx" ON "PROGRAMAWARD"("program_id");
CREATE INDEX "PROGRAMAWARD_award_type_id_idx" ON "PROGRAMAWARD"("award_type_id");
CREATE UNIQUE INDEX "PROGRAMAWARD_program_id_sequence_no_key" ON "PROGRAMAWARD"("program_id", "sequence_no");
CREATE INDEX "STUDENTAWARD_student_id_idx" ON "STUDENTAWARD"("student_id");
CREATE INDEX "STUDENTAWARD_enrollment_id_idx" ON "STUDENTAWARD"("enrollment_id");
CREATE INDEX "STUDENTAWARD_program_award_id_idx" ON "STUDENTAWARD"("program_award_id");
CREATE INDEX "STUDENTAWARD_status_idx" ON "STUDENTAWARD"("status");

ALTER TABLE "PROGRAMAWARD"
    ADD CONSTRAINT "PROGRAMAWARD_program_id_fkey"
    FOREIGN KEY ("program_id") REFERENCES "PROGRAM"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PROGRAMAWARD"
    ADD CONSTRAINT "PROGRAMAWARD_award_type_id_fkey"
    FOREIGN KEY ("award_type_id") REFERENCES "AWARDTYPE"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "STUDENTAWARD"
    ADD CONSTRAINT "STUDENTAWARD_student_id_fkey"
    FOREIGN KEY ("student_id") REFERENCES "STUDENT"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "STUDENTAWARD"
    ADD CONSTRAINT "STUDENTAWARD_enrollment_id_fkey"
    FOREIGN KEY ("enrollment_id") REFERENCES "ENROLLMENT"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "STUDENTAWARD"
    ADD CONSTRAINT "STUDENTAWARD_program_award_id_fkey"
    FOREIGN KEY ("program_award_id") REFERENCES "PROGRAMAWARD"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
