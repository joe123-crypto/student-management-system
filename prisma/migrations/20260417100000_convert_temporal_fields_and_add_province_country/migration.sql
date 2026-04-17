-- Convert legacy text-based temporal columns to native date/time types and add province country metadata.

CREATE OR REPLACE FUNCTION parse_legacy_date(value TEXT) RETURNS DATE AS $$
DECLARE
    normalized TEXT := BTRIM(value);
BEGIN
    IF normalized IS NULL OR normalized = '' THEN
        RETURN NULL;
    END IF;

    IF normalized ~ '^\d{4}-\d{2}-\d{2}$' THEN
        RETURN normalized::DATE;
    END IF;

    IF normalized ~ '^\d{4}/\d{2}/\d{2}$' THEN
        RETURN TO_DATE(normalized, 'YYYY/MM/DD');
    END IF;

    IF normalized ~ '^\d{2}/\d{2}/\d{4}$' THEN
        RETURN TO_DATE(normalized, 'DD/MM/YYYY');
    END IF;

    IF normalized ~ '^\d{2}-\d{2}-\d{4}$' THEN
        RETURN TO_DATE(normalized, 'DD-MM-YYYY');
    END IF;

    RETURN normalized::TIMESTAMPTZ::DATE;
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$ LANGUAGE plpgsql;

ALTER TABLE "PROVINCE"
ADD COLUMN "country" TEXT NOT NULL DEFAULT '';

ALTER TABLE "PERSON"
ALTER COLUMN "dob" DROP NOT NULL,
ALTER COLUMN "dob" TYPE DATE
USING parse_legacy_date("dob");

ALTER TABLE "PASSPORT"
ALTER COLUMN "issue_date" DROP NOT NULL,
ALTER COLUMN "issue_date" TYPE DATE
USING parse_legacy_date("issue_date"),
ALTER COLUMN "expiry" DROP NOT NULL,
ALTER COLUMN "expiry" TYPE DATE
USING parse_legacy_date("expiry");

ALTER TABLE "CONTACT"
ALTER COLUMN "created_at" TYPE TIMESTAMP(3)
USING CASE
    WHEN BTRIM("created_at") = '' THEN CURRENT_TIMESTAMP
    ELSE "created_at"::TIMESTAMPTZ::TIMESTAMP(3)
END;

ALTER TABLE "ENROLLMENT"
ALTER COLUMN "date_enrolled" TYPE DATE
USING COALESCE(parse_legacy_date("date_enrolled"), CURRENT_DATE);

ALTER TABLE "PROGRESS"
ALTER COLUMN "date" DROP NOT NULL,
ALTER COLUMN "date" TYPE DATE
USING parse_legacy_date("date");

ALTER TABLE "ACCOUNT"
ALTER COLUMN "date_created" DROP NOT NULL,
ALTER COLUMN "date_created" TYPE DATE
USING parse_legacy_date("date_created");

DROP FUNCTION parse_legacy_date(TEXT);
