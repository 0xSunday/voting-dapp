import { BankrunProvider, startAnchor } from "anchor-bankrun";
import { Voting } from "anchor/target/types/voting";
const IDL = require("../target/idl/voting.json");

import { Keypair, PublicKey } from "@solana/web3.js";
import { BN, Program } from "@coral-xyz/anchor";

const votingAddress = new PublicKey(
  "6z68wfurCMYkZG51s1Et9BJEd9nJGUusjHXNt4dGbNNF"
);

describe("Voting", () => {
  let context;
  let provider;
  let votingProgram: Program<Voting>;

  beforeAll(async () => {
    context = await startAnchor(
      "",
      [{ name: "voting", programId: votingAddress }],
      []
    );
    provider = new BankrunProvider(context);

    votingProgram = new Program<Voting>(IDL, provider);
  });

  it("initialize poll", async () => {
    await votingProgram.methods
      .initializePoll(
        new BN(1),
        "what is your favorite crypto currency?",
        new BN(0),
        new BN(1738255057)
      )
      .rpc();

    const [pollAddress] = PublicKey.findProgramAddressSync(
      [new BN(1).toArrayLike(Buffer, "le", 8)],
      votingAddress
    );

    const poll = await votingProgram.account.poll.fetch(pollAddress);
    console.log(poll);

    expect(poll.pollId.toNumber()).toEqual(1);
    expect(poll.description).toEqual("what is your favorite crypto currency?");
    expect(poll.pollStart.toNumber()).toBeLessThan(poll.pollEnd.toNumber());
  });

  it("initialize candidate", async () => {
    const candidateName = "Ethereum";
    const [candidateAddress] = PublicKey.findProgramAddressSync(
      [new BN(1).toArrayLike(Buffer, "le", 8), Buffer.from(candidateName)],
      votingAddress
    );

    try {
      await votingProgram.account.candidate.fetch(candidateAddress);
      console.log("Candidate already exists, skipping initialization.");
    } catch (error) {
      console.log("Candidate does not exist, initializing...");
      await votingProgram.methods
        .initializeCandidate(candidateName, new BN(1))
        .rpc();
    }

    const candidate = await votingProgram.account.candidate.fetch(
      candidateAddress
    );
    console.log(candidate);
    expect(candidate.candidateVotes.toNumber()).toEqual(0);
  });

  it("vote", async () => {
    const candidateName = "Solana";
    const [candidateAddress] = PublicKey.findProgramAddressSync(
      [new BN(1).toArrayLike(Buffer, "le", 8), Buffer.from(candidateName)],
      votingAddress
    );

    try {
      await votingProgram.account.candidate.fetch(candidateAddress);
      console.log("Candidate already exists, skipping initialization.");
    } catch (error) {
      console.log("Candidate does not exist, initializing...");
      await votingProgram.methods
        .initializeCandidate(candidateName, new BN(1))
        .rpc();
    }

    await votingProgram.methods.vote(candidateName, new BN(1)).rpc();

    const candidate = await votingProgram.account.candidate.fetch(
      candidateAddress
    );
    console.log(candidate);
    expect(candidate.candidateVotes.toNumber()).toEqual(1);
  });
});