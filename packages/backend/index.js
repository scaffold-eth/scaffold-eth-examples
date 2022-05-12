const ethers = require("ethers");
const express = require("express");
const fs = require("fs");
const https = require("https");
const cors = require("cors");
const bodyParser = require("body-parser");
const yup = require("yup");
const utils = require("./utils");
const app = express();

const cache = {};

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", function (req, res) {
  console.log("/");
  res.status(200).send("Hello backend");
});

app.post("/", async function (req, res) {
  const { signature, tokenAddress, value } = req.body;

  const schema = yup.object().shape({
    owner: yup.string().min("40"),
    tokenId: yup.number().min(1),
  });

  schema.validateSync(value);

  const recovered = utils.handleRecovery(
    {
      Checkin: [
        { name: "owner", type: "address" },
        { name: "tokenId", type: "uint256" },
      ],
    },
    value,
    signature
  );

  if (!ethers.utils.isAddress(recovered)) {
    return res.json({ message: "Invalid ticket signer address" });
  }

  return utils
    .validateTokenOwner(tokenAddress, value.tokenId, recovered)
    .then((isOwner) => {
      if (!isOwner) {
        throw new Error("You don't own this ticket");
      }

      if (cache[value.tokenId]) {
        throw new Error("This ticket has been used for admission");
      }

      const update = Object.assign({}, value, {
        signature,
        _createdAt: Date.now(),
      });

      cache[value.tokenId] = update;

      return res.json({ message: "Admission successful" });
    })
    .catch((err) => {
      console.log(err);

      return res.status(400).json({ message: err.message });
    });
});

if (fs.existsSync("server.key") && fs.existsSync("server.cert")) {
  https
    .createServer(
      {
        key: fs.readFileSync("server.key"),
        cert: fs.readFileSync("server.cert"),
      },
      app
    )
    .listen(49832, () => {
      console.log("HTTPS Listening: 49832");
    });
} else {
  var server = app.listen(49832, function () {
    console.log("HTTP Listening on port:", server.address().port);
  });
}
