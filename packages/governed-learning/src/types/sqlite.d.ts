declare module 'node:sqlite' {
  export interface StatementSync<ResultType = unknown> {
    all(...params: unknown[]): ResultType[];
    get(...params: unknown[]): ResultType | undefined;
    run(...params: unknown[]): { changes: number | bigint; lastInsertRowid: number | bigint };
  }

  export class DatabaseSync {
    constructor(location: string, options?: { open?: boolean; readOnly?: boolean });
    close(): void;
    exec(sql: string): void;
    prepare<ResultType = unknown>(sql: string): StatementSync<ResultType>;
  }
}
