/* eslint-disable */
//import './helpers/__global';

/**
 * ⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️
 * 🏹 See MainPage.tsx for main app component!
 * ⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️
 *
 * This file loads react.
 * You don't need to change this file!!
 */

/**
 * Loads {@see App} which sets up the application async.
 * The main page is in the component {@see MainPage}
 */
const run = async (): Promise<void> => {
  await import('./helpers/__global');
  // dynamic imports for code splitting
  const { lazy, Suspense, StrictMode } = await import('react');
  const ReactDOM = await import('react-dom');
  const { MoralisProvider } = await import('react-moralis');
  const App = lazy(() => import('./App'));

  ReactDOM.render(
    <MoralisProvider
      appId="wZFcpqX8tY96qQXEN7kBM3t349ycH0ITFMPUuWMi"
      serverUrl="https://mqae4ktqaurd.usemoralis.com:2053/server"
      initializeOnMount={true}>
      <StrictMode>
        <Suspense fallback={<div />}>
          <App />
        </Suspense>
      </StrictMode>
    </MoralisProvider>,
    document.getElementById('root')
  );
};

void run();

export {};
