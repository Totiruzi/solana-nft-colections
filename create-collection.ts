import {
  createNft,
  fetchDigitalAsset,
  mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";

import {
  airdropIfRequired,
  getExplorerLink,
  getKeypairFromFile,
} from "@solana-developers/helpers";

import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";

import { Connection, clusterApiUrl, LAMPORTS_PER_SOL } from "@solana/web3.js";
import {
  generateSigner,
  keypairIdentity,
  percentAmount,
} from "@metaplex-foundation/umi";

const connection = new Connection(clusterApiUrl("devnet"));
const user = await getKeypairFromFile(); // If a file is not specified it will use the id.json in the home folder
await airdropIfRequired(
  connection,
  user.publicKey,
  1 * LAMPORTS_PER_SOL,
  0.5 * LAMPORTS_PER_SOL
);

console.log("Loaded User", user.publicKey.toBase58());

const umi = createUmi(connection.rpcEndpoint);
umi.use(mplTokenMetadata());

const umiUser = umi.eddsa.createKeypairFromSecretKey(user.secretKey);
umi.use(keypairIdentity(umiUser));

console.log("Set up Umi instance for user");

// create a collection
const collectionMint = generateSigner(umi);

// make a collection transaction
const transaction = await createNft(umi, {
  mint: collectionMint,
  name: "Gabidandom",
  symbol: "GDD",
  uri: "https://raw.githubusercontent.com/solana-developers/professional-education/main/labs/sample-nft-collection-offchain-data.json",
  sellerFeeBasisPoints: percentAmount(3),
  isCollection: true,
});

await transaction.sendAndConfirm(umi);
/**
 * Fetch the NFT details after a short delay
 * The below allows await for the transaction to be confirm 
 * others we run into an error of AccountNotFoundError 
 * */
await new Promise(resolve => setTimeout(resolve, 1000));

const createCollectionNft = await fetchDigitalAsset(
  umi,
  collectionMint.publicKey
);

console.log(
  `Created Collection Address is ${getExplorerLink(
    "address",
    createCollectionNft.mint.publicKey,
    "devnet"
  )}`
);
