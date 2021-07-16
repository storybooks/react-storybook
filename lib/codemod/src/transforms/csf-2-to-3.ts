/* eslint-disable no-underscore-dangle */
import prettier from 'prettier';
import * as t from '@babel/types';
import { CsfFile, formatCsf, loadCsf } from '@storybook/csf-tools';
import { jscodeshiftToPrettierParser } from '../lib/utils';

const renameIdentifier = (annotation: string) => (annotation === 'storyName' ? 'name' : annotation);

const getTemplateBindVariable = (init: t.Expression) =>
  t.isCallExpression(init) &&
  t.isMemberExpression(init.callee) &&
  t.isIdentifier(init.callee.object) &&
  t.isIdentifier(init.callee.property) &&
  init.callee.property.name === 'bind' &&
  (init.arguments.length === 0 ||
    (init.arguments.length === 1 &&
      t.isObjectExpression(init.arguments[0]) &&
      init.arguments[0].properties.length === 0))
    ? init.callee.object.name
    : null;

// export const A = ...
// A.parameters = { ... }; <===
const isStoryAnnotation = (stmt: t.Statement, objectExports: Record<string, any>) =>
  t.isExpressionStatement(stmt) &&
  t.isAssignmentExpression(stmt.expression) &&
  t.isMemberExpression(stmt.expression.left) &&
  t.isIdentifier(stmt.expression.left.object) &&
  objectExports[stmt.expression.left.object.name];

const isTemplateDeclaration = (stmt: t.Statement, templates: Record<string, any>) =>
  t.isVariableDeclaration(stmt) &&
  stmt.declarations.length === 1 &&
  t.isIdentifier(stmt.declarations[0].id) &&
  templates[stmt.declarations[0].id.name];

const getNewExport = (stmt: t.Statement, objectExports: Record<string, any>) => {
  if (
    t.isExportNamedDeclaration(stmt) &&
    t.isVariableDeclaration(stmt.declaration) &&
    stmt.declaration.declarations.length === 1
  ) {
    const decl = stmt.declaration.declarations[0];
    if (t.isVariableDeclarator(decl) && t.isIdentifier(decl.id)) {
      return objectExports[decl.id.name];
    }
  }
  return null;
};

// Remove render function when it matches the global render function in react
// export default { component: Cat };
// export const A = (args) => <Cat {...args} />;
const isReactGlobalRenderFn = (csf: CsfFile, storyFn: t.Expression) => {
  if (
    csf._meta?.component &&
    t.isArrowFunctionExpression(storyFn) &&
    storyFn.params.length === 1 &&
    t.isJSXElement(storyFn.body)
  ) {
    const { openingElement } = storyFn.body;
    if (
      openingElement.selfClosing &&
      t.isJSXIdentifier(openingElement.name) &&
      openingElement.attributes.length === 1
    ) {
      const attr = openingElement.attributes[0];
      const param = storyFn.params[0];
      if (
        t.isJSXSpreadAttribute(attr) &&
        t.isIdentifier(attr.argument) &&
        t.isIdentifier(param) &&
        param.name === attr.argument.name &&
        csf._meta.component === openingElement.name.name
      ) {
        return true;
      }
    }
  }
  return false;
};

// A simple CSF story is a no-arg story without any extra annotations (params, args, etc.)
const isSimpleCSFStory = (init: t.Expression, annotations: t.ObjectProperty[]) =>
  annotations.length === 0 && t.isArrowFunctionExpression(init) && init.params.length === 0;

function transform({ source }: { source: string }, api: any, options: { parser?: string }) {
  const csf = loadCsf(source).parse();

  const objectExports: Record<string, t.Statement> = {};
  Object.entries(csf._storyExports).forEach(([key, decl]) => {
    const annotations = Object.entries(csf._storyAnnotations[key]).map(([annotation, val]) =>
      t.objectProperty(t.identifier(renameIdentifier(annotation)), val as t.Expression)
    );

    const { init, id } = decl;
    // only replace arrow function expressions && template
    // ignore no-arg stories without annotations
    const template = getTemplateBindVariable(init);
    if ((!t.isArrowFunctionExpression(init) && !template) || isSimpleCSFStory(init, annotations)) {
      return;
    }

    // Remove the render function when we can hoist the template
    // const Template = (args) => <Cat {...args} />;
    // export const A = Template.bind({});
    let storyFn = template && csf._templates[template];
    if (!storyFn) storyFn = init;

    const keyId = t.identifier(key);
    // @ts-ignore
    const { typeAnnotation } = id;
    if (typeAnnotation) {
      keyId.typeAnnotation = typeAnnotation;
    }

    const renderAnnotation = isReactGlobalRenderFn(csf, storyFn)
      ? []
      : [t.objectProperty(t.identifier('render'), storyFn)];

    objectExports[key] = t.exportNamedDeclaration(
      t.variableDeclaration('const', [
        t.variableDeclarator(keyId, t.objectExpression([...renderAnnotation, ...annotations])),
      ])
    );
  });

  const updatedBody = csf._ast.program.body.reduce((acc, stmt) => {
    // remove story annotations & template declarations
    if (isStoryAnnotation(stmt, objectExports) || isTemplateDeclaration(stmt, csf._templates)) {
      return acc;
    }

    // replace story exports with new object exports
    const newExport = getNewExport(stmt, objectExports);
    if (newExport) {
      acc.push(newExport);
      return acc;
    }

    // include unknown statements
    acc.push(stmt);
    return acc;
  }, []);
  csf._ast.program.body = updatedBody;
  const output = formatCsf(csf);

  const prettierConfig = prettier.resolveConfig.sync('.', { editorconfig: true }) || {
    printWidth: 100,
    tabWidth: 2,
    bracketSpacing: true,
    trailingComma: 'es5',
    singleQuote: true,
  };

  return prettier.format(output, {
    ...prettierConfig,
    parser: jscodeshiftToPrettierParser(options?.parser),
  });
}

export default transform;
