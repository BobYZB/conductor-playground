// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1];
const basePath = process.env.SITE_BASE_PATH ?? (repositoryName ? `/${repositoryName}` : '/farmerville');

// https://astro.build/config
export default defineConfig({
  site: process.env.SITE_URL ?? 'https://example.com',
  base: basePath,
  integrations: [react()],
});
