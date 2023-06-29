//types
import type { 
  Data,
  Scalar,
  DataToken,
  ArrayToken, 
  ObjectToken,
  SchemaToken,
  LiteralToken, 
  UseReferences,
  IdentifierToken, 
  DeclarationToken 
} from '../types';

import Exception from './Exception';

export default class Compiler {
  /**
   * Compiles an array tree into an actual array
   */
  static array<T = Data[]>(token: ArrayToken, references: UseReferences = false) {
    return token.elements.map(element => this.data(element, references)) as T;
  }

  /**
   * Compiles an array, object or scalar tree into the actual value
   */
  static data(token: DataToken, references: UseReferences = false): Data {
    if (token.type === 'ObjectExpression') {
      return this.object(token, references);
    } else if (token.type === 'ArrayExpression') {
      return this.array(token, references);
    } else if (token.type === 'Literal') {
      return this.literal(token);
    } else if (token.type === 'Identifier') {
      return this.identifier(token, references);
    }

    throw Exception.for('Invalid data token type');
  }

  /**
   * Converts an enum tree into a json version
   */
  static enum<T = Scalar>(token: DeclarationToken) {
    if (token.kind !== 'enum') {
      throw Exception.for('Invalid Enum');
    }
    //ex. Roles
    const name = token.declarations?.[0].id?.name as string;
    const value: Record<string, Scalar> = {};
    token.declarations[0].init.properties.forEach(property => {
      value[property.key.name] = (property.value as LiteralToken).value;
    });
    return [ name, value ] as [ string, Record<string, T> ];
  }

  /**
   * Compiles an identifier into the actual value it's referencing
   */
  static identifier(token: IdentifierToken, references: UseReferences = false) {
    if (references && token.name in references) {
      return references[token.name];
    } else if (references === false) {
      return '${' + token.name + '}';
    }

    throw Exception.for(`Unknown reference ${token.name}`);
  }

  /**
   * Compiles a literal into the actual value
   */
  static literal(token: LiteralToken) {
    return token.value;
  }

  /**
   * Converts a model tree into a json version
   */
  static model(token: DeclarationToken, references: UseReferences = false) {
    //ex. Foobar
    const name = token.declarations[0].id?.name;
    const value: Record<string, any> = {};
    token.declarations[0].init.properties.forEach(property => {
      value[property.key.name] = this.data(property.value, references);
    });

    if (typeof value.columns !== 'object') {
      throw Exception.for('Expecting a columns property');
    }

    for (const column in value.columns) {
      if (typeof value.columns[column].type === 'string') {
        value.columns[column].required = !value.columns[column].type.endsWith('?');
        value.columns[column].type = value.columns[column].type.replace(/\?$/, '');
        value.columns[column].multiple = value.columns[column].type.endsWith('[]');
        value.columns[column].type = value.columns[column].type.replace(/\[\]$/, '');
      }
    }

    return [ name, value ] as [ string, Record<string, any> ];
  }

  /**
   * Compiles an object tree into the actual object
   */
  static object<T = Data>(token: ObjectToken, references: UseReferences = false) {
    return Object.fromEntries(token.properties.map(property => [ 
      property.key.name, 
      this.data(property.value, references) 
    ])) as Record<string, T>;
  }

  /**
   * Converts a prop tree into a json version
   */
  static prop<T = any>(token: DeclarationToken, references: UseReferences = false) {
    if (token.kind !== 'prop') {
      throw Exception.for('Invalid Prop');
    }
    //ex. Foobar
    const name = token.declarations[0].id.name;
    const value: Record<string, any> = {};
    token.declarations[0].init.properties.forEach(property => {
      value[property.key.name] = this.data(property.value, references);
    });
    return [ name, value ] as [ string, T ];
  }

  /**
   * Converts a schema tree into a json version
   */
  static schema(token: SchemaToken, finalize = false) {
    if (token.kind !== 'schema') {
      throw Exception.for('Invalid Schema');
    }

    const json: Record<string, any> = {};
    const references: Record<string, any> = {};
    token.body.forEach(declaration => {
      if (declaration.kind === 'enum') {
        json.enum = json.enum || {};
        const [ key, value ] = this.enum(declaration);
        json.enum[key] = value;
        if (references[key]) {
          throw Exception.for('Duplicate %s', key);
        }
        references[key] = value;
      } else if (declaration.kind === 'prop') {
        json.prop = json.prop || {};
        const [ key, value ] = this.prop(
          declaration, 
          finalize ? references: false
        );
        json.prop[key] = value;
        if (references[key]) {
          throw Exception.for('Duplicate %s', key);
        }
        references[key] = value;
      } else if (declaration.kind === 'type') {
        json.type = json.type || {};
        const [ key, value ] = this.type(
          declaration, 
          finalize ? references: false
        );
        json.type[key] = value;
        if (references[key]) {
          throw Exception.for('Duplicate %s', key);
        }
        references[key] = value;
      } else if (declaration.kind === 'model') {
        json.model = json.model || {};
        const [ key, value ] = this.model(
          declaration, 
          finalize ? references: false
        );
        json.model[key] = value;
        if (references[key]) {
          throw Exception.for('Duplicate %s', key);
        }
        references[key] = value;
      }
    });

    return json;
  }

  /**
   * Converts a type tree into a json version
   */
  static type(token: DeclarationToken, references: UseReferences = false) {
    if (token.kind !== 'type') {
      throw Exception.for('Invalid Type');
    }
    //ex. Foobar
    const name = token.declarations[0].id.name;
    const value: Record<string, any> = {};
    token.declarations[0].init.properties.forEach(property => {
      value[property.key.name] = this.data(property.value, references);
    });

    if (typeof value.columns !== 'object') {
      throw Exception.for('Expecting a columns property');
    }

    for (const column in value.columns) {
      if (typeof value.columns[column].type === 'string') {
        value.columns[column].required = !value.columns[column].type.endsWith('?');
        value.columns[column].type = value.columns[column].type.replace(/\?$/, '');
        value.columns[column].multiple = value.columns[column].type.endsWith('[]');
        value.columns[column].type = value.columns[column].type.replace(/\[\]$/, '');
      }
    }

    return [ name, value ] as [ string, Record<string, any> ];
  }
};