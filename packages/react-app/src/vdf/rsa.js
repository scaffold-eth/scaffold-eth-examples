"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exp = exports.addE = exports.find_q = exports.mulE = exports.toBytes = exports.to512Bytes = exports.to256Bytes = exports.newE = exports.randBigNumber = exports.randE = exports.RSA_MODULUS_BYTES = exports.RSA_MODULUS = void 0;
const bignumber_1 = require("@ethersproject/bignumber");
const bytes_1 = require("@ethersproject/bytes");
const random_1 = require("@ethersproject/random");
const bn_js_1 = __importDefault(require("bn.js"));
const RSA_MODULUS_STR = '25195908475657893494027183240048398571429282126204032027777137836043662020707595556264018525880784406918290641249515082189298559149176184502808489120072844992687392807287776735971418347270261896375014971824691165077613379859095700097330459748808428401797429100642458691817195118746121515172654632282216869987549182422433637259085141865462043576798423387184774447920739934236584823824281198163815010674810451660377306056201619676256133844143603833904414952634432190114657544454178424020924616515723350778707749817125772467962926386356373289912154831438167899885040445364023527381951378636564391212010397122822120720357';
exports.RSA_MODULUS = bignumber_1.BigNumber.from(RSA_MODULUS_STR);
exports.RSA_MODULUS_BYTES = to256Bytes(exports.RSA_MODULUS);
function randE(n = 256) {
    return bignumber_1.BigNumber.from(random_1.randomBytes(n)).mod(exports.RSA_MODULUS);
}
exports.randE = randE;
function randBigNumber(n) {
    return bignumber_1.BigNumber.from(random_1.randomBytes(32));
}
exports.randBigNumber = randBigNumber;
function newE(n = 0) {
    return bignumber_1.BigNumber.from(n);
}
exports.newE = newE;
function to256Bytes(input) {
    return bytes_1.hexlify(bytes_1.zeroPad(input.toHexString(), 256));
}
exports.to256Bytes = to256Bytes;
function to512Bytes(input) {
    return bytes_1.hexlify(bytes_1.zeroPad(input.toHexString(), 512));
}
exports.to512Bytes = to512Bytes;
function toBytes(input, n) {
    return bytes_1.hexlify(bytes_1.zeroPad(input.toHexString(), n));
}
exports.toBytes = toBytes;
function mulE(a, b, modulus = exports.RSA_MODULUS) {
    return a.mul(b).mod(modulus);
}
exports.mulE = mulE;
function find_q(a, b, modulus = exports.RSA_MODULUS) {
    return a.mul(b).div(modulus);
}
exports.find_q = find_q;
function addE(a, b, modulus = exports.RSA_MODULUS) {
    return a.add(b).mod(modulus);
}
exports.addE = addE;
function exp(a, e, modulus = exports.RSA_MODULUS) {
    const ctx = bn_js_1.default.red(new bn_js_1.default(modulus.toString()));
    const aBN = new bn_js_1.default(a.toString());
    const eBN = new bn_js_1.default(e.toString());
    let redBN = aBN.toRed(ctx);
    redBN = redBN.redPow(eBN);
    const resBN = redBN.fromRed();
    return bignumber_1.BigNumber.from(resBN.toString());
}
exports.exp = exp;
