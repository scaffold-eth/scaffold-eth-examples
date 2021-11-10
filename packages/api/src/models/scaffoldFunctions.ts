import { DynamoDB } from 'aws-sdk'
import { randomBytes } from 'crypto'

const client = new DynamoDB()
const documentClient = new DynamoDB.DocumentClient({ service: client })

const generateNonce = async () => {
  const buffer = await randomBytes(16)
  return buffer.toString('hex')
}

const tableName = process.env.DYNAMODB_TABLE

// Merchant Profiles
interface CreateProfileParams {
  publicAddress: string
}

export const createProfile = async (params: CreateProfileParams) => {
  const queryParams: DynamoDB.DocumentClient.PutItemInput = {
    TableName: tableName,
    Item: {
      PK: `USER#${params.publicAddress}`,
      SK: `#PROFILE#${params.publicAddress}`,
      CreatedAt: new Date().toISOString(),
      Nonce: await generateNonce(),
    },
  }

  return documentClient
    .put(queryParams)
    .promise()
    .then((data) => data)
}

export const getNonce = (params: { publicAddress: string }) => {
  const queryParams: DynamoDB.DocumentClient.GetItemInput = {
    TableName: tableName,
    Key: {
      PK: `USER#${params.publicAddress}`,
      SK: `#PROFILE#${params.publicAddress}`,
    },
    ProjectionExpression: 'Nonce',
  }
  console.log({ queryParams })
  return documentClient
    .get(queryParams)
    .promise()
    .then((data) => data.Item?.Nonce)
}

export const updateNonce = async (params: { publicAddress: string }) => {
  const newNonce = await generateNonce()
  const queryParams: DynamoDB.DocumentClient.UpdateItemInput = {
    TableName: tableName,
    Key: {
      PK: `USER#${params.publicAddress}`,
      SK: `#PROFILE#${params.publicAddress}`,
    },
    UpdateExpression: 'set Nonce = :n',
    ExpressionAttributeValues: {
      ':n': newNonce,
    },
    ReturnValues: 'UPDATED_NEW',
  }
  console.log({ queryParams })
  return documentClient
    .update(queryParams)
    .promise()
    .then((data) => data.Attributes.Nonce)
}
