import { BigInt } from '@graphprotocol/graph-ts'

import {
  Approval,
} from '../generated/veNFTCollateral/veNFTCollateral'
import { Person } from '../generated/schema'

export function handleApproval(event: Approval): void {
  const spender = event.params.spender.toHexString()

  let person = Person.load(spender)
  if (person === null) {
    person = new Person(spender)
    person.allowance = event.params.value.plus(BigInt.fromI32(0))
  } else {
    person.allowance = person.allowance.plus(event.params.value)
  }

  person.save()
}