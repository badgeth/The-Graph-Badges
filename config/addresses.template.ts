// AS compiler does not like interface
export class Addresses {
  controller: string;
  graphToken: string;
  epochManager: string;
  disputeManager: string;
  staking: string;
  curation: string;
  rewardsManager: string;
  serviceRegistry: string;
  gns: string;
  ens: string;
  ensPublicResolver: string;
  blockNumber: string;
  network: string;
  badgethDAO: string;
  snapshotAdmin1: string;
  snapshotAdmin2: string;
  graphTokenLockWalletManager1: string;
  graphTokenLockWalletManager2: string;
}

// AS compiler does not like const
export let addresses: Addresses = {
  controller: "{{controller}}",
  graphToken: "{{graphToken}}",
  epochManager: "{{epochManager}}",
  disputeManager: "{{disputeManager}}",
  staking: "{{staking}}",
  curation: "{{curation}}",
  rewardsManager: "{{rewardsManager}}",
  serviceRegistry: "{{serviceRegistry}}",
  gns: "{{gns}}",
  ens: "{{ens}}",
  ensPublicResolver: "{{ensPublicResolver}}",
  blockNumber: "{{blockNumber}}",
  network: "{{network}}",
  badgethDAO: "{{badgethDAO}}",
  snapshotAdmin1: "{{snapshotAdmin1}}",
  snapshotAdmin2: "{{snapshotAdmin2}}",
  graphTokenLockWalletManager1: "{{graphTokenLockWalletManager1}}",
  graphTokenLockWalletManager2: "{{graphTokenLockWalletManager2}}",
};
