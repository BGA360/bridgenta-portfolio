declare module 'node:test' {
  export function test(name: string, fn: () => void | Promise<void>): void;
  export function describe(name: string, fn: () => void | Promise<void>): void;
}

declare module 'node:assert/strict' {
  export function equal<T>(actual: T, expected: T, message?: string): void;
  export function notEqual<T>(actual: T, expected: T, message?: string): void;
  export function deepEqual<T>(actual: T, expected: T, message?: string): void;
  export function throws(block: () => void, error?: RegExp | Function | object, message?: string): void;
  export function ok(value: unknown, message?: string): void;
}
