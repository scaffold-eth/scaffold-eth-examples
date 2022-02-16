// the components and pages are lazy loaded for performance and bundle size reasons
// code is in the component file

import { lazier } from 'eth-hooks/helpers';

export const Lend = lazier(() => import('./lend/Lend'), 'Lend');
export const Borrow = lazier(() => import('./borrow/Borrow'), 'Borrow');
export const Check = lazier(() => import('./check/check'), 'Check');
export const MyLoans = lazier(() => import('./my-loans/MyLoans'), 'MyLoans');
