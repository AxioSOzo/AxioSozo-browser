/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// The caller handles absent files separately and owns all persistence state.
// Invalid input throws through the core before a persistence signal exists.
export function createStoreMigrationValidator({ core }) {
  return Object.freeze({
    validateOriginalVersion(value) {
      const document = core.migrateContextStore(value);
      const needsPersistence = value.version !== core.CONTEXT_STORE_VERSION ||
        value.projects.some(project => project.version !== 2);
      return Object.freeze({ document, needsPersistence });
    },
  });
}
