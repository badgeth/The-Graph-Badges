import { BigInt, ethereum } from "@graphprotocol/graph-ts/index";
import { process28DaysLaterBadgesForEra } from "../Badges/28DaysLater";
import { processNeverSlashedBadgesForEra } from "../Badges/neverSlashed";
import { createOrLoadEntityStats } from "./models";
import { toBigInt } from "./typeConverter";

export function epochToEra(epoch: BigInt): BigInt {
  return epoch.div(toBigInt(28));
}

export function transitionToNewEraIfNeeded(
  epoch: BigInt,
  block: ethereum.Block
): void {
  let entityStats = createOrLoadEntityStats();
  let era = epochToEra(epoch);
  if (era.gt(entityStats.lastEraProcessed)) {
    process28DaysLaterBadgesForEra(entityStats.lastEraProcessed, block);
    processNeverSlashedBadgesForEra(entityStats.lastEraProcessed, block);

    entityStats.lastEraProcessed = era;
    entityStats.save();
  }
}
