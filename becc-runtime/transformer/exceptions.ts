export class TransformationException extends Error {
  constructor(message: string) {
    super(`Transformation failed: ${message}`);
    this.name = 'TransformationException';
  }
}

export class InvalidResponseFormatException extends Error {
  constructor(message: string) {
    super(`Provider response format is invalid: ${message}`);
    this.name = 'InvalidResponseFormatException';
  }
}
