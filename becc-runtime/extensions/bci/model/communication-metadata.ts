export interface CommunicationMetadata {
  readonly title: string;
  readonly subtitle?: string;
  readonly language?: string;
  readonly status?: string;
  readonly lifecycle?: string;
  readonly category?: string;
  readonly role?: string;
  readonly technologies?: readonly string[];
  readonly notice?: string;
  readonly custom?: Readonly<Record<string, unknown>>;
}
