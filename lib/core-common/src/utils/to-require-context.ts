import { makeRe, scan } from 'micromatch';
import deprecate from 'util-deprecate';
import dedent from 'ts-dedent';
import path from 'path';

// LEGACY support for bad glob patterns we had in SB 5 - remove in SB7
const fixBadGlob = deprecate(
  (match: RegExpMatchArray) => {
    return match.input.replace(match[1], `@${match[1]}`);
  },
  dedent`
    You have specified an invalid glob, we've attempted to fix it, please ensure that the glob you specify is valid. See: https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#correct-globs-in-mainjs
  `
);
const detectBadGlob = (val: string) => {
  const match = val.match(/\.(\([^)]+\))/);

  if (match) {
    return fixBadGlob(match);
  }

  return val;
};

const isObject = (val: Record<string, any>) =>
  val != null && typeof val === 'object' && Array.isArray(val) === false;

const dirname = (pattern: string) => {
  if (pattern.slice(-1) === '/') return pattern;
  return path.dirname(pattern);
};

export const toRequireContext = (input: any) => {
  const fixedInput = detectBadGlob(input);
  switch (true) {
    case typeof input === 'string': {
      const globResult = scan(fixedInput);
      const base = globResult.isGlob ? globResult.prefix + globResult.base : dirname(fixedInput);
      const globFallback = base !== '.' ? fixedInput.substr(base.length) : fixedInput;
      const glob = globResult.isGlob ? globResult.glob : globFallback;

      const regex = makeRe(glob, {
        fastpaths: false,
        noglobstar: false,
        bash: false,
      });
      const { source } = regex;

      if (source.startsWith('^')) {
        // webpack's require.context matches against paths starting `./`
        // Globs starting `**` require special treatment due to the regex they
        // produce, specifically a negative look-ahead
        const match = ['^\\.', glob.startsWith('**') ? '' : '\\/', source.substring(1)].join('');
        const recursive = glob.includes('**') || glob.split('/').length > 1;

        return { path: base, recursive, match };
      }

      throw new Error(`Invalid glob: >> ${input} >> ${regex}`);
    }
    case isObject(input): {
      return input;
    }

    default: {
      throw new Error('the provided input cannot be transformed into a require.context');
    }
  }
};

export const toRequireContextString = (input: any) => {
  const { path: p, recursive: r, match: m } = toRequireContext(input);

  const result = `require.context('${p}', ${r}, /${m}/)`;
  return result;
};
