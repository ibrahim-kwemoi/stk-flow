export class MpesaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MpesaError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}