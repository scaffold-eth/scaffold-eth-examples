import { BigInt, Address } from "@graphprotocol/graph-ts"
import {
  ProjectUpdate
} from "../generated/Projects/Projects"
import {
  QuestUpdate, QuestWork, QuestLook, QuestFinished, QuestSupport
} from "../generated/Quests/Quests"
import {
  BuilderUpdate
} from "../generated/Builders/Builders"
import {
  SupporterUpdate
} from "../generated/Supporters/Supporters"
import {
  RecipientAdded
} from "../generated/SupportRound/SupportRound"
import { Project, Owner, Quest, Author, Work, Look, Builder, Sender, Supporter, Round, Recipient } from "../generated/schema"


export function handleProjectUpdate(event: ProjectUpdate): void {

  let projectId = event.params.id.toHexString()
  let ownerId = event.params.projectOwner.toHexString()

  let project = new Project(projectId)

  project.idBytes = event.params.id
  project.title = event.params.title
  project.desc = event.params.desc
  project.repo = event.params.repo
  project.owner = ownerId
  project.timestamp = event.block.timestamp

  project.save()

  let owner = new Owner(ownerId)
  owner.save()

}

export function handleQuestUpdate(event: QuestUpdate): void {

  let questId = event.params.id.toHexString()
  let projectId = event.params.project.toHexString()
  let authorId = event.params.author.toHexString()

  let quest = new Quest(questId)

  quest.project = projectId
  quest.idBytes = event.params.id
  quest.title = event.params.title
  quest.desc = event.params.desc
  quest.link = event.params.link
  quest.author = authorId
  quest.timestamp = event.block.timestamp
  quest.save()

  let author = new Author(authorId)
  author.save()

}

export function handleQuestLook(event: QuestLook): void {

  let questId = event.params.id.toHexString()
  let builderId = event.params.builder.toHexString()

  let look = new Look(event.transaction.hash.toHex() + "-" + event.logIndex.toString())

  look.quest = questId
  look.builder = builderId
  look.timestamp = event.block.timestamp

  look.save()

  let builder = new Builder(builderId.toString())
  builder.save()


}

export function handleQuestWork(event: QuestWork): void {

  let questId = event.params.id.toHexString()
  let builderId = event.params.builder.toHexString()

  let work = new Work(event.transaction.hash.toHex() + "-" + event.logIndex.toString())

  work.quest = questId
  work.link = event.params.link
  work.builder = builderId
  work.timestamp = event.block.timestamp

  work.save()

  let builder = new Builder(builderId.toString())
  builder.save()

}

export function handleQuestFinished(event: QuestFinished): void {
  //address recipient, uint256 amount, address sender
  let questId = event.params.id.toHexString()
  let senderId = event.params.sender.toHexString()
  let recipientId = event.params.recipient.toHexString()


  let quest = Quest.load(questId)

  quest.finished = true
  quest.sender = senderId
  quest.recipient = recipientId
  quest.amount = event.params.amount

  quest.save()

  let sender = new Sender(senderId.toString())
  sender.save()
}

export function handleBuilderUpdate(event: BuilderUpdate): void {
  //BuilderUpdate( address indexed builder, bool isBuilder )
  let builderId = event.params.builder.toHexString()
  let builder = new Builder(builderId)

  builder.isActive = event.params.isBuilder
  builder.save()
}

export function handleSupporterUpdate(event: SupporterUpdate): void {
  let supporterId = event.params.supporter.toHexString()
  let supporter = new Supporter(supporterId)

  supporter.isActive = event.params.isSupporter
  supporter.save()
}

export function handleRecipientAdded(event: RecipientAdded): void {
  //RecipientAdded(address,string,uint256)
  let recipientIndex = event.params.index.toHexString()
  let recipient = new Recipient(recipientIndex)
  recipient.index = event.params.index
  recipient.addr = event.params.addr
  recipient.project = event.params.data

  recipient.save()
}



export function handleQuestSupport(event: QuestSupport): void {
  let questId = event.params.id.toHexString()
  let quest = Quest.load(questId)
  quest.support = event.params.total
  quest.save()
}
