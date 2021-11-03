include "../../node_modules/circomlib/circuits/smt/smtprocessor.circom"

template Add2Tree(nLevels) {
  signal input root; // should be defined in contract
  signal input key;  // should be defined in contract
  signal input value;
  signal private input siblings[nLevels];

  signal output outRoot;

  component tree = SMTProcessor(nLevels);
  tree.oldRoot <== root;
  for (var i=0; i<nLevels; i++) tree.siblings[i] <== siblings[i];
  tree.oldKey <== key;
  tree.oldValue <== 0;
  tree.isOld0 <== 1;
  tree.newKey <== key;
  tree.newValue <== value;
  tree.fnc[0] <== 1;
  tree.fnc[1] <== 0;

  outRoot <== tree.newRoot;
}

component main = Add2Tree(3);
//component main = SMTProcessor(3);
