declare module 'bun:test' {
  export function describe(name: string, callback: () => void): void;
  export function test(name: string, callback: () => void): void;
  export const expect: (value: unknown) => {
    toEqual(expected: unknown): void;
    toBe(expected: unknown): void;
    toBeNull(): void;
  };
}