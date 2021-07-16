import {
  getPreviewBodyTemplate,
  getPreviewHeadTemplate,
  getManagerMainTemplate,
  getPreviewMainTemplate,
  loadCustomBabelConfig,
  babelConfig,
  loadEnvs,
  Options,
} from '@storybook/core-common';

export const babel = async (_: unknown, options: Options) => {
  const { configDir, presets } = options;

  return loadCustomBabelConfig(
    configDir,
    () => presets.apply('babelDefault', babelConfig(), options) as any
  );
};

export const logLevel = (previous: any, options: Options) => previous || options.loglevel || 'info';

export const previewHead = async (base: any, { configDir, presets }: Options) => {
  const interpolations = await presets.apply<Record<string, string>>('env');
  return getPreviewHeadTemplate(configDir, interpolations);
};

export const env = async () => loadEnvs({ production: true }).raw;

export const previewBody = async (base: any, { configDir, presets }: Options) => {
  const interpolations = await presets.apply<Record<string, string>>('env');
  return getPreviewBodyTemplate(configDir, interpolations);
};

export const previewMainTemplate = () => getPreviewMainTemplate();

export const managerMainTemplate = () => getManagerMainTemplate();

export const previewEntries = (entries: any[] = [], options: { modern?: boolean }) => {
  if (!options.modern)
    entries.push(require.resolve('@storybook/core-client/dist/esm/globals/polyfills'));
  entries.push(require.resolve('@storybook/core-client/dist/esm/globals/globals'));
  return entries;
};

export const typescript = () => ({
  check: false,
  // 'react-docgen' faster but produces lower quality typescript results
  reactDocgen: 'react-docgen-typescript',
  reactDocgenTypescriptOptions: {
    shouldExtractLiteralValuesFromEnum: true,
    shouldRemoveUndefinedFromOptional: true,
    propFilter: (prop: any) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
    // NOTE: this default cannot be changed
    savePropValueAsString: true,
  },
});

export const features = async (existing: Record<string, boolean>) => ({
  ...existing,
  postcss: true,
});
