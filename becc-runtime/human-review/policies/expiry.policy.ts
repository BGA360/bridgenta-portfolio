export interface ReviewExpiryContext {
  readonly createdTimestamp: string;
}

export class DefaultReviewExpiryPolicy {
  constructor(private readonly durationMs: number = 48 * 60 * 60 * 1000) {}

  public calculateExpiry(context: ReviewExpiryContext): string | null {
    const createdDate = new Date(context.createdTimestamp);
    if (isNaN(createdDate.getTime())) return null;
    return new Date(createdDate.getTime() + this.durationMs).toISOString();
  }
}
