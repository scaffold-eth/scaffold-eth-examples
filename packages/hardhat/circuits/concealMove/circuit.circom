include "../../node_modules/circomlib/circuits/poseidon.circom";
include "../../node_modules/circomlib/circuits/comparators.circom";

template Main() {
  signal input x1;
  signal input y1;
  signal private input x2;
  signal private input y2;

  signal output out;

  component ltoe[2];
  ltoe[0] = LessEqThan(128);
  ltoe[0].in[0] <== x2;
  ltoe[0].in[1] <== x1 + 2;
  ltoe[0].out === 1;

  ltoe[1] = LessEqThan(128);
  ltoe[1].in[0] <== y2;
  ltoe[1].in[1] <== y1 + 2;
  ltoe[1].out === 1;

  component gtoe[2];
  gtoe[0] = GreaterEqThan(128);
  gtoe[0].in[0] <== x2;
  gtoe[0].in[1] <== x1 - 2;
  gtoe[0].out === 1;

  gtoe[1] = GreaterEqThan(128);
  gtoe[1].in[0] <== y2;
  gtoe[1].in[1] <== y1 - 2;
  gtoe[1].out === 1;

  component hash = Poseidon(2);
  hash.inputs[0] <== x2;
  hash.inputs[1] <== y2;

  out <== hash.out;
}

component main = Main();
