import { TObject } from '@sinclair/typebox';
import InvalidDataError from './errors/invalid_data_error';
import addFormats from 'ajv-formats';
import Ajv from 'ajv';
import { deepValue } from './helper';

const ajv = addFormats(
  new Ajv({ coerceTypes: true, allErrors: true, formats: { 'date-time': true }, strict: false }),
  [
    'date',
    'time',
    'date-time',
    'email',
    'hostname',
    'ipv4',
    'ipv6',
    'uri',
    'uri-reference',
    'uuid',
    'uri-template',
    'json-pointer',
    'relative-json-pointer',
    'regex',
  ]
);

export const validator = <T extends unknown>(schema: TObject, data: T): T => {
  const validate = ajv.compile<T>(schema);

  const isValid = validate(data);
  if (isValid) {
    return data;
  }

  throw new InvalidDataError(
    'Invalid data provided',
    validate.errors?.map((ele) => {
      let obj = {
        property: ele.instancePath as string | null,
        message: ele.message ?? ele.keyword,
        value: undefined as any,
      };

      if (!obj.property && ele.params.missingProperty) {
        obj.property = `/${ele.params.missingProperty}`;
      }

      if (obj.property?.length == 0) {
        obj.property = null;
      }

      if (obj.property) {
        obj.property = obj.property.substring(1).split('/').join('.');
        obj.value = deepValue(data, obj.property);
      }

      return obj;
    }) ?? []
  );
};
