import deprecate from 'util-deprecate';
import dedent from 'ts-dedent';

export function parseList(str: string): string[] {
  return str.split(',');
}

export function getEnvConfig(program: Record<string, any>, configEnv: Record<string, any>): void {
  Object.keys(configEnv).forEach((fieldName) => {
    const envVarName = configEnv[fieldName];
    const envVarValue = process.env[envVarName];
    if (envVarValue) {
      // eslint-disable-next-line no-param-reassign
      program[fieldName] = envVarValue;
    }
  });
}

const warnDLLsDeprecated = deprecate(
  () => {},
  dedent`
    DLL-related CLI flags are deprecated, see:
    
    https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#deprecated-dll-flags
  `
);

export function checkDeprecatedFlags(options: {
  dll?: boolean;
  uiDll?: boolean;
  docsDll?: boolean;
}) {
  if (!options.dll || options.uiDll || options.docsDll) {
    warnDLLsDeprecated();
  }
}
