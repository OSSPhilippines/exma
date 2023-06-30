import { Terminal, Loader } from '@exma/generator';

export * from '@exma/parser';
export { Terminal, Loader };
export type GeneratorProps = {
  config: Record<string, any>,
  schema: Record<string, any>,
  cli: Terminal
};