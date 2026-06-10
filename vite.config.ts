import { ConfigEnv, defineConfig, UserConfig } from 'vite';

import { getConfig } from './build';

export default defineConfig((params: ConfigEnv): UserConfig => {
    return getConfig(params);
});
