include "../../node_modules/circomlib/circuits/mimcsponge.circom";
include "../../node_modules/circomlib/circuits/smt/smtverifier.circom";
include "../../node_modules/circomlib/circuits/smt/smtprocessor.circom";
include "../../node_modules/circomlib/circuits/comparators.circom";

template Commit721Tokens(nLevels, nTokens) {

  signal input heldRoot; // defined and provided as arg in smart contract
  signal private input indices[nTokens];
  signal private input ids[nTokens];
  signal private input heldSiblings[nTokens][nLevels + 1];
  signal private input commitNewKeys[nTokens];
  signal private input commitOldKeys[nTokens];
  signal private input commitSiblings[nTokens][nLevels];

  signal output commitRoot;

  // verify token ids are held in the heldRoot
  component vTree[nTokens];
  for (var i=0; i < nTokens; i++) {
    vTree[i] = SMTVerifier(nLevels+1);
    vTree[i].enabled <== 1;
    vTree[i].root <== heldRoot;
    for (var j=0; j<nLevels+1; j++) vTree[i].siblings[j] <== heldSiblings[i][j];
    vTree[i].oldKey <== 0;
    vTree[i].oldValue <== 0;
    vTree[i].isOld0 <== 0;
    vTree[i].key <== indices[i];
    vTree[i].value <== ids[i];
    vTree[i].fnc <== 0;
  }

  signal newRoots[nTokens + 1];
  newRoots[0] <== 0;

  component cTree[nTokens];
  component rIs0[nTokens];
  for (var i=0; i < nTokens; i++) {
    rIs0[i] = IsZero();
    rIs0[i].in <== newRoots[i];

    cTree[i] = SMTProcessor(nLevels);
    cTree[i].oldRoot <== newRoots[i];
    for (var j=0; j<nLevels; j++) cTree[i].siblings[j] <== commitSiblings[i][j];
    cTree[i].oldKey <== commitOldKeys[i];
    cTree[i].oldValue <== 0; // will probably have to be input signal for more than one nTokens
    cTree[i].isOld0 <== rIs0[i].out;
    cTree[i].newKey <== commitNewKeys[i];
    cTree[i].newValue <== ids[i];
    cTree[i].fnc[0] <== 1;
    cTree[i].fnc[1] <== 0;

    newRoots[i+1] <== cTree[i].newRoot;
  }

  commitRoot <== newRoots[nTokens];

}

component main = Commit721Tokens(4, 1);
