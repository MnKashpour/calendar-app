export interface DataOrError<T> {
  state: 'data' | 'error';
  data?: T;
  error?: any;
}
