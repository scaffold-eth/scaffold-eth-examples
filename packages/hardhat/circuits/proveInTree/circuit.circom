include "../../node_modules/circomlib/circuits/smt/smtverifier.circom";

template proveInTree(nLevels) {
  signal input root;
  signal private input key;
  signal private input value;
  signal private input siblings[nLevels];

  component tree = SMTVerifier(nLevels);
  tree.enabled <== 1;
  tree.root <== root;
  for (var i=0; i<nLevels; i++) tree.siblings[i] <== siblings[i];
  tree.oldKey <== 0;
  tree.oldValue <== 0;
  tree.isOld0 <== 0;
  tree.key <== key;
  tree.value <== value;
  tree.fnc <== 0;
}

component main = proveInTree(3);
