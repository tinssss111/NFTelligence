import { useState, useEffect } from "react";
import { useLucid } from "../context/LucidProvider";
import { fromText } from "lucid-cardano";
import axios from "axios";
import { shortAddress } from "../lib/utils";

export const Mint = () => {
  const { lucid } = useLucid();
  const [txHash, setTxhash] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [analysis, setAnalysis] = useState<string>("");
  const [displayedAnalysis, setDisplayedAnalysis] = useState<string>("");
  const [final_decision, setFinal_decision] = useState<string>("");

  const nftImages = [
    "ipfs://QmcjgbmZZkT3Wt8iujqUoeZbwSrZcQzPRL2WD6megzjfLh",
    "ipfs://QmWxaxVu5Ym5hhLQ4V8X1HA5uC1iR1XynV5gsLEbsJQFSD",
    "ipfs://Qmepe28apWbm59uiiH3Mo4JCLRM389eAa4bcdvXCEGxJMo",
    "ipfs://QmZ8vUczCMfkJuQkejFxpZSbs9ecdsbAYQUptVZDCxeBGN",
    "ipfs://QmUgtzgbooigkUBHF6tHvfd5tMNE2d3ZTZ3EHVd83GAr4K",
    "ipfs://QmXJadpDdPaYa3Abb8HM9qm2QMgDV45QYcRKzK7YTeb2jK",
    "ipfs://QmUHWuiFq7XHkMoeMhN31c284EaEhUDbijdQywGaym8EVe",
    "ipfs://QmcfKFaWGE95dRmuahwhtWuqPLc2iuEMyStQc8qkLsM1ei",
  ];

  const getRandomImage = () => {
    const randomIndex = Math.floor(Math.random() * nftImages.length);
    return nftImages[randomIndex];
  };

  useEffect(() => {
    if (analysis) {
      let index = -1;
      setDisplayedAnalysis("");
      const interval = setInterval(() => {
        if (index < analysis.length) {
          setDisplayedAnalysis((prev) => prev + analysis[index]);
          index++;
        } else {
          clearInterval(interval);
        }
      }, 10);
      return () => clearInterval(interval);
    }
  }, [analysis]);

  const getMint = async () => {
    if (!lucid) {
      throw new Error("Lucid is not initialized");
    }
    const { paymentCredential } = lucid.utils.getAddressDetails(
      await lucid.wallet.address()
    );
    if (!paymentCredential) {
      throw new Error("Payment credential is missing");
    }
    const mintingPolicy = lucid.utils.nativeScriptFromJson({
      type: "all",
      scripts: [
        { type: "sig", keyHash: paymentCredential.hash },
        {
          type: "before",
          slot: lucid.utils.unixTimeToSlot(Date.now() + 3600000),
        },
      ],
    });
    const policyId = lucid.utils.mintingPolicyToId(mintingPolicy);
    return { policyId, mintingPolicy };
  };

  const mint = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://127.0.0.1:5000/trend");
      const { analysis, final_decision } = response.data;

      const tokenName = final_decision.token_name;
      const currentTime = new Date().toLocaleString();
      const tokenDescription = `The most trending Memecoin is "${tokenName}" at ${currentTime}`;
      const tokenImage = getRandomImage();

      if (!lucid) {
        throw new Error("Lucid is not initialized");
      }

      if (!tokenName || !tokenDescription) {
        throw new Error("NFT Name and Description are required.");
      }
      const { mintingPolicy, policyId } = await getMint();

      const assetName = fromText(tokenName);

      const tx = await lucid
        .newTx()
        .mintAssets({ [policyId + assetName]: 1n })
        .attachMetadata(721, {
          [policyId]: {
            [tokenName]: {
              name: tokenName,
              description: tokenDescription,
              image: tokenImage,
              mediaType: "image/png",
            },
          },
        })
        .validTo(Date.now() + 200000)
        .attachMintingPolicy(mintingPolicy)
        .complete();

      const signedTx = await tx.sign().complete();
      const txHashR = await signedTx.submit();

      setTxhash(txHashR);
      setTimeout(() => setTxhash(""), 5000);
      setAnalysis(analysis);
      setFinal_decision(tokenName);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError("Minting failed: " + error.message);
        setTimeout(() => setError(""), 5000);
      } else {
        setError("An unknown error occurred.");
        setTimeout(() => setError(""), 5000);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center px-4 py-8 mt-[-50px] mx-[80px]">
      <div className="rounded-lg p-6 space-y-6">
        <div className="flex items-center">
          <div className="w-[100px] h-[100px] flex-shrink-0">
            <img
              src="https://gold-imperial-tuna-683.mypinata.cloud/ipfs/QmUgtzgbooigkUBHF6tHvfd5tMNE2d3ZTZ3EHVd83GAr4K"
              alt="NFT preview"
              className="w-full h-full rounded-lg object-cover"
            />
          </div>
          <div className="ml-[20px]">
            <h2 className="text-3xl font-bold text-white font-mono">
              Which Memecoin Should We Buy Right Now?
            </h2>
            <p className="text-gray-400 font-mono">
              This prediction will be minted as an NFT, preserving its
              uniqueness and value on the blockchain.
            </p>
          </div>
          <div className="text-center ml-[180px]">
            <button
              onClick={mint}
              disabled={loading}
              className={`px-6 py-3 text-lg font-semibold rounded-md transition-all flex items-center justify-center font-mono ${
                loading
                  ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                  : "bg-[#6e77d6] text-white hover:bg-[#959ce7]"
              }`}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    ></path>
                  </svg>
                  <span className="font-mono">Loading...</span>
                </div>
              ) : (
                "Execute"
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 border border-red-400 p-4 rounded-md text-center">
            {error}
          </div>
        )}

        {txHash && (
          <div className="">
            <h3 className="text-lg font-bold font-mono text-green-600 mb-2">
              Transaction Successful!
            </h3>
            <div className="flex items-center gap-2">
              <p className="text-gray-300 font-mono">Transaction details:</p>
              <a
                href={`https://preprod.cardanoscan.io/transaction/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 break-all text-sm font-medium"
              >
                {shortAddress(txHash)}
              </a>
            </div>
          </div>
        )}
        <div
          className={`bg-[#1A202C] p-4 rounded-md shadow-inner ${
            analysis || final_decision
              ? "w-auto h-auto"
              : "w-[1200px] h-[300px]"
          }`}
        >
          <div className="mt-4">
            <div className="text-white bg-[#8b8994] w-[90px] p-2 rounded-md font-semibold mb-4 font-mono">
              Analysis
            </div>
            <p
              className={`text-white bg-[#373448] p-3 rounded-md shadow-md font-mono ${
                analysis || final_decision
                  ? "w-auto h-auto"
                  : "w-[1170px] h-[200px]"
              }`}
            >
              {displayedAnalysis || "No analysis available"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
