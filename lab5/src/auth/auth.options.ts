export const AUTH_OPTIONS = Symbol('AUTH_OPTIONS');

export type AuthModuleOptions = {
  firebaseProjectId: string;
  firebaseClientEmail: string;
  firebasePrivateKey: string;
};
