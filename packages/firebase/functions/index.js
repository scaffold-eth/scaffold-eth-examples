const functions = require("firebase-functions");
const admin = require("firebase-admin");
const ethers = require("ethers");
const yup = require("yup");
admin.initializeApp();

const db = admin.firestore();

const validateBalance = (address, eoa) => {
  const provider = new ethers.providers.StaticJsonRpcProvider(
    "https://rpc.scaffoldeth.io:48544"
  );

  const ABI = ["function balanceOf(address owner) view returns (uint256)"];

  const tokenContract = new ethers.Contract(address, ABI, provider);
  return tokenContract
    .balanceOf(eoa)
    .then((balance) => balance.gt(ethers.BigNumber.from("0")));
};

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

  const addressValidator = (param, expected) => (v) => {
    return param === expected ? ethers.utils.isAddress(v) : true;
  };

  const schema = yup.object().shape({
    name: yup.string().min("5"),
    description: yup.string().min("10"),
    accessControl: yup.string().matches(/(anyone|allowList|tokenHolders)/),
    voterControl: yup
      .string()
      .matches(/(asAccessControl|voterAllowList|voterTokenHolders)/),
    approvedContributors: yup
      .array()
      .min(value.accessControl !== "anyone" ? 0 : 1),
    approvedVoters: yup
      .array()
      .min(value.voterControl !== "asAccessControl" ? 0 : 1),
    contributorTokenHolders: yup
      .string()
      .test(
        "is-address",
        "${path} is not address",
        addressValidator(value.accessControl, "tokenHolders")
      ),
    voterTokenHolders: yup
      .string()
      .test(
        "is-address",
        "${path} is not address",
        addressValidator(value.voterControl, "voterTokenHolders")
      ),
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
        { name: "contributorTokenHolders", type: "address" },
        { name: "voterTokenHolders", type: "address" },
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
        docData.accessControl === "allowList" &&
        (docData.approvedContributors.includes(recovered) ||
          docData.creator === recovered)
      ) {
        return Promise.resolve(true);
      }

      if (docData.accessControl === "tokenHolders") {
        // validate if signer has this token balance > 0
        return validateBalance(docData.contributorTokenHolders, recovered);
      }

      if (docData.accessControl === "anyone") {
        // carry on, nothing to see here
        return Promise.resolve(true);
      }

      // throw error if this function doesn't exist before this line
      throw new Error("Access denied to this board");
    })
    .then(() => {
      const update = Object.assign({}, value, {
        creator: recovered,
        signature,
        _createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // use recovered address to create a new board
      const doc = db.collection("proposals").doc();

      doc.set(update);

      return doc.id;
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
        accessControl === "allowList" &&
        (approvedActors.includes(recovered) || boardData.creator === recovered)
      ) {
        return Promise.resolve(true);
      }

      if (accessControl === "tokenHolders") {
        // validate if signer has this token balance > 0
        return validateBalance(boardData.voterTokenHolders, recovered);
      }

      if (accessControl === "anyone") {
        // carry on, nothing to see here
        return Promise.resolve(true);
      }

      // throw an error if this function doesn't exit here
      throw new Error("You don't have access to propose on this board");
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
