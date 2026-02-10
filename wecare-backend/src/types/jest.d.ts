declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidJWT(): R;
    }
  }
}

export {};