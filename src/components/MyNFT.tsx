import { useEffect, useState } from "react";
import { useLucid } from "../context/LucidProvider";
import Blockfrost from "../services/blockfrost";
import { NFT } from "../types";
import { NFTMarketplaceDatum } from "../contract/marketplace/datum";
import { Data } from "lucid-cardano";
import getValidator from "../contract/marketplace/plutus-nft";

export const MyNFT = () => {
  const { lucid, address } = useLucid();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const blockfrostService = new Blockfrost();
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [priceInputs, setPriceInputs] = useState<{ [key: number]: string }>({});
  const [txHash, setTxHash] = useState<string>("");

  const handlePriceChange = (index: number, value: string) => {
    setPriceInputs((prev) => ({
      ...prev,
      [index]: value.replace(/[^0-9.]/g, ""),
    }));
  };

  const handleSellNFT = async (nft: NFT, index: number) => {
    const price = parseFloat(priceInputs[index]);
    if (!price || isNaN(price)) {
      alert("Please enter a valid price");
      return;
    }

    try {
      if (!address || !lucid) {
        throw new Error("Lucid or address not found");
      }
      const priceInAda = parseFloat(priceInputs[index]);
      const priceInLovelace = BigInt(priceInAda * 10 ** 6);
      const seller =
        lucid?.utils.getAddressDetails(address).paymentCredential?.hash;
      if (!seller) throw new Error("Seller public key hash not found");

      const datum = Data.to(
        {
          policyId: nft.assetDe.policy_id,
          assetName: nft.assetDe.asset_name,
          seller: seller,
          price: BigInt(price),
        },
        NFTMarketplaceDatum
      );
      const validator = getValidator();
      const contractAddress = lucid.utils.validatorToAddress(validator);
      if (!contractAddress) throw new Error("Contract address not found");

      const free = priceInLovelace / 100n; // Tính phí 1%
      const tx = await lucid
        .newTx()
        .payToContract(
          contractAddress,
          { inline: datum },
          { lovelace: free, [nft.unit]: 1n }
        )
        .complete();
      const signedTx = await tx.sign().complete();
      const txHashResult = await signedTx.submit();

      setTxHash(txHashResult);
      setTimeout(() => {
        setTxHash("");
      }, 5000);
    } catch (error) {
      console.error("Error selling NFT:", error);
      alert("Failed to sell NFT");
    }
  };

  useEffect(() => {
    async function fetchNFTs() {
      if (address) {
        try {
          const fetchedNfts = await blockfrostService.getNFTs(address);
          setNfts(fetchedNfts);
        } catch (error) {
          console.error("Error fetching NFTs:", error);
        }
      }
    }
    fetchNFTs();
  }, [address, blockfrostService]);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="uppercase text-4xl font-bold text-center font-mono mt-10 mb-10 text-white border-b pb-[70px] border-gray-500 animate-fade-in">
        AI predictions turned into nft you can sell it
      </h1>
      {nfts.length === 0 ? (
        <p className="text-center text-lg text-gray-400 font-mono animate-pulse">
          Loading...
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {nfts.map((nft, index) => {
            const metadata = nft.assetDe?.onchain_metadata || {};
            const name = metadata.name || "Unknown NFT";
            const image = metadata.image
              ? metadata.image.startsWith("ipfs://")
                ? `https://gateway.pinata.cloud/ipfs/${metadata.image.replace(
                    "ipfs://",
                    ""
                  )}`
                : metadata.image
              : "https://via.placeholder.com/150";

            const description =
              metadata.description || "No description provided";

            return (
              <div
                key={index}
                className="border border-gray-800 rounded-lg p-4 shadow-md bg-[#252145] flex flex-col items-center hover:scale-105 transition-transform duration-300 ease-in-out animate-slide-up"
              >
                {image && (
                  <img
                    src={image}
                    alt={name}
                    className="w-full h-auto object-cover rounded-md mb-4"
                  />
                )}
                <h3 className="text-lg font-semibold text-center text-white mb-2 font-mono">
                  {name}
                </h3>
                <p className="text-sm text-gray-300 mb-4 text-center font-mono">
                  {description}
                </p>
                <div className="flex">
                  <input
                    type="text"
                    value={priceInputs[index] || ""}
                    onChange={(e) => handlePriceChange(index, e.target.value)}
                    placeholder="Enter price"
                    className="w-[150px] font-mono mr-[5px] rounded-lg text-center bg-[#39345b] text-white focus:outline-none focus:ring-2 focus:ring-[#6e77d6]"
                  />
                  <button
                    onClick={() => handleSellNFT(nft, index)}
                    className="p-2 bg-[#6e77d6] text-white rounded-lg hover:bg-[#5a66c3] transition font-mono"
                  >
                    Sell
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {txHash && (
        <div className="mt-6 p-4 bg-green-100 border border-green-500 rounded-lg text-green-700 text-center animate-slide-in">
          <p className="font-semibold">Transaction successful! Hash:</p>
          <a
            href={`https://cardanoscan.io/transaction/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {txHash}
          </a>
        </div>
      )}
    </div>
  );
};
