export default function parseSolidityCalldata(prf, sgn) {
  // let i = [];
  // while (i[i.length-1] != -1) {
  //    i.push(str.indexOf('"', i[i.length-1]+1));
  // }
  // i.pop();
  // let data = [];
  // for (let j = 0; j<i.length-1; j+=2) {
  //   data.push(str.slice(i[j]+1, i[j+1]));
  // }
  // let calldata = [
  //   [data[0].slice(2), data[1].slice(2)],
  //   [
  //     [data[2].slice(2), data[3].slice(2)],
  //     [data[4].slice(2), data[5].slice(2)]
  //   ],
  //   [data[6].slice(2), data[7].slice(2)],
  //   [data[8].slice(2), data[9].slice(2)]
  // ];

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
