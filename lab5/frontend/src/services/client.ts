export type ApiClient = {
  request: <T>(path: string, init?: RequestInit) => Promise<T>;
};
