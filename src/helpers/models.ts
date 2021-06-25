import { BigDecimal, BigInt } from "@graphprotocol/graph-ts/index";
import {
  Allocation,
  BadgeDetail,
  DelegatedStake,
  DelegationNationBadge,
  DelegationStreakBadge,
  Delegator,
  DelegatorCount,
  EntityStats,
  FirstToCloseBadge,
  Indexer,
  IndexerCount,
  IndexerEra,
  NeverSlashedBadge,
  TwentyEightEpochsLaterBadge,
  Voter
} from "../../generated/schema";
import { 
  zeroBD,
  BADGE_NAME_DELEGATION_STREAK, 
  BADGE_TAGLINE_DELEGATION_STREAK, 
  BADGE_DESCRIPTION_DELEGATION_STREAK, 
  BADGE_NAME_DELEGATION_NATION, 
  BADGE_DESCRIPTION_DELEGATION_NATION, 
  BADGE_TAGLINE_DELEGATION_NATION,
  BADGE_NAME_NEVER_SLASHED,
  BADGE_DESCRIPTION_NEVER_SLASHED,
  BADGE_TAGLINE_NEVER_SLASHED,
  BADGE_NAME_28_EPOCHS_LATER,
  BADGE_DESCRIPTION_28_EPOCHS_LATER,
  BADGE_TAGLINE_28_EPOCHS_LATER,
  BADGE_NAME_FIRST_TO_CLOSE,
  BADGE_DESCRIPTION_FIRST_TO_CLOSE,
  BADGE_TAGLINE_FIRST_TO_CLOSE, 
  BADGE_VOTE_WEIGHT_FIRST_TO_CLOSE, 
  BADGE_VOTE_WEIGHT_DELEGATION_STREAK, 
  BADGE_VOTE_WEIGHT_DELEGATION_NATION, 
  BADGE_VOTE_WEIGHT_NEVER_SLASHED, 
  BADGE_VOTE_WEIGHT_28_EPOCHS_LATER
} from "./constants";
import { toBigInt } from "./typeConverter";

export function createOrLoadEntityStats(): EntityStats {
  let entityStats = EntityStats.load("1");

  if (entityStats == null) {
    entityStats = new EntityStats("1");
    entityStats.indexerCount = 0;
    entityStats.delegatorCount = 0;
    entityStats.firstToCloseBadgeCount = 0;
    entityStats.twentyEightDaysLaterBadgeCount = 0;
    entityStats.lastEraProcessed = toBigInt(0);
    entityStats.save();
  }

  return entityStats as EntityStats;
}

export function createOrLoadIndexer(id: string): Indexer {
  let indexer = Indexer.load(id);

  if (indexer == null) {
    indexer = new Indexer(id);
    indexer.ineligibleTwentyEightEpochsLaterBadgeCount = 0;
    indexer.isClosingAllocationLateCount = 0;
    indexer.twentyEightEpochsLaterBadgePercentage = zeroBD();
    indexer.save();

    let entityStats = createOrLoadEntityStats();
    let indexerCount = entityStats.indexerCount + 1;
    entityStats.indexerCount = indexerCount;
    entityStats.save();

    createOrLoadIndexerCount(indexerCount.toString(), indexer.id);
  }

  return indexer as Indexer;
}

export function createOrLoadDelegator(id: string): Delegator {
  let delegator = Delegator.load(id);

  if (delegator == null) {
    delegator = new Delegator(id);
    delegator.uniqueDelegationCount = 0;
    delegator.uniqueActiveDelegationCount = 0;
    delegator.streakStartBlockNumber = toBigInt(-1);
    delegator.save();

    let entityStats = createOrLoadEntityStats();
    let delegatorCount = entityStats.delegatorCount + 1;
    entityStats.delegatorCount = delegatorCount;
    entityStats.save();

    createOrLoadDelegatorCount(delegatorCount.toString(), delegator.id);
  }

  return delegator as Delegator;
}

export function createOrLoadIndexerCount(
  id: string,
  indexer: string
): IndexerCount {
  let indexerCount = IndexerCount.load(id);

  if (indexerCount == null) {
    indexerCount = new IndexerCount(id);
    indexerCount.indexer = indexer;
    indexerCount.save();
  }

  return indexerCount as IndexerCount;
}

