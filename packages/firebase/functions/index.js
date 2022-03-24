const functions = require("firebase-functions");
const admin = require("firebase-admin");
const ethers = require("ethers");
const yup = require("yup");
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

  const schema = yup.object().shape({
    name: yup.string().min("5"),
    description: yup.string().min("10"),
    accessControl: yup.string().matches(/(anyone|allowList)/),
    approvedContributors: yup
      .array()
      .min(value.accessControl === "allowList" ? 1 : 0),
    createdAt: yup
      .number()
      .min(Date.now() - 2 * 60 * 1000)
      .max(Date.now()), // within the past 2 minutes
  });

  schema.validateSync(value);

  const recovered = handleRecovery(
    {
      Board: [
        { name: "name", type: "string" },
        { name: "description", type: "string" },
        { name: "accessControl", type: "string" },
        { name: "approvedContributors", type: "address[]" },
        { name: "voterControl", type: "string" },
        { name: "approvedVoters", type: "address[]" },
        { name: "createdAt", type: "uint256" },
      ],
    },
    value,
    signature
  );

  if (!ethers.utils.isAddress(recovered)) {
    throw new Error("Invalid signer");
  }

  const update = Object.assign({}, value, {
    creator: recovered,
    signature,
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
  const schema = yup.object().shape({
    board: yup.string().min("5"),
    proposal: yup.string().min("5"),
    createdAt: yup
      .number()
      .min(Date.now() - 2 * 60 * 1000)
      .max(Date.now()), // within the past 2 minutes
  });

  schema.validateSync(value);

  const recovered = handleRecovery(
    {
      Proposal: [
        { name: "board", type: "string" },
        { name: "proposal", type: "string" },
        { name: "createdAt", type: "uint256" },
      ],
    },
    value,
    signature
  );

  // TODO : fetch board and check if user can contribute
  return db
    .doc(`boards/${value.board}`)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        throw new Error("This board does not exist");
      }

      const docData = doc.data();

      if (
        docData.accessControl === "anyone" ||
        (docData.accessControl === "allowList" &&
          (docData.approvedContributors.includes(recovered) ||
            docData.creator === recovered))
      ) {
        const update = Object.assign({}, value, {
          creator: recovered,
          signature,
          _createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // use recovered address to create a new board
        const doc = db.collection("proposals").doc();

        doc.set(update);

        return doc.id;
      }
    });
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

  return Promise.all([
    db.doc(`boards/${value.board}`).get(),
    db.doc(`proposals/${value.proposal}`).get(),
  ])
    .then(([board, proposal]) => {
      if (!board.exists || !proposal.exists) {
        throw new Error("This board/proposal does not exist");
      }

      const boardData = board.data();
      const {
        accessControl = "allowList",
        voterControl = "asAccessControl",
        approvedContributors = [],
        approvedVoters = [],
      } = boardData;

      const approvedActors =
        voterControl === "asAccessControl"
          ? approvedContributors
          : approvedVoters;

      if (
        accessControl !== "anyone" &&
        !approvedActors.includes(recovered) &&
        boardData.creator !== recovered
      ) {
        throw new Error("You don't have access to propose on this board");
      }
    })
    .then(() => doc.get())
    .then((resDoc) => {
      console.log({ exists: resDoc.exists, upvote: value.upvote });

      if (resDoc.exists && !value.upvote) {
        console.log("Deleting...");
        return doc.delete();
      } else if (value.upvote) {
        console.log("Creating...");
        // create the doc
        const update = Object.assign({}, value, {
          creator: recovered,
          _createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        return doc.set(update);
      }
    })
    .then(callback)
    .then(() => doc.id)
    .catch((err) => {
      console.log(err);
      throw err;
    });
});
