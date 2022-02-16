import { resolve } from 'path';

import reactPlugin from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
// import reactRefresh from '@vitejs/plugin-react-refresh';
import macrosPlugin from 'vite-plugin-babel-macros';
import { viteExternalsPlugin } from 'vite-plugin-externals';
import tsconfigPaths from 'vite-tsconfig-paths';

const isDev = process.env.ENVIRONMENT === 'DEVELOPMENT';
console.log('env.dev:', process.env.ENVIRONMENT, ' isDev:', isDev);

/**
 * browserify for web3 components
 */
const externals = {
  http: 'http-browserify',
  https: 'http-browserify',
  timers: 'timers-browserify',
  electron: 'electron',
  'electron-fetch': 'electron-fetch',
};

const nodeShims = {
  util: 'util',
};

/**
 * Externals:
 * - node externals are required because web3 are terribly bundled and some of them use commonjs libraries.  modern libs like ethers help with this.
 * - electron:  added due to ipfs-http-client.  it has very poor esm compatibility and a ton of dependency bugs. see: https://github.com/ipfs/js-ipfs/issues/3452
 */
const externalPlugin = viteExternalsPlugin({
  ...externals,
  ...(isDev ? { ...nodeShims } : {}),
});

/**
 * These libraries should not be egarly bundled by vite.  They have strange dependencies and are not needed for the app.
 */
const excludeDeps = ['@apollo/client', `graphql`];

export default defineConfig({
  plugins: [reactPlugin(), macrosPlugin(), tsconfigPaths(), externalPlugin],
  build: {
    sourcemap: true,
    commonjsOptions: {
      include: /node_modules/,
      transformMixedEsModules: true,
    },
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
  },
  esbuild: {
    jsxFactory: 'jsx',
    jsxInject: `import {jsx, css} from '@emotion/react'`,
  },
  define: {},
  optimizeDeps: {
    exclude: excludeDeps,
  },
  resolve: {
    preserveSymlinks: true,
    mainFields: ['module', 'main', 'browser'],
    alias: {
      '~~': resolve(__dirname, 'src'),
      ...externals,
      ...nodeShims,
      process: 'process',
      stream: 'stream-browserify',
    },
  },
  server: {
    watch: {
      followSymlinks: true,
    },
    fs: {
      // compatability for yarn workspaces
      allow: ['../../'],
    },
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },
});
