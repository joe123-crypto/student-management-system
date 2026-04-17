const LETTER_SEED_FALLBACK = 'SCH';
const AMBIGUOUS_UPPERCASE_PASSWORD_CHARS = new Set(['I', 'O']);
const AMBIGUOUS_LOWERCASE_PASSWORD_CHARS = new Set(['l']);
const AMBIGUOUS_DIGIT_PASSWORD_CHARS = new Set(['0', '1']);
const MIN_PASSWORD_LENGTH = 10;
const GENERATED_PASSWORD_LETTER_SEED_LENGTH = 2;
const GENERATED_PASSWORD_DIGIT_SEED_LENGTH = 2;
const GENERATED_PASSWORD_SYMBOL = '!';
const GENERATED_STUDENT_PASSWORD_LENGTH = 10;

function buildCharacterRange(startCode: number, endCode: number, blockedCharacters: Set<string>): string {
  return Array.from({ length: endCode - startCode + 1 }, (_, index) =>
    String.fromCharCode(startCode + index),
  )
    .filter((character) => !blockedCharacters.has(character))
    .join('');
}

const PASSWORD_RANDOM_ALPHABET = [
  buildCharacterRange(65, 90, AMBIGUOUS_UPPERCASE_PASSWORD_CHARS),
  buildCharacterRange(97, 122, AMBIGUOUS_LOWERCASE_PASSWORD_CHARS),
  Array.from({ length: 10 }, (_, index) => String(index))
    .filter((digit) => !AMBIGUOUS_DIGIT_PASSWORD_CHARS.has(digit))
    .join(''),
].join('');

export const PASSWORD_REQUIREMENTS_MESSAGE =
  'New password must be at least 10 characters long and include uppercase, lowercase, a number, and a symbol.';

export function isStrongPassword(password: string): boolean {
  const candidate = password.trim();

  return (
    candidate.length >= MIN_PASSWORD_LENGTH &&
    /[a-z]/.test(candidate) &&
    /[A-Z]/.test(candidate) &&
    /\d/.test(candidate) &&
    /[^A-Za-z0-9]/.test(candidate)
  );
}

function normalizeInscriptionSeed(inscriptionNumber: string): string {
  return inscriptionNumber.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function deriveLetterSeed(normalizedInscription: string): string {
  const mappedLetters = normalizedInscription
    .split('')
    .map((character) => {
      if (/[A-Z]/.test(character)) {
        return character;
      }

      if (/\d/.test(character)) {
        return String.fromCharCode(65 + Number(character));
      }

      return '';
    })
    .join('');

  return (mappedLetters || LETTER_SEED_FALLBACK)
    .slice(0, GENERATED_PASSWORD_LETTER_SEED_LENGTH)
    .padEnd(GENERATED_PASSWORD_LETTER_SEED_LENGTH, LETTER_SEED_FALLBACK[0]);
}

function deriveDigitSeed(normalizedInscription: string): string {
  return (normalizedInscription.replace(/\D/g, '') || '00')
    .slice(-GENERATED_PASSWORD_DIGIT_SEED_LENGTH)
    .padStart(GENERATED_PASSWORD_DIGIT_SEED_LENGTH, '7');
}

function buildRandomString(length: number, alphabet: string, randomValues?: ArrayLike<number>): string {
  const values =
    randomValues === undefined
      ? (() => {
          const cryptoApi = globalThis.crypto;
          if (!cryptoApi?.getRandomValues) {
            throw new Error('Secure random password generation is unavailable.');
          }

          const buffer = new Uint32Array(length);
          cryptoApi.getRandomValues(buffer);
          return buffer;
        })()
      : randomValues;

  return Array.from({ length }, (_, index) => {
    const value = values[index] ?? index;
    return alphabet[(value + index) % alphabet.length];
  }).join('');
}

export function generateStudentPassword(
  inscriptionNumber: string,
  randomValues?: ArrayLike<number>,
): string {
  const normalizedInscription = normalizeInscriptionSeed(inscriptionNumber);
  const upperSeed = deriveLetterSeed(normalizedInscription);
  const lowerSeed = upperSeed.toLowerCase();
  const digitSeed = deriveDigitSeed(normalizedInscription);
  const randomSuffixLength =
    GENERATED_STUDENT_PASSWORD_LENGTH -
    upperSeed.length -
    lowerSeed.length -
    GENERATED_PASSWORD_SYMBOL.length -
    digitSeed.length;
  const randomSuffix = buildRandomString(randomSuffixLength, PASSWORD_RANDOM_ALPHABET, randomValues);

  return `${upperSeed}${lowerSeed}${GENERATED_PASSWORD_SYMBOL}${digitSeed}${randomSuffix}`;
}
