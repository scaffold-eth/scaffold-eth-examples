export default function parseSolidityCalldata(prf, sgn) {

  let calldata = [
    [prf.pi_a[0], prf.pi_a[1]],
    [
      [prf.pi_b[0][1], prf.pi_b[0][0]],
      [prf.pi_b[1][1], prf.pi_b[1][0]]
    ],
    [prf.pi_c[0], prf.pi_c[1]],
    [...sgn]
  ];

  return calldata;
}
