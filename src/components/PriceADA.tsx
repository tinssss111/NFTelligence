import { useState, useEffect } from "react";
import { useLucid } from "../context/LucidProvider";
import { Data } from "lucid-cardano";
import { HelloWorldDatum } from "../contract/transaction/datum";
import getValidator from "../contract/transaction/plutus";
import axios from "axios";

export const PriceADA = () => {
  const { lucid, address } = useLucid();
  const [txHash, setTxHash] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [analysis, setAnalysis] = useState<string>("");
  const [displayedAnalysis, setDisplayedAnalysis] = useState<string>("");

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

  const executeTransaction = async () => {
    setLoading(true);
    try {
      if (!lucid || !address) {
        throw new Error("Lucid or address not found");
      }

      const ownerPubKeyHash = await lucid?.utils.getAddressDetails(address)
        .paymentCredential?.hash;

      if (!ownerPubKeyHash) {
        throw new Error("Owner public key hash not found");
      }

      const datum = Data.to(
        {
          owner: ownerPubKeyHash,
        },
        HelloWorldDatum
      );

      const validator = getValidator();

      const contractAddress = await lucid.utils.validatorToAddress(validator);

      if (!contractAddress) {
        throw new Error("Contract address not found");
      }

      // Gửi 1 ADA vào contract
      const tx = await lucid
        .newTx()
        .payToContract(
          contractAddress,
          {
            inline: datum,
          },
          {
            lovelace: 1n * 10n ** 6n,
          }
        )
        .complete();

      const signedTx = await tx.sign().complete();
      const txHashResult = await signedTx.submit();

      setTxHash(txHashResult);
      const response = await axios.get("http://127.0.0.1:5000/arbitrage");
      setAnalysis(response.data.ai_analysis);

      await new Promise((resolve) => setTimeout(resolve, 5000));
      setTxHash("");
    } catch (error: unknown) {
      setError("Transaction failed: " + (error || "Unknown error."));
      setTimeout(() => setError(""), 5000);
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
              src="https://gold-imperial-tuna-683.mypinata.cloud/ipfs/QmUHWuiFq7XHkMoeMhN31c284EaEhUDbijdQywGaym8EVe"
              alt="Send ADA"
              className="w-full h-full rounded-lg object-cover"
            />
          </div>
          <div className="ml-[20px]">
            <h2 className="text-3xl font-bold text-white font-mono">
              ADA price on electronic exchanges?
            </h2>
            <p className="text-gray-400 text-[15px] font-mono">
              AI analysis will be displayed after executing the transaction.
            </p>
            <a
              href="https://preprod.cardanoscan.io/address/addr_test1wpl2peu9nera9zj6zvwzuy6s454uqzgntq59tt6xk5fh93cpvc46h"
              className="flex font-mono font-bold text-gray-400"
              target="_blank"
            >
              <a>Contract: </a>
              <a href="" className="">
                addr_test1wpl2peu9nera9zj6zvwzuy6s454uqzgntq59tt6xk5fh93cpvc46h
              </a>
            </a>
          </div>
          <div className="text-center">
            <button
              onClick={executeTransaction}
              disabled={loading}
              className={`px-4 py-3 text-lg font-semibold ml-[190px] rounded-md transition-all flex items-center justify-center font-mono ${
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
                  <span className="font-mono">Processing...</span>
                </div>
              ) : (
                "Execute"
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 font-mono text-red-700 border border-red-400 p-4 rounded-md text-center">
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
              <span className="text-blue-600 break-all text-sm font-medium">
                {txHash}
              </span>
            </div>
          </div>
        )}

        <div
          className={`bg-[#1A202C] p-4 rounded-md shadow-inner ${
            analysis ? "w-auto h-auto" : "w-[1200px] h-[300px]"
          }`}
        >
          <div className="mt-4">
            <div className="text-white bg-[#8b8994] w-[90px] p-2 rounded-md font-semibold mb-4 font-mono">
              Analysis
            </div>
            <p
              className={`text-white bg-[#373448] p-3 rounded-md shadow-md font-mono ${
                analysis ? "w-auto h-auto" : "w-[1170px] h-[200px]"
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