function createOrLoadDelegatorCount(
  id: string,
  delegator: string
): DelegatorCount {
  let delegatorCount = DelegatorCount.load(id);

  if (delegatorCount == null) {
    delegatorCount = new DelegatorCount(id);
    delegatorCount.delegator = delegator;
    delegatorCount.save();
  }

  return delegatorCount as DelegatorCount;
}

export function createOrLoadIndexerEra(
  indexerID: string,
  era: BigInt
): IndexerEra {
  let id = indexerID.concat("-").concat(era.toString());
  let indexerEra = IndexerEra.load(id);

  if (indexerEra == null) {
    indexerEra = new IndexerEra(id);
    indexerEra.era = era;
    indexerEra.indexer = indexerID;
    indexerEra.isClosingAllocationLate = false;
    indexerEra.isSlashed = false;
    indexerEra.save();
  }

  return indexerEra as IndexerEra;
}

export function createOrLoadDelegatedStake(
  delegatorId: string,
  indexerId: string
): DelegatedStake {
  let id = delegatorId.concat("-").concat(indexerId);
  let delegatedStake = DelegatedStake.load(id);

  if (delegatedStake == null) {
    delegatedStake = new DelegatedStake(id);
    delegatedStake.delegator = delegatorId;
    delegatedStake.indexer = indexerId;
    delegatedStake.shares = toBigInt(0);
    delegatedStake.save();
  }

  return delegatedStake as DelegatedStake;
}

export function delegatedStakeExists(
  delegatorId: string,
  indexerId: string
): boolean {
  let id = delegatorId.concat("-").concat(indexerId);
  let delegatedStake = DelegatedStake.load(id);
  return delegatedStake != null;
}

export function createAllocation(
  allocationID: string,
  indexerID: string,
  epochCreated: BigInt
): void {
  if (Allocation.load(allocationID) == null) {
    let allocation = new Allocation(allocationID);
    allocation.createdAtEpoch = epochCreated;
    allocation.indexer = indexerID;

    allocation.save();
  }
}

export function addVotingPower(
  voterId: string,
  votingPower: BigDecimal
): void {
  if (votingPower.equals(zeroBD())) {
    return;
  }

  let voter = Voter.load(voterId);
  if (voter == null) {
    voter = new Voter(voterId);
    voter.votingPower = votingPower;
  }
  else {
    voter.votingPower = voter.votingPower.plus(votingPower);
  }
}

export function create28EpochsLaterBadge(
  indexerID: string,
  era: BigInt
): TwentyEightEpochsLaterBadge {
  let badgeID = indexerID.concat("-").concat(era.toString());
  let badgeDetail = createOrLoadBadgeDetail(
    BADGE_NAME_28_EPOCHS_LATER,
    BADGE_DESCRIPTION_28_EPOCHS_LATER,
    BADGE_TAGLINE_28_EPOCHS_LATER,
    BigDecimal.fromString(BADGE_VOTE_WEIGHT_28_EPOCHS_LATER),
    "NFT_GOES_HERE"
  );


  let twentyEightEpochsLater = new TwentyEightEpochsLaterBadge(badgeID);
  twentyEightEpochsLater.indexer = indexerID;
  twentyEightEpochsLater.eraAwarded = era;
  twentyEightEpochsLater.badgeDetail = badgeDetail.id;
  twentyEightEpochsLater.save();
  addVotingPower(indexerID, badgeDetail.votingWeightMultiplier);

  return twentyEightEpochsLater as TwentyEightEpochsLaterBadge;
}

export function createNeverSlashedBadge(
  indexerID: string,
  currentEra: BigInt
): NeverSlashedBadge {
  let badgeID = indexerID.concat("-").concat(currentEra.toString());
  let badgeDetail = createOrLoadBadgeDetail(
    BADGE_NAME_NEVER_SLASHED,
    BADGE_DESCRIPTION_NEVER_SLASHED,
    BADGE_TAGLINE_NEVER_SLASHED,
    BigDecimal.fromString(BADGE_VOTE_WEIGHT_NEVER_SLASHED),
    "NFT_GOES_HERE"
  );

  let neverSlashedBadge = new NeverSlashedBadge(badgeID);
  neverSlashedBadge.indexer = indexerID;
  neverSlashedBadge.eraAwarded = currentEra;
  neverSlashedBadge.badgeDetail = badgeDetail.id;
  neverSlashedBadge.save();
  addVotingPower(indexerID, badgeDetail.votingWeightMultiplier);

  return neverSlashedBadge as NeverSlashedBadge;
}

