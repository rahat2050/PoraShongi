export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export function success<T = undefined>(data?: T): ActionResult<T> {
  return { ok: true, data: data as T };
}

export function failure<T = undefined>(error: string): ActionResult<T> {
  return { ok: false, error };
}
