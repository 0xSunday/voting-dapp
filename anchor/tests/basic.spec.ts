import { BankrunProvider, startAnchor } from "anchor-bankrun";
import { Voting } from "anchor/target/types/voting";
const IDL = require("../target/idl/voting.json");

import { Keypair, PublicKey } from "@solana/web3.js";
import { BN, Program } from "@coral-xyz/anchor";
import { publicKey } from "@coral-xyz/anchor/dist/cjs/utils";
import { buffer } from "stream/consumers";

// import * as anchor from "@coral-xyz/anchor";
// import { Program } from '@coral-xyz/anchor';
// import { Basic } from "../target/types/basic";
// import { Puppet } from "./anchor-example/puppet";

const votingAddress = new PublicKey(
  "6z68wfurCMYkZG51s1Et9BJEd9nJGUusjHXNt4dGbNNF"
);

describe("Voting", () => {
  it("initilize poll", async () => {
    const context = await startAnchor(
      "",
      [{ name: "voting", programId: votingAddress }],
      []
    );
    const provider = new BankrunProvider(context);

    const votingProgram = new Program<Voting>(IDL, provider);

    await votingProgram.methods
      .initializePoll(
        new BN(1),
        "what is your favorate crypto currency ?",
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
    expect(poll.description).toEqual("what is your favorate crypto currency ?");
    expect(poll.pollStart.toNumber()).toBeLessThan(poll.pollEnd.toNumber());
  });
});
