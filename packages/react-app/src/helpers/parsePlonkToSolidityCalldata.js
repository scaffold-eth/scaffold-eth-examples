const snarkjs = require("snarkjs");
const ffjavascript = require('ffjavascript');
const unstringifyBigInts = ffjavascript.utils.unstringifyBigInts;

export default async function parseSolidityCalldata(prf, sgn) {

  let calldata = await snarkjs.plonk.exportSolidityCallData(unstringifyBigInts(prf), unstringifyBigInts(sgn));

  const calldataSplit = calldata.split(',')
  const proofFormatted = calldataSplit[0];

  calldata = [
    proofFormatted,
    sgn
  ];
  // console.log("calldata:", calldata);
  return calldata;
}
