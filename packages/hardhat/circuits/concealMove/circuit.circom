include "../../node_modules/circomlib/circuits/poseidon.circom";

template Main() {
  signal input x1;
  signal input y1
  signal private input x2;
  signal private input y2;

  signal output out;

  component hash = Poseidon(2);
  hash.inputs[0] <== x2;
  hash.inputs[1] <== y2;

  out <== hash.out;
}

component main = Main();
