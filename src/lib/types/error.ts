import { isClerkAPIResponseError } from "@clerk/clerk-react/errors";
import { ActionError } from "astro:actions";

//export type AuthError = Error

// NOTE: Experimental `Error` class
export class AppError extends Error {
  public originalError?: Error;

  constructor(originalError: Error | unknown, message?: string) {
    super(message);
    this.name = "AppError";

    if (originalError instanceof Error) {
      if (isClerkAPIResponseError(originalError)) {
        this.message = originalError.errors[0].message;
        this.originalError = originalError;
        this.stack = originalError.stack;
        this.cause = originalError.cause;
      } else {
        this.originalError = originalError;
        this.stack = originalError.stack;
        this.message = originalError.message;
        this.cause = originalError.cause;
      }
    } else {
      this.originalError = new Error(String(originalError));
    }
  }
}
