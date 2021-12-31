include "../../node_modules/circomlib/circuits/smt/smtverifier.circom";
include "../../node_modules/circomlib/circuits/poseidon.circom";

template proveInTree(nLevels) {
  signal input root;
  signal input voteId;
  signal private input key;
  signal private input secret;
  signal private input nullifier;
  signal private input siblings[nLevels + 1];

  signal output voterHash;

  signal value;

  component poseidon[2];

  poseidon[0] = Poseidon(2);
  poseidon[0].inputs[0] <== secret;
  poseidon[0].inputs[1] <== nullifier;
  value <== poseidon[0].out;

  poseidon[1] = Poseidon(3);
  poseidon[1].inputs[0] <== voteId;
  poseidon[1].inputs[1] <== key;
  poseidon[1].inputs[2] <== nullifier;
  voterHash <== poseidon[1].out;

  component tree = SMTVerifier(nLevels + 1);
  tree.enabled <== 1;
  tree.root <== root;
  for (var i=0; i<nLevels + 1; i++) tree.siblings[i] <== siblings[i];
  tree.oldKey <== 0;
  tree.oldValue <== 0;
  tree.isOld0 <== 0;
  tree.key <== key;
  tree.value <== value;
  tree.fnc <== 0;
}

component main = proveInTree(3);
