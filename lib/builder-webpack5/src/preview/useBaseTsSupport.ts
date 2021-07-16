/**
 * Returns true if the framework can use the base TS config.
 * @param {string} framework
 */

export const useBaseTsSupport = (framework: string) =>
  // These packages both have their own TS implementation.
  !['vue', 'angular'].includes(framework);
