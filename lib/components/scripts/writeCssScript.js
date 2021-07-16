/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */

// This little script converts the overflowscrollbars CSS file into the css-in-js file
// it's normal you have to run prettier over the file after

const fs = require('fs');
const { parse } = require('css');
const { isNaN } = require('global');

const INPUT = require.resolve('overlayscrollbars/css/OverlayScrollbars.min.css');
const OUTPUT = `${__dirname}/../src/ScrollArea/ScrollAreaStyles.ts`;
const OPTIONS = { camelCase: true, numbers: true };

const read = (file) =>
  fs
    .readFileSync(file)
    .toString()
    .replace(/(?:\r\n|\r|\n)/g, '');

const convert = (css, opts) => {
  const ast = parse(css, { source: css });
  const obj = cssToObject(opts)(ast.stylesheet.rules);
  return obj;
};

const cssToObject = (opts) => (rules, result = {}) => {
  rules.forEach((rule) => {
    if (rule.type === 'media') {
      const key = `@media ${rule.media}`;
      const decs = cssToObject(opts)(rule.rules);
      result[key] = decs;
      return;
    }
    if (rule.type === 'keyframes') {
      result.__keyframes = Object.assign(result.__keyframes || {}, { [camel(rule.name)]: rule });
      return;
    }
    if (rule.type === 'comment') {
      return;
    }

    const key = rule.selectors.filter((s) => !s.includes('.os-theme-none')).join(', ');

    if (key.length) {
      Object.assign(result, {
        [key]: Object.assign(result[key] || {}, getDeclarations(rule.declarations, opts)),
      });
    }
  });
  return result;
};

const getDeclarations = (decs, opts = {}) => {
  const result = decs
    .filter((d) => {
      const filtered = d.type === 'comment' || d.property.match(/^(?:-webkit-|-ms-|-moz-)/);
      return !filtered;
    })
    .map((d) => ({
      key: opts.camelCase ? camel(d.property) : d.property,
      value: opts.numbers ? parsePx(d.value) : d.value,
    }))
    .reduce((a, b) => {
      a[b.key] = b.value;
      return a;
    }, {});
  return result;
};

const camel = (str) => str.replace(/(-[a-z])/g, (x) => x.toUpperCase()).replace(/-/g, '');

const parsePx = (val) =>
  /px$/.test(val) || val === '' || (val.match(/\d$/) && !isNaN(parseInt(val, 10)))
    ? parseFloat(val.replace(/px$/, ''))
    : val;

// eslint-disable-next-line @typescript-eslint/naming-convention
const { __keyframes, ...styles } = convert(read(INPUT), OPTIONS);

const stringifiedKeyFrames = Object.values(__keyframes)
  .map(
    (k) =>
      `const ${camel(k.name)} = keyframes\`${k.keyframes.reduce(
        (acc, item) =>
          `${acc}${k.position.source.substring(
            item.position.start.column - 1,
            item.position.end.column - 1
          )}`,
        ''
      )}\`;`
  )
  .join('\n');

const stringifiedStyles = JSON.stringify(
  Object.entries(styles).reduce((acc, [key, item]) => {
    if (item.animationName && __keyframes[camel(item.animationName)]) {
      item.animationName = camel(item.animationName);
    }

    if (item.backgroundImage && item.backgroundImage.match(/^url/)) {
      item.backgroundImage =
        'linear-gradient(135deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0)  50%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.4) 100%)';
    }

    acc[key] = item;
    return acc;
  }, {}),
  null,
  2
);

const stringifiedStylesWithReplacedKeyframes = Object.keys(__keyframes)
  .reduce(
    (acc, item) =>
      // replace keyframes
      acc.replace(`"${item}"`, `\`\${${item}}\``),
    stringifiedStyles
  )
  .replace(/"([^\s]+)!important"/g, (f, p1) => {
    // make "!important" rules work with TS
    const v = parsePx(p1);
    return `"${p1}!important" as any as ${JSON.stringify(v)}`;
  });

const result = `
  import { Theme, CSSObject, keyframes } from '@storybook/theming';

  ${stringifiedKeyFrames}

  export const getScrollAreaStyles: (theme: Theme) => CSSObject = (theme: Theme) => (${stringifiedStylesWithReplacedKeyframes});
`;

fs.writeFileSync(OUTPUT, result);
