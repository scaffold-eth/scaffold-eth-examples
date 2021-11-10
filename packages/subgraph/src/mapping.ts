import { BigInt, Address, ipfs, json, JSONValueKind, log } from "@graphprotocol/graph-ts"
import {
  NiftyInk,
  newInk
} from "../generated/NiftyInk/NiftyInk"
import { Ink, Artist, DayTotal } from "../generated/schema"

function incrementTotal(metric: String, timestamp: BigInt): void {

    let day = (timestamp / BigInt.fromI32(86400)) * BigInt.fromI32(86400)
    let stats = DayTotal.load(day.toString())

    if (stats == null) {
      stats = new DayTotal(day.toString())
    }

    if(metric == 'inks') {
      stats.inks = stats.inks + BigInt.fromI32(1)
    }
    else if (metric == 'artists') {
      stats.artists = stats.artists + BigInt.fromI32(1)
    }

    stats.save()
  }

export function handlenewInk(event: newInk): void {

  let artist = Artist.load(event.params.artist.toHexString())

  if (artist == null) {
    artist = new Artist(event.params.artist.toHexString())
    artist.address = event.params.artist
    artist.inkCount = BigInt.fromI32(1)
    incrementTotal('artists',event.block.timestamp)
  }
  else {
    artist.inkCount = artist.inkCount.plus(BigInt.fromI32(1))
  }

  let ink = Ink.load(event.params.inkUrl)

  if (ink == null) {
    ink = new Ink(event.params.inkUrl)
  }

  ink.inkNumber = event.params.id
  ink.artist = artist.id
  ink.limit = event.params.limit
  ink.jsonUrl = event.params.jsonUrl
  ink.createdAt = event.block.timestamp

  ink.save()
  artist.save()
  incrementTotal('inks',event.block.timestamp)

}
