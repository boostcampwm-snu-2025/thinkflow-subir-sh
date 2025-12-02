export function success(data: any, meta: any = null) {
  return {
    success: true,
    data,
    meta,
    message: null,
  };
}

export function fail(message: string, meta: any = null) {
  return {
    success: false,
    data: null,
    meta,
    message,
  };
}