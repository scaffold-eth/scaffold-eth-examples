import * as sst from "@serverless-stack/resources";

import DynamoDBStack from "./DynamoDBStack";

export default function main(app: sst.App): void {
  new DynamoDBStack(app, "dynamodb");
}
