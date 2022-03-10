const functions = require("firebase-functions");
const admin = require("firebase-admin");
const ethers = require("ethers");
admin.initializeApp();

const db = admin.firestore();

const handleRecovery = (types, value, signature) => {
  return ethers.utils.verifyTypedData(
    {
      name: "BuidlGuidl Roundtable",
      version: "0.0.1",
      chainId: 1,
      verifyingContract: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",
    },
    types,
    value,
    signature
  );
};

exports.createBoard = functions.https.onCall((data) => {
  const { signature, value } = data;

  // TODO : Validate value fields here

  const recovered = handleRecovery(
    {
      Board: [
        { name: "boardName", type: "string" },
        { name: "createdAt", type: "uint256" },
      ],
    },
    value,
    signature
  );

  const update = Object.assign({}, value, {
    creator: recovered,
    _createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // use recovered address to create a new board
  const doc = db.collection("boards").doc();

  doc.set(update);

  return doc.id;
});

exports.addNewProposal = functions.https.onCall((data) => {
  const { signature, value } = data;

  // TODO : Validate value fields here

  const recovered = handleRecovery(
    {
      Proposal: [
        { name: "board", type: "string" },
        { name: "proposal", type: "string" },
      ],
    },
    value,
    signature
  );

  const update = Object.assign({}, value, {
    creator: recovered,
    _createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // use recovered address to create a new board
  const doc = db.collection("proposals").doc();

  doc.set(update);

  return doc.id;
});

exports.upvoteProposal = functions.https.onCall((data) => {
  const { signature, value } = data;

  // TODO : Validate value fields here

  const recovered = handleRecovery(
    {
      Vote: [
        { name: "board", type: "string" },
        { name: "proposal", type: "string" },
        { name: "upvote", type: "bool" },
        { name: "createdAt", type: "uint256" },
      ],
    },
    value,
    signature
  );

  const key = `${value.board}-${value.proposal}-${recovered}`;
  const doc = db.collection("upvotes").doc(key);

  let callback = () => Promise.resolve();

  return doc
    .get()
    .then((resDoc) => {
      console.log({ exists: resDoc.exists, upvote: value.upvote });

      if (resDoc.exists && !value.upvote) {
        console.log(`Deleting...`);
        return doc.delete();
      } else if (value.upvote) {
        console.log(`Creating...`);
        // create the doc
        const update = Object.assign({}, value, {
          creator: recovered,
          _createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        return doc.set(update);
      }
    })
    .then(callback)
    .then(() => doc.id);
});
