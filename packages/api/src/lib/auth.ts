import { utils } from 'ethers'
import { sign } from 'jsonwebtoken'

const JWT_EXPIRATION_TIME = process.env.JWT_EXPIRATION_TIME

import {
  createProfile,
  getNonce,
  updateNonce,
} from '../models/scaffoldFunctions'

const recoverSignature = (nonce: string, signature: string) => {
  const msg = `LET ME IN!!! ${nonce}`

  const address = utils.verifyMessage(msg, signature)

  return address
}

export const authenticate = async (
  publicAddress: string,
  signature: string
) => {
  const nonce = await getNonce({ publicAddress })
  if (!nonce) throw new Error('User not found')
  // Update nonce so signature can't be replayed
  await updateNonce({ publicAddress })

  const recoveredAddress = recoverSignature(nonce, signature)

  if (recoveredAddress.toLowerCase() === publicAddress.toLowerCase()) {
    const token = sign({ publicAddress }, process.env.JWT_SECRET, {
      expiresIn: JWT_EXPIRATION_TIME,
    })
    return token
  } else {
    throw new Error('bad signature')
  }
}

export const getAuthenticationChallenge = async (publicAddress: string) => {
  let nonce

  nonce = await getNonce({ publicAddress })
  console.log({ nonce })

  if (!nonce) {
    await createProfile({ publicAddress })
  }

  nonce = await updateNonce({ publicAddress })
  return nonce
}
