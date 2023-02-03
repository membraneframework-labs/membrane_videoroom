export type ErrorMessage = {
  message: string;
  id?: string;
};
export const messageComparator = (a: ErrorMessage | undefined, b: ErrorMessage | undefined) =>
  a === b || (a?.message === b?.message && a?.id === b?.id);
