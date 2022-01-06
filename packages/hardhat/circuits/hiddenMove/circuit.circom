include "../../node_modules/circomlib/circuits/poseidon.circom";

template Main() {
  signal input posHash;
  signal private input x1;
  signal private input y1;
  signal private input x2;
  signal private input y2;

  signal output out;

  component hash[2]
  hash[0] = Poseidon(2);
  hash[0].inputs[0] <== x1;
  hash[0].inputs[1] <== y1;

  hash[0].out === posHash;

  hash[1] = Poseidon(2);
  hash[1].inputs[0] <== x2;
  hash[1].inputs[1] <== y2;

  out <== hash[1].out;
}

component main = Main();
