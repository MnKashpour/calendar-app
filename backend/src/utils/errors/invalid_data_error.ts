type InvalidDataType = { message: string; property: string | null; value?: any };

export default class InvalidDataError extends Error {
  invalidData: InvalidDataType[];

  constructor(message: string, invalidData: InvalidDataType[]) {
    super(message);

    this.invalidData = invalidData;
  }
}
