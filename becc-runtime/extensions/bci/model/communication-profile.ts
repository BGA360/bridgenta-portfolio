export interface CommunicationProfile {
  readonly profileId: string;
  readonly profileVersion: string;
  readonly profileHash: string;
  readonly displayName: string;
  readonly targetLanguage: string; // e.g. 'de' or 'en'
  readonly targetAudience: string; // e.g. 'recruiters', 'IT management'
  readonly registerTarget: string; // e.g. 'CEFR B2-C1'
  readonly extendsProfile?: string; // Reference to a base profile ID
}
