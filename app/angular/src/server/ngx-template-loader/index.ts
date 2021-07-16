/*
 * By the time this file was added the repository for angular2-template-loader received no updates in 3 years
 * This is just a copy of https://github.com/TheLarkInn/angular2-template-loader/blob/master/index.js in order
 * to fix a bug that prevents Storybook from updating raw-loader > ^1.0.0
 *
 * As suggested in https://github.com/storybookjs/storybook/issues/7877#issuecomment-536556755 this code was
 * modified to be compatible with newer versions of raw-loader as well as backwards compatible with raw-loader ^1.0.0
 */

// using: regex, capture groups, and capture group variables.
const templateUrlRegex = /templateUrl\s*:(\s*['"`](.*?)['"`]\s*([,}]))/gm;
const stylesRegex = /styleUrls *:(\s*\[[^\]]*?\])/g;
const stringRegex = /(['`"])((?:[^\\]\\\1|.)*?)\1/g;

const replaceStringsWithRequires = (string: string) =>
  string.replace(stringRegex, (match, quote, url) => {
    let newUrl = url;
    if (url.charAt(0) !== '.') {
      newUrl = `./${url}`;
    }
    const requireString = `(require('${newUrl}').default || require('${newUrl}'))`;

    // without the length check an empty style file will throw
    // "Expected 'styles' to be an array of strings"
    return `${requireString}.length ? ${requireString} : ''`;
  });

export default function (source: string) {
  const styleProperty = 'styles';
  const templateProperty = 'template';

  return source
    .replace(
      templateUrlRegex,
      (_, templateUrlString: string) =>
        // replace: templateUrl: './path/to/template.html'
        // with: template: require('./path/to/template.html')
        // or: templateUrl: require('./path/to/template.html')
        // if `keepUrl` query parameter is set to true.
        `${templateProperty}:${replaceStringsWithRequires(templateUrlString)}`
    )
    .replace(
      stylesRegex,
      (_, styleUrlsString: string) =>
        // replace: stylesUrl: ['./foo.css', "./baz.css", "./index.component.css"]
        // with: styles: [require('./foo.css'), require("./baz.css"), require("./index.component.css")]
        // or: styleUrls: [require('./foo.css'), require("./baz.css"), require("./index.component.css")]
        // if `keepUrl` query parameter is set to true.
        `${styleProperty}:${replaceStringsWithRequires(styleUrlsString)}`
    );
}
