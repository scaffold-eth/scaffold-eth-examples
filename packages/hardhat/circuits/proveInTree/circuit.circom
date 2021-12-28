include "../../node_modules/circomlib/circuits/smt/smtverifier.circom";
include "../../node_modules/circomlib/circuits/poseidon.circom";

template proveInTree(nLevels) {
  signal input root;
  signal private input key;
  signal private input secret;
  signal private input nullifier;
  signal private input siblings[nLevels + 1];

  signal value;
  component poseidon = Poseidon(2);
  poseidon.inputs[0] <== secret;
  poseidon.inputs[1] <== nullifier;
  value <== poseidon.out;

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
