import type { GeneratorConfig, SchemaConfig } from '@exma/parser';
import { Terminal, Loader } from '@exma/generator';

export * from '@exma/parser';
export { Terminal, Loader };
export type GeneratorProps = {
  config: GeneratorConfig,
  schema: SchemaConfig,
  cli: Terminal
};