import * as anchor from "@coral-xyz/anchor";
// import { Program } from '@coral-xyz/anchor';
import { Basic } from "../target/types/basic";

import { BankrunProvider, startAnchor } from "anchor-bankrun";
import { Keypair, PublicKey } from "@solana/web3.js";
import { BN, Program } from "@coral-xyz/anchor";
import { Voting } from "anchor/target/types/voting";
const IDL = require("../target/idl/voting.json");

// import { Puppet } from "./anchor-example/puppet";

describe("Voting", () => {
  it("initilize poll", async () => {
    
  });
});
