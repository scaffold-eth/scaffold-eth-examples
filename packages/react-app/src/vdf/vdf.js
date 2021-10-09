"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verify = exports.evaluate = exports.isProbablePrime = exports.randPrime = exports.hashToPrime = exports.hash = void 0;
const ethers_1 = require("ethers");
const rsa_1 = require("./rsa");
const MILLER_RABIN_ROUNDS = 15;
const DST = '0x';
function hash(g, y, nonce, dst) {
    return rsa_1.newE(ethers_1.ethers.utils.solidityKeccak256(['bytes', 'bytes', 'bytes', 'uint256'], [dst, g, y, nonce]));
}
exports.hash = hash;
function hashToPrime(g, y, dst) {
    for (let i = 0; i < 1 << 16; i++) {
        let candidate = hash(g, y, i, dst);
        if (candidate.and(1).eq(0)) {
            candidate = candidate.add(1);
        }
        if (isProbablePrime(candidate)) {
            return { l: candidate, nonce: i };
        }
    }
    return null;
}
exports.hashToPrime = hashToPrime;
function randPrime() {
    let i = 0;
    let candidate = rsa_1.randE(32);
    if (candidate.and(1).eq(0)) {
        candidate = candidate.add(1);
    }
    while (true) {
        if (isProbablePrime(candidate)) {
            return candidate;
        }
        candidate = candidate.add(2);
    }
}
exports.randPrime = randPrime;
function isProbablePrime(n) {
    if (n.lt(3)) {
        return false;
    }
    if (!n.and(1).eq(1)) {
        return false;
    }
    let d = n.sub(1);
    let r = 0;
    while (d.and(1).eq(0)) {
        d = d.shr(1);
        r += 1;
    }
    for (let i = 0; i < MILLER_RABIN_ROUNDS; i++) {
        let a = rsa_1.newE(10); //randBelow(n.sub(3)).add(2);
        let x = rsa_1.exp(a, d, n);
        if (x.eq(1) || x.eq(n.sub(1))) {
            continue;
        }
        let passed = false;
        for (let j = 1; j < r; j++) {
            x = x.mul(x).mod(n);
            if (x.eq(n.sub(1))) {
                passed = true;
                break;
            }
        }
        if (!passed) {
            return false;
        }
    }
    return true;
}
exports.isProbablePrime = isProbablePrime;
function evaluate(g, t) {
    const e = rsa_1.newE(1).shl(t);
    const y = rsa_1.exp(g, e);
    const challenge = hashToPrime(g, y, DST);
    let z = e;
    let r = rsa_1.newE(1);
    let pi = rsa_1.newE(1);
    while (!z.eq(0)) {
        const r2 = r.mul(2);
        const b = r2.div(challenge.l);
        r = r2.mod(challenge.l);
        const gb = rsa_1.exp(g, b);
        pi = rsa_1.mulE(pi, pi);
        pi = rsa_1.mulE(pi, gb);
        z = z.sub(1);
    }
    // some extra work for helper value
    const u1 = rsa_1.exp(pi, challenge.l);
    const u2 = rsa_1.exp(g, e);
    const q = rsa_1.find_q(u1, u2);
    return { pi, challenge, y, q };
}
exports.evaluate = evaluate;
function verify(g, t, proof) {
    let l = hash(g, proof.y, proof.challenge.nonce, DST);
    if (l.and(1).eq(0)) {
        l = l.add(1);
    }
    if (!l.eq(proof.challenge.l)) {
        return false;
    }
    if (!isProbablePrime(l)) {
        return false;
    }
    const T = rsa_1.newE(1).shl(t);
    const u1 = rsa_1.exp(proof.pi, proof.challenge.l);
    const u2 = rsa_1.exp(g, T);
    return rsa_1.mulE(u1, u2).eq(proof.y);
}
exports.verify = verify;
// const g = randE();
// const t = 4;
// const proof = evaluate(g, t);
// console.log('must verify', verify(g, t, proof));