export function createDelegationNationBadge(delegator: Delegator, blockNumber: BigInt): void {
  let badgeDetail = createOrLoadBadgeDetail(
    BADGE_NAME_DELEGATION_NATION,
    BADGE_DESCRIPTION_DELEGATION_NATION,
    BADGE_TAGLINE_DELEGATION_NATION,
    BigDecimal.fromString(BADGE_VOTE_WEIGHT_DELEGATION_NATION),
    "NFT_GOES_HERE"
  );
  let delegationNationBadge = new DelegationNationBadge(delegator.id);
  delegationNationBadge.delegator = delegator.id;
  delegationNationBadge.blockAwarded = blockNumber;
  delegationNationBadge.badgeDetail = badgeDetail.id;

  delegationNationBadge.save();
  addVotingPower(delegator.id, badgeDetail.votingWeightMultiplier);
}

export function createOrLoadDelegationStreakBadge(delegator: Delegator, startBlockNumber: BigInt): DelegationStreakBadge {
  let badgeDetail = createOrLoadBadgeDetail(
    BADGE_NAME_DELEGATION_STREAK,
    BADGE_DESCRIPTION_DELEGATION_STREAK,
    BADGE_TAGLINE_DELEGATION_STREAK,
    BigDecimal.fromString(BADGE_VOTE_WEIGHT_DELEGATION_STREAK),
    "NFT_GOES_HERE"
  );
  let badgeId = delegator.id.concat(startBlockNumber.toString());
  let badge = DelegationStreakBadge.load(badgeId);
  if (badge == null) {
    badge = new DelegationStreakBadge(badgeId);
    badge.delegator = delegator.id;
    badge.startBlockNumber = startBlockNumber;
    badge.lastCheckpointBlockNumber = startBlockNumber;
    badge.blockAwarded = toBigInt(-1);
    badge.badgeDetail = badgeDetail.id;
    badge.save();
  }
  return badge as DelegationStreakBadge;
}


export function createFirstToCloseBadge(
  subgraphDeploymentID: string,
  indexer: string
): void {
  let entityStats = createOrLoadEntityStats();
  let firstToClose = FirstToCloseBadge.load(subgraphDeploymentID);
  let badgeDetail = createOrLoadBadgeDetail(
    BADGE_NAME_FIRST_TO_CLOSE,
    BADGE_DESCRIPTION_FIRST_TO_CLOSE,
    BADGE_TAGLINE_FIRST_TO_CLOSE,
    BigDecimal.fromString(BADGE_VOTE_WEIGHT_FIRST_TO_CLOSE),
    "NFT_GOES_HERE"
  );
  if (firstToClose == null) {
    // FirstToCloseBadge hasn't been awarded for this subgraphDeploymentId yet
    // Award to this indexer
    firstToClose = new FirstToCloseBadge(subgraphDeploymentID);
    firstToClose.indexer = indexer;
    firstToClose.eraAwarded = entityStats.lastEraProcessed;
    firstToClose.badgeDetail = badgeDetail.id;
    firstToClose.save();

    entityStats.firstToCloseBadgeCount = entityStats.firstToCloseBadgeCount + 1;
    entityStats.save();

    addVotingPower(indexer, badgeDetail.votingWeightMultiplier);
  }
}

export function createOrLoadBadgeDetail(
  name: string,
  description: string,
  tagline: string,
  voteWeight: BigDecimal,
  image: string
): BadgeDetail {
  let badgeDetail = BadgeDetail.load(name);

  if (badgeDetail == null) {
    badgeDetail = new BadgeDetail(name);
    badgeDetail.description = description;
    badgeDetail.tagline = tagline;
    badgeDetail.image = image;
    badgeDetail.votingWeightMultiplier = voteWeight;
    badgeDetail.save();
  }

  return badgeDetail as BadgeDetail;
}
