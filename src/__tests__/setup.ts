import { vi } from 'vitest';

// Mock next/headers cookies() — tests set `mockCookies` to control values
export const mockCookies = new Map<string, string>();

vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: (name: string) => {
      const value = mockCookies.get(name);
      return value ? { name, value } : undefined;
    },
    set: () => {},
  }),
}));
