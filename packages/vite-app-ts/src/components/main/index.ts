import { lazier } from 'eth-hooks/helpers';

// use lazy/lazier for react lazy loading

/**
 * lazy/lazier loaded component
 */
export const MainPageContracts = lazier(() => import('./MainPageContracts'), 'MainPageContracts');
/**
 * lazy/lazier loaded component
 */
export const MainPageFooter = lazier(() => import('./MainPageFooter'), 'MainPageFooter');
/**
 * lazy/lazier loaded component
 */
export const MainPageHeader = lazier(() => import('./MainPageHeader'), 'MainPageHeader');
/**
 * lazy/lazier loaded component
 */
export const MainPageMenu = lazier(() => import('./MainPageMenu'), 'MainPageMenu');
