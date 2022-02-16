import { EthComponentsSettingsContext, IEthComponentsSettings } from 'eth-components/models';
import { EthersAppContext } from 'eth-hooks/context';
import { lazier } from 'eth-hooks/helpers';
import React, { FC, Suspense } from 'react';
import { ThemeSwitcherProvider } from 'react-css-theme-switcher';

import { ErrorBoundary, ErrorFallback } from '~~/components/common/ErrorFallback';
import { ContractsAppContext } from '~~/config/contractContext';

/**
 * ⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️
 * 🏹 See MainPage.tsx for main app component!
 * ⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️
 *
 * This file loads the app async.  It sets up context, error boundaries, styles etc.
 * You don't need to change this file!!
 */

// import postcss style file
import '~~/styles/css/tailwind-base.pcss';
import '~~/styles/css/tailwind-components.pcss';
import '~~/styles/css/tailwind-utilities.pcss';
import '~~/styles/css/app.css';

console.log('init app...');

const BLOCKNATIVE_DAPPID = import.meta.env.VITE_KEY_BLOCKNATIVE_DAPPID;

// load saved theme
const savedTheme = window.localStorage.getItem('theme');

// setup themes for theme switcher
const themes = {
  dark: './dark-theme.css',
  light: './light-theme.css',
};

// create eth components context for options and API keys
const ethComponentsSettings: IEthComponentsSettings = {
  apiKeys: {
    BlocknativeDappId: BLOCKNATIVE_DAPPID,
  },
};

/**
 * Lazy load the main app component
 */
const MainPage = lazier(() => import('./MainPage'), 'Main');

/**
 * ### Summary
 * The main app component is {@see MainPage} `components/routes/main/MaingPage.tsx`
 * This component sets up all the providers, Suspense and Error handling
 * @returns
 */
const App: FC = () => {
  console.log('loading app...');
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <EthComponentsSettingsContext.Provider value={ethComponentsSettings}>
        <ContractsAppContext>
          <EthersAppContext>
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <ThemeSwitcherProvider themeMap={themes} defaultTheme={savedTheme || 'light'}>
                <Suspense fallback={<div />}>
                  <MainPage />
                </Suspense>
              </ThemeSwitcherProvider>
            </ErrorBoundary>
          </EthersAppContext>
        </ContractsAppContext>
      </EthComponentsSettingsContext.Provider>
    </ErrorBoundary>
  );
};

export default App;
