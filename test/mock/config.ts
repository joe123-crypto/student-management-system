export function isMockDbEnabled(): boolean {
  return process.env.NEXT_PUBLIC_USE_MOCK_DB === 'true';
}
