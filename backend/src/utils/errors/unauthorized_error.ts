export default class UnauthorizedError extends Error {
  authentication: boolean;

  constructor(message: string, authentication: boolean) {
    super(message);

    this.authentication = authentication;
  }
}
