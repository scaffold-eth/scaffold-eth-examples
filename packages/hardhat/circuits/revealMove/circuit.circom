include "../../node_modules/circomlib/circuits/poseidon.circom";

template Main() {
  signal input posHash;
  signal private input x1;
  signal private input y1

  signal output out;

  component hash = Poseidon(2);
  hash.inputs[0] <== x1;
  hash.inputs[1] <== y1;

  posHash === hash.out;
}

component main = Main();
