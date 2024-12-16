import { useFetchNFTsFromMarketplace } from "../services/n";
import { useLucid } from "../context/LucidProvider";
import { Data } from "lucid-cardano";
import getValidator from "../contract/marketplace/plutus-nft";
import { useState } from "react";
import { shortAddress } from "../lib/utils";

export interface NFTListing {
  datum: {
    assetName: string;
    policyId: string;
    price: bigint;
    seller: string;
  };
  metadata: {
    description: string;
    image: string;
    mediaType: string;
    name: string;
  };
  utxo: {
    address: string;
    assets: { [policyId: string]: string };
    datum: string;
    datumHash?: string;
    outputIndex: number;
    scriptRef?: string;
    txHash: string;
  };
}

const MarketPlace = () => {
  const { lucid } = useLucid();
  const nfts = useFetchNFTsFromMarketplace(lucid);
  const [txHash, setTxhash] = useState<string>("");

  const buyNFT = async (nft: NFTListing) => {
    try {
      if (!lucid) throw new Error("Lucid is not initialized.");

      const validator = getValidator();
      const contractAddress = lucid.utils.validatorToAddress(validator);
      console.log(contractAddress);

      const free = (BigInt(nft.datum.price) * 1n * 10n ** 6n) / 100n;

      const sellerC = lucid.utils.keyHashToCredential(
        "addr_test1qq599ef7wtkrg2a4em7205yt9pelcm7crvak89rntq7h7stzels95pmwrl6steksyy60uf7d2xsygs8dfns6c6nyrvwq4xxvz0"
      );
      const sellerAddress = lucid.utils.credentialToAddress(sellerC);
      const markerAddress =
        "addr_test1qr6f780g8wj7su0v6lr4pqp4w5l5947gcq45d60cl0xd2txkuxdtp7znxpl0kflxpt8z0eqauckttc7zk75gvu5s8dcqj250mt";
      const redeemer = Data.void();
      const tx = await lucid
        .newTx()
        .payToAddress(sellerAddress, {
          lovelace: BigInt(nft.datum.price),
        })
        .payToAddress(markerAddress, {
          lovelace: free,
        })
        .collectFrom([nft.utxo], redeemer)
        .attachSpendingValidator(validator)
        .complete();
      console.log("Transaction built successfully:", tx);

      const signedTx = await tx.sign().complete();

      const txHashResult = await signedTx.submit();

      setTxhash(txHashResult);
      setTimeout(() => {
        setTxhash("");
      }, 5000);
    } catch (error) {
      console.error("Error in buyNFT:", error);
    }
  };

  return (
    <div className="p-6 min-h-screen">
      <h1 className="text-4xl font-bold font-mono text-center mb-10 border-b pb-[70px] border-gray-500 text-white uppercase animate-fade-in">
        Marketplace
      </h1>
      {nfts.length === 0 ? (
        <p className="text-center text-lg font-mono text-gray-400 animate-pulse">
          Loading...
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {nfts.map((nft, index) => (
            <div
              key={index}
              className="border border-gray-700 rounded-lg shadow-lg bg-[#252145] p-4 hover:shadow-xl transition-transform duration-300 ease-in-out hover:scale-105 animate-slide-up"
            >
              <div className="w-full h-48 mb-4 overflow-hidden rounded-lg bg-gray-800">
                <img
                  src={
                    nft.metadata.image?.startsWith("ipfs://")
                      ? `https://ipfs.io/ipfs/${nft.metadata.image.replace(
                          "ipfs://",
                          ""
                        )}`
                      : nft.metadata.image
                  }
                  alt={nft.metadata.name || "NFT Image"}
                  className="w-full h-full object-cover font-mono"
                />
              </div>
              <h3 className="text-lg font-mono font-bold text-white mb-2 text-center">
                {nft.metadata.name || "Unnamed NFT"}
              </h3>
              <div className="text-sm font-mono text-gray-400 space-y-1">
                <p>
                  <strong className="text-white">Price:</strong>{" "}
                  {Number(nft.datum.price)} ADA
                </p>
                <p>
                  <strong className="text-white">Description:</strong>{" "}
                  {nft.metadata.description || "No description available"}
                </p>
                <p>
                  <strong className="text-white">Seller:</strong>{" "}
                  {shortAddress(nft.datum.seller)}
                </p>
              </div>
              <button
                onClick={() => buyNFT(nft)}
                className="w-full mt-4 bg-[#6e77d6] font-mono font-bold text-white py-2 rounded-md hover:bg-[#959ce7] transition-all duration-300 hover:scale-110"
              >
                Buy Now
              </button>
            </div>
          ))}
        </div>
      )}
      {txHash && (
        <div className="mt-4 text-center animate-slide-in">
          <p className="text-white">
            <strong>Transaction Hash:</strong> {txHash}
          </p>
        </div>
      )}
    </div>
  );
};

export default MarketPlace;
