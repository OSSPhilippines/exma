import type { PluginConfig, SchemaConfig } from '@exma/parser';
import { Terminal, Loader } from '@exma/generator';

export * from '@exma/parser';
export { Terminal, Loader };
export type PluginProps = {
  config: PluginConfig,
  schema: SchemaConfig,
  cli: Terminal
};