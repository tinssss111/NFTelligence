import { useEffect, useState } from "react";
import { useLucid } from "../context/LucidProvider";
import NFTMarketplaceService from "../services/nftMarket";
import { Data } from "lucid-cardano";
import { NFTMarketplaceDatum } from "../contract/marketplace/datum";
import getValidator from "../contract/marketplace/plutus-nft.ts";
// import BlockfrostSE from "../services/blockfrost";

export interface NFTListing {
  address: string;
  assetName: string;
  assets: {
    [policyId: string]: string;
  };
  datum: string;
  datumHash?: string;
  outputIndex: number;
  policyId: string;
  price: bigint;
  scriptRef?: string;
  seller: string;
  txHash: string;
}

export const MarketPlaceNFT = () => {
  const { lucid } = useLucid();
  const [nfts, setNfts] = useState<NFTListing[]>([]);
  const [txHash, setTxhash] = useState<string>("");
  //   const block = new BlockfrostSE();

  useEffect(() => {
    async function getNftFromMarketplace() {
      if (!lucid) return;
      const nftMarketplaceService = new NFTMarketplaceService(lucid);
      //   const n = await block.getNFTs(nftMarketplaceService.getContractAddress());
      //   console.log(n);
      const scriptUTxOs = await nftMarketplaceService.getUtxo();

      const utxos = scriptUTxOs
        ?.map((utxo) => {
          try {
            const temp = Data.from<NFTMarketplaceDatum>(
              utxo.datum,
              NFTMarketplaceDatum
            );
            return {
              ...utxo,
              ...temp,
            };
          } catch (error) {
            console.log(error);
            return false;
          }
        })
        .filter(Boolean);
      setNfts(utxos);
    }

    getNftFromMarketplace();
  }, [lucid]);

  const buyNFT = async (nft: NFTListing) => {
    try {
      if (!lucid) {
        console.error("Lucid is not initialized.");
        return;
      }

      const validator = getValidator();

      const markerAddress =
        "addr_test1qr6f780g8wj7su0v6lr4pqp4w5l5947gcq45d60cl0xd2txkuxdtp7znxpl0kflxpt8z0eqauckttc7zk75gvu5s8dcqj250mt";

      const free = (BigInt(nft.price) * 1n * 10n ** 6n) / 100n;
      // const sellerAddress =
      //   "addr_test1qq599ef7wtkrg2a4em7205yt9pelcm7crvak89rntq7h7stzels95pmwrl6steksyy60uf7d2xsygs8dfns6c6nyrvwq4xxvz0";
      const sellerCredential = lucid?.utils.keyHashToCredential(nft?.seller);
      const sellerAddress = lucid?.utils.credentialToAddress(sellerCredential);

      const redeemer = Data.void();

      const tx = await lucid
        ?.newTx()
        .payToAddress(sellerAddress, {
          lovelace: BigInt(nft.price) * 10n ** 6n,
        })
        .payToAddress(markerAddress, {
          lovelace: free,
        })
        .collectFrom([nft], redeemer)
        .attachSpendingValidator(validator)
        .complete();

      const signedTx = await tx.sign().complete();

      const txHashResult = await signedTx.submit();

      setTxhash(txHashResult);
    } catch (error) {
      console.error("Error in buyNFT:", error);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
        NFT Marketplace
      </h1>
      {nfts.length === 0 ? (
        <p className="text-center text-lg text-gray-500">
          No NFTs found in the marketplace.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {nfts.map((nft, index) => (
            <div
              key={index}
              className="border border-gray-300 rounded-lg shadow-md bg-white p-4"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {nft.assetName || "Unnamed NFT"}
              </h3>
              <p className="text-sm text-gray-600 mb-1">
                <strong>Policy ID:</strong> {nft.policyId}
              </p>
              <p className="text-sm text-gray-600 mb-1">
                <strong>Seller:</strong> {nft.seller}
              </p>
              <p className="text-sm text-gray-600 mb-1">
                <strong>Price:</strong> {Number(nft.price)} ADA
              </p>
              <p className="text-sm text-gray-600 mb-1">
                <strong>Address:</strong> {nft.address}
              </p>
              <button
                onClick={() => {
                  buyNFT(nft);
                }}
                className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition mt-4"
              >
                Buy Now
              </button>
            </div>
          ))}
        </div>
      )}
      {txHash && (
        <p className="text-center text-green-600 mt-4">
          Transaction Hash: {txHash}
        </p>
      )}
    </div>
  );
};
