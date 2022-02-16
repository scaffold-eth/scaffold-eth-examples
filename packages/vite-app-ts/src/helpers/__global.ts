/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import * as nodeBuffer from 'buffer';
import * as nodeProcess from 'process';
import * as util from 'util';

import 'eth-hooks/helpers/__global';

// (window as any).global = window;
// const global = window;

if (!global.hasOwnProperty('Buffer')) {
  (global as any).Buffer = nodeBuffer.Buffer;
}

(global as any).process = nodeProcess;

(global as any).util = util;

export {};
