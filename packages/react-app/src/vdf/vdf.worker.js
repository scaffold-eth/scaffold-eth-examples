import { BigNumber } from '@ethersproject/bignumber';
import { randE, to256Bytes } from './rsa';
import { evaluate } from "./vdf";


export function vdf(g, t) {
  // let proof = evaluate(g, t);
  let proof = new Promise((resolve, reject) => {
    const proof = evaluate(BigNumber.from(g), t);
    resolve(proof);
  })
  return proof;
}
