export const errorMessages = (
  key: ErrorMessage,
  replace?: { [key: string]: string }
): string => {
  let message = _errorMessages[key];

  Object.keys(replace ?? {}).forEach((search) => {
    if (replace![search] !== null && replace![search] !== undefined) {
      message = message.replaceAll(':' + search, replace![search]);
    }
  });

  return message;
};

export type ErrorMessage = keyof typeof _errorMessages;

const _errorMessages = {
  required: 'This field is required',
  email: 'This field must be a valid email',
  minlength: 'This field must be at least :length characters',
  maxlength: 'This field must be at most :length characters',
};
