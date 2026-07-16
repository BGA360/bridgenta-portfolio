import { IValidatorRegistry, ISubValidator } from './types.js';

export class ValidatorRegistryService implements IValidatorRegistry {
  private readonly validators: ISubValidator[] = [];

  public register(validator: ISubValidator): void {
    if (!validator) {
      return;
    }
    // Prevent duplicates
    if (this.validators.some(v => v.name === validator.name)) {
      return;
    }
    this.validators.push(validator);
  }

  public getValidators(): readonly ISubValidator[] {
    return Object.freeze([...this.validators]);
  }
}