// vdf.ts https://github.com/kilic/evmvdf/blob/master/test/vdf.ts
//
// import { ethers } from 'hardhat';
//
// import { E, exp, find_q, mulE, newE, randE } from './rsa';
//
// const MILLER_RABIN_ROUNDS = 15;
// const DST = '0x';
//
// export interface Challenge {
//   l: E;
//   nonce: number;
// }
//
// export interface Proof {
//   challenge: Challenge;
//   pi: E;
//   y: E;
//   q: E;
// }
//
// export function hash(g: E, y: E, nonce: number, dst: string): E {
//   return newE(ethers.utils.solidityKeccak256(['bytes', 'bytes', 'bytes', 'uint256'], [dst, g, y, nonce]));
// }
//
// export function hashToPrime(g: E, y: E, dst: string): Challenge | null {
//   for (let i = 0; i < 1 << 16; i++) {
//     let candidate = hash(g, y, i, dst);
//     if (candidate.and(1).eq(0)) {
//       candidate = candidate.add(1);
//     }
//     if (isProbablePrime(candidate)) {
//       return { l: candidate, nonce: i };
//     }
//   }
//   return null;
// }
//
// export function randPrime() {
//   let i = 0;
//   let candidate = randE(32);
//   if (candidate.and(1).eq(0)) {
//     candidate = candidate.add(1);
//   }
//   while (true) {
//     if (isProbablePrime(candidate)) {
//       return candidate;
//     }
//     candidate = candidate.add(2);
//   }
// }
//
// export function isProbablePrime(n: E): boolean {
//   if (n.lt(3)) {
//     return false;
//   }
//   if (!n.and(1).eq(1)) {
//     return false;
//   }
//   let d = n.sub(1);
//   let r = 0;
//   while (d.and(1).eq(0)) {
//     d = d.shr(1);
//     r += 1;
//   }
//
//   for (let i = 0; i < MILLER_RABIN_ROUNDS; i++) {
//     let a = newE(10); //randBelow(n.sub(3)).add(2);
//     let x = exp(a, d, n);
//     if (x.eq(1) || x.eq(n.sub(1))) {
//       continue;
//     }
//     let passed = false;
//     for (let j = 1; j < r; j++) {
//       x = x.mul(x).mod(n);
//       if (x.eq(n.sub(1))) {
//         passed = true;
//         break;
//       }
//     }
//     if (!passed) {
//       return false;
//     }
//   }
//
//   return true;
// }
//
// export function evaluate(g: E, t: number): Proof {
//   const e = newE(1).shl(t);
//   const y = exp(g, e);
//   const challenge = hashToPrime(g, y, DST)!;
//
//   let z = e;
//   let r = newE(1);
//   let pi = newE(1);
//
//   while (!z.eq(0)) {
//     const r2 = r.mul(2);
//     const b = r2.div(challenge.l);
//     r = r2.mod(challenge.l);
//     const gb = exp(g, b);
//     pi = mulE(pi, pi);
//     pi = mulE(pi, gb);
//     z = z.sub(1);
//   }
//
//   // some extra work for helper value
//   const u1 = exp(pi, challenge.l);
//   const u2 = exp(g, e);
//   const q = find_q(u1, u2);
//   return { pi, challenge, y, q };
// }
//
// export function verify(g: E, t: number, proof: Proof): boolean {
//   let l = hash(g, proof.y, proof.challenge.nonce, DST)!;
//   if (l.and(1).eq(0)) {
//     l = l.add(1);
//   }
//   if (!l.eq(proof.challenge.l)) {
//     return false;
//   }
//   if (!isProbablePrime(l)) {
//     return false;
//   }
//
//   const T = newE(1).shl(t);
//   const u1 = exp(proof.pi, proof.challenge.l);
//   const u2 = exp(g, T);
//   return mulE(u1, u2).eq(proof.y);
// }
//
// // const g = randE();
// // const t = 4;
// // const proof = evaluate(g, t);
// // console.log('must verify', verify(g, t, proof));
