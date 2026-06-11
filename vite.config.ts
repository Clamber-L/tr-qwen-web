import type { ConfigEnv, UserConfig } from 'vite';

import { defineConfig } from 'vite';

import { getConfig } from './build';

export default defineConfig((params: ConfigEnv): UserConfig => {
    return getConfig(params);
});
