export function deepValue(obj: Object, path: string, separator: string = '.'): any {
  if (path.startsWith(separator)) {
    path = path.substring(1);
  }

  for (const part of path.split(separator)) {
    if (obj instanceof Object) {
      obj = obj[part as keyof Object];
    } else {
      return undefined;
    }
  }
  return obj;
}

export function omitSensitiveFields<T>(
  data: Partial<T>,
  sensitiveFields: (keyof T)[],
  includeFields: (keyof T)[] = []
) {
  sensitiveFields.forEach((field) => {
    if (includeFields.includes(field)) return;

    delete data[field];
  });

  return data;
}

export type PaginatedData<T> = {
  data: T[];
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
};
