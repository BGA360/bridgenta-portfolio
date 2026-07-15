export class ConnectorError extends Error {
  public readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'ConnectorError';
    this.code = code;
    // Restore prototype chain
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class RepositoryBoundaryUnavailable extends ConnectorError {
  constructor() {
    super('RepositoryBoundaryUnavailable', 'Repository root could not be resolved for the target workspace.');
  }
}

export class ProjectMismatch extends ConnectorError {
  constructor() {
    super('ProjectMismatch', 'Project identity mismatch. Discovered project name does not match the request.');
  }
}

export class FileNotFoundException extends ConnectorError {
  constructor() {
    super('FileNotFoundException', 'Target file could not be found within the repository workspace.');
  }
}

export class PathTraversalException extends ConnectorError {
  constructor() {
    super('PathTraversalException', 'Target file path escapes the repository boundaries.');
  }
}

export class MalformedConfigException extends ConnectorError {
  constructor() {
    super('MalformedConfigException', 'Project configuration file is malformed.');
  }
}

export class MissingMetadataException extends ConnectorError {
  constructor() {
    super('MissingMetadataException', 'Project configuration file is missing in strict mode.');
  }
}

export class SecurityClassificationException extends ConnectorError {
  constructor() {
    super('SecurityClassificationException', 'Target publication classification is undefined.');
  }
}

export class VCSFailureException extends ConnectorError {
  constructor() {
    super('VCSFailureException', 'Version control diagnostic error occurred.');
  }
}
