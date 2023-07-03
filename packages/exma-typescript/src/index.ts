import type { 
  PluginProps, 
  EnumConfig, 
  TypeConfig, 
  ModelConfig 
} from 'exma';

import path from 'path';
import { Project, IndentationText } from 'ts-morph';
import { Loader } from 'exma';

const map: Record<string, string> = {
  'String': 'string',
  'Text': 'string',
  'Number': 'number',
  'Integer': 'number',
  'Int': 'number',
  'Float': 'number',
  'Boolean': 'boolean',
  'Date': 'Date',
  'Time': 'Date',
  'Datetime': 'Date',
  'Json': 'Record<string, any>',
  'Hash': 'Record<string, string|number|boolean>'
};

function capitalize(word: string) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

export default function generate({ config, schema, cli }: PluginProps) {
  if (!config.output) {
    return cli.terminal.error('No output directory specified');
  }

  const lang = config.lang || 'ts';
  const destination = Loader.absolute(config.output as string);
  const root = path.dirname(destination);
  const filename = path.basename(destination);
  
  const project = new Project({
    tsConfigFilePath: path.resolve(__dirname, '../tsconfig.json'),
    skipAddingFilesFromTsConfig: true,
    compilerOptions: {
      outDir: root,
      declaration: true, // Generates corresponding '.d.ts' file.
      declarationMap: true, // Generates a sourcemap for each corresponding '.d.ts' file.
      sourceMap: true, // Generates corresponding '.map' file.
    },
    manipulationSettings: {
      indentationText: IndentationText.TwoSpaces
    }
  });

  const directory = project.createDirectory(root);
  const source = directory.createSourceFile(filename, '', { overwrite: true });

  if (schema.enum && typeof schema.enum === 'object' && !Array.isArray(schema.enum)) {
    const enums = schema.enum as Record<string, EnumConfig>;
    for (const name in enums) {
      source.addEnum({
        name: capitalize(name),
        isExported: true,
        members: Object.keys(schema.enum[name]).map(key => ({ 
          name: key, 
          value: enums[name][key] as string
        }))
      });
    }
  }

  if (schema.type && typeof schema.type === 'object' && !Array.isArray(schema.type)) {
    const types = schema.type as Record<string, TypeConfig>;
    for (const name in types) {
      const code = types[name].columns.map(column => {
        const type = map[column.type] || column.type;
        const key = `${column.name}${!column.required ? '?' : ''}`;
        const value = `${type}${column.multiple ? '[]' : ''}`;
        return `  ${key}: ${value}`;
      });
      source.addTypeAlias({
        name: capitalize(name),
        isExported: true,
        type: [ '{', ...code, '}' ].join('\n')
      });
    }
  }

  if (schema.model && typeof schema.model === 'object' && !Array.isArray(schema.model)) {
    const models = schema.model as Record<string, ModelConfig>;
    const extended: Record<string, Record<string, { 
      from: string, 
      to: string,
      required: boolean
    }>> = {};
    for (const name in models) {
      for (const column of models[name].columns) {
        //check for a related column
        if (Array.isArray(column.attributes.relation)) {
          const relation = column.attributes.relation as string[];
          extended[name] = extended[name] || {};
          extended[name][relation[0]] = { 
            from: column.name, 
            to: relation[1],
            required: column.required
          };
        }
      }
    }
    for (const name in models) {
      const code = models[name].columns.map(column => {
        const type = map[column.type] || column.type;
        const key = `${column.name}${!column.required ? '?' : ''}`;
        const value = `${type}${column.multiple ? '[]' : ''}`;
        return `  ${key}: ${value}`;
      });
      source.addTypeAlias({
        name: capitalize(name),
        isExported: true,
        type: [ '{', ...code, '}' ].join('\n')
      });
      //check for extended
      if (extended[name]) {
        source.addTypeAlias({
          name: `${capitalize(name)}Extended`,
          isExported: true,
          type: [ 
            `${capitalize(name)} & {`, 
            ...Object.keys(extended[name]).map(model => {
              const { required } = extended[name][model];
              const key = required 
                ? model.toLowerCase()
                : `${model.toLowerCase()}?`;
              const value = extended[model] 
                ? `${capitalize(model)}Extended` 
                : capitalize(model);
              return `  ${key}: ${value}`;
            }), 
            '}' 
          ].join('\n')
        });
      }
    }
  }

  source.formatText();

  //if you want ts, tsx files
  if (lang == 'ts') {
    project.saveSync();
  //if you want js, d.ts files
  } else {
    project.emit();
  }
};