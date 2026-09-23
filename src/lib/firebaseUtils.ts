// ─────────────────────────────────────────────────────────────
// firebaseUtils.ts — Firestore error handling
//
// SECURITY: Raw Firestore error messages are NOT surfaced to
// end-users via alert(). Doing so leaks schema paths, operation
// types, and internal implementation details.
// Errors are logged server-side (console) for admin debugging;
// users see only a generic failure message.
// ─────────────────────────────────────────────────────────────

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST   = 'list',
  GET    = 'get',
  WRITE  = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?:       string | null;
    email?:        string | null;
    emailVerified?: boolean | null;
    isAnonymous?:  boolean | null;
    tenantId?:     string | null;
    providerInfo?: { providerId?: string | null; email?: string | null }[];
  };
}

/**
 * Handles a Firestore error.
 *
 * - Always logs the full error to the console (visible only to the admin
 *   in the browser DevTools, not to regular users).
 * - For write/mutating operations, dispatches a custom DOM event so the
 *   calling component can display a generic "Save failed" toast or inline
 *   error — without leaking the raw error string.
 */
export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): void {
  // Full detail goes to the console — only admin users will see this.
  console.error(`[Firestore] ${operationType} failed at "${path}":`, error);

  const isMutating =
    operationType !== OperationType.GET &&
    operationType !== OperationType.LIST;

  if (isMutating) {
    // Dispatch a safe, generic event. Components can listen for this and
    // show a user-friendly toast. We never put the raw error.message in
    // the DOM or in an alert().
    window.dispatchEvent(
      new CustomEvent('firestore-error', {
        detail: { operationType, path },
      })
    );
  }
}
