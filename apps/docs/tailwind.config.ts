import type { Config } from 'tailwindcss';
import { createPreset } from 'fumadocs-ui/tailwind-plugin';

const config: Config = {
  content: [
    './node_modules/fumadocs-ui/dist/**/*.js',
    './src/**/*.{ts,tsx,mdx}',
    './content/**/*.{ts,tsx,mdx}'
  ],
  presets: [createPreset()],
};

export default config;