import doctrine, { Annotation } from 'doctrine';
import {
  ExtractedJsDoc,
  ExtractedJsDocParam,
  ExtractedJsDocReturns,
  JsDocParsingOptions,
  ParseJsDoc,
} from './docgen/types';

function containsJsDoc(value?: string): boolean {
  return value != null && value.includes('@');
}

function parse(content: string, tags: string[]): Annotation {
  let ast;

  try {
    ast = doctrine.parse(content, {
      tags,
      sloppy: true,
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);

    throw new Error('Cannot parse JSDoc tags.');
  }

  return ast;
}

const DEFAULT_OPTIONS = {
  tags: ['param', 'arg', 'argument', 'returns', 'ignore'],
};

export const parseJsDoc: ParseJsDoc = (
  value?: string,
  options: JsDocParsingOptions = DEFAULT_OPTIONS
) => {
  if (!containsJsDoc(value)) {
    return {
      includesJsDoc: false,
      ignore: false,
    };
  }

  const jsDocAst = parse(value, options.tags);
  const extractedTags = extractJsDocTags(jsDocAst);

  if (extractedTags.ignore) {
    // There is no point in doing other stuff since this prop will not be rendered.
    return {
      includesJsDoc: true,
      ignore: true,
    };
  }

  return {
    includesJsDoc: true,
    ignore: false,
    // Always use the parsed description to ensure JSDoc is removed from the description.
    description: jsDocAst.description,
    extractedTags,
  };
};

function extractJsDocTags(ast: doctrine.Annotation): ExtractedJsDoc {
  const extractedTags: ExtractedJsDoc = {
    params: null,
    returns: null,
    ignore: false,
  };

  for (let i = 0; i < ast.tags.length; i += 1) {
    const tag = ast.tags[i];

    if (tag.title === 'ignore') {
      extractedTags.ignore = true;
      // Once we reach an @ignore tag, there is no point in parsing the other tags since we will not render the prop.
      break;
    } else {
      switch (tag.title) {
        // arg & argument are aliases for param.
        case 'param':
        case 'arg':
        case 'argument': {
          const paramTag = extractParam(tag);
          if (paramTag != null) {
            if (extractedTags.params == null) {
              extractedTags.params = [];
            }
            extractedTags.params.push(paramTag);
          }
          break;
        }
        case 'returns': {
          const returnsTag = extractReturns(tag);
          if (returnsTag != null) {
            extractedTags.returns = returnsTag;
          }
          break;
        }
        default:
          break;
      }
    }
  }

  return extractedTags;
}

function extractParam(tag: doctrine.Tag): ExtractedJsDocParam {
  const paramName = tag.name;

  // When the @param doesn't have a name but have a type and a description, "null-null" is returned.
  if (paramName != null && paramName !== 'null-null') {
    return {
      name: tag.name,
      type: tag.type,
      description: tag.description,
      getPrettyName: () => {
        if (paramName.includes('null')) {
          // There is a few cases in which the returned param name contains "null".
          // - @param {SyntheticEvent} event- Original SyntheticEvent
          // - @param {SyntheticEvent} event.\n@returns {string}
          return paramName.replace('-null', '').replace('.null', '');
        }

        return tag.name;
      },
      getTypeName: () => (tag.type != null ? extractTypeName(tag.type) : null),
    };
  }

  return null;
}

function extractReturns(tag: doctrine.Tag): ExtractedJsDocReturns {
  if (tag.type != null) {
    return {
      type: tag.type,
      description: tag.description,
      getTypeName: () => extractTypeName(tag.type),
    };
  }

  return null;
}

function extractTypeName(type: doctrine.Type): string {
  if (type.type === 'NameExpression') {
    return type.name;
  }

  if (type.type === 'RecordType') {
    const recordFields = type.fields.map((field: doctrine.type.FieldType) => {
      if (field.value != null) {
        const valueTypeName = extractTypeName(field.value);

        return `${field.key}: ${valueTypeName}`;
      }

      return field.key;
    });

    return `({${recordFields.join(', ')}})`;
  }

  if (type.type === 'UnionType') {
    const unionElements = type.elements.map(extractTypeName);

    return `(${unionElements.join('|')})`;
  }

  // Only support untyped array: []. Might add more support later if required.
  if (type.type === 'ArrayType') {
    return '[]';
  }

  if (type.type === 'TypeApplication') {
    if (type.expression != null) {
      if ((type.expression as doctrine.type.NameExpression).name === 'Array') {
        const arrayType = extractTypeName(type.applications[0]);

        return `${arrayType}[]`;
      }
    }
  }

  if (
    type.type === 'NullableType' ||
    type.type === 'NonNullableType' ||
    type.type === 'OptionalType'
  ) {
    return extractTypeName(type.expression);
  }

  if (type.type === 'AllLiteral') {
    return 'any';
  }

  return null;
}
