import { Program } from "@coral-xyz/anchor";
import { publicKey } from "@coral-xyz/anchor/dist/cjs/utils";
import {
  ActionGetResponse,
  ActionPostRequest,
  ACTIONS_CORS_HEADERS,
  createPostResponse,
} from "@solana/actions";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";

const IDL = require("@/../anchor/target/idl/voting.json");
import { Voting } from "anchor/target/types/voting";
import { BN } from "bn.js";

export const OPTIONS = GET;
export async function GET(request: Request) {
  const actionMetadata: ActionGetResponse = {
    icon: "https://cryptodaily.blob.core.windows.net/space/IMAGE%202023-12-16%2016%3A22%3A15.jpg",
    title: "vote for your favorite chain !",
    description: "vote between Ethereum or Solana ",
    label: "Vote",
    links: {
      actions: [
        {
          label: "Vote for Ethereum",
          href: "/api/vote?candidate=Ethereum",
          type: "external-link",
        },
        {
          label: "Vote for Solana",
          href: "/api/vote?candidate=Solana",
          type: "external-link",
        },
      ],
    },
  };
  return Response.json(actionMetadata, { headers: ACTIONS_CORS_HEADERS });
}

export async function POSt(request: Request) {
  const url = new URL(request.url);
  const candidate = url.searchParams.get("candidate");

  if (candidate != "Ethereum" && candidate != "Solana") {
    return new Response("invalid candidate", {
      status: 400,
      headers: ACTIONS_CORS_HEADERS,
    });
  }
  const connection = new Connection("http://127.0.0.8899", "confirmed");

  const program: Program<Voting> = new Program(IDL, { connection });
  const body: ActionPostRequest = await request.json();
  let voter;

  try {
    voter = new PublicKey(body.account);
  } catch (error) {
    return new Response("invalid accout", {
      status: 400,
      headers: ACTIONS_CORS_HEADERS,
    });
  }

  const instruction = await program.methods
    .vote(candidate, new BN(1))
    .accounts({
      signer: voter,
    })
    .instruction();

  const blockhash = await connection.getLatestBlockhash();

  const transaction = new Transaction({
    feePayer: voter,
    blockhash: blockhash.blockhash,
    lastValidBlockHeight: blockhash.lastValidBlockHeight,
  }).add(instruction);

  const response = await createPostResponse({
    fields: {
      transaction: transaction,
    },
  });

  return Response.json(response, { headers: ACTIONS_CORS_HEADERS });
}
