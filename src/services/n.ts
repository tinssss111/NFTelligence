import { useEffect, useState } from "react";
import { Lucid } from "lucid-cardano";
import getValidator from "../contract/marketplace/plutus-nft";
import { Data } from "lucid-cardano";
import { NFTMarketplaceDatum } from "../contract/marketplace/datum";
import Blockfrost from "./blockfrost";


const useFetchNFTsFromMarketplace = (lucid: Lucid | null) => {
    const [nfts, setNfts] = useState<any[]>([]);

    useEffect(() => {
        async function fetchNFTsFromMarketplace() {
            if (!lucid) return;

            try {
                const validator = getValidator();
                const contractAddress = lucid.utils.validatorToAddress(validator);
                console.log("Contract Address:", contractAddress);

                const scriptUTxOs = await lucid.utxosAt(contractAddress);
                console.log("UTXOs at contract address:", scriptUTxOs);

                if (!scriptUTxOs || scriptUTxOs.length === 0) {
                    console.warn("No UTXOs found at the contract address.");
                    return;
                }

                const decodedUTxOs = await Promise.all(
                    scriptUTxOs.map(async (utxo) => {
                        if (!utxo.datum) {
                            console.error("Datum is missing in UTXO:", utxo);
                            return null;
                        }

                        let datumHash = utxo.datumHash;
                        if (!datumHash) {
                            console.warn("Datum hash is missing, calculating manually...");
                            datumHash = lucid.utils.datumToHash(utxo.datum);
                        }

                        try {
                            const datum = Data.from<NFTMarketplaceDatum>(utxo.datum, NFTMarketplaceDatum);
                            const blockfrost = new Blockfrost();
                            const asset = await blockfrost.getAsset(datum.policyId + datum.assetName);

                            if (!asset || !asset.onchain_metadata) {
                                console.warn("Metadata not found for asset:", datum.policyId + datum.assetName);
                                return null;
                            }

                            return {
                                utxo: { ...utxo },
                                datum,
                                metadata: asset.onchain_metadata,
                            };
                        } catch (error) {
                            console.error("Failed to process UTXO:", error);
                            return null;
                        }
                    })
                );


                const validNFTs = decodedUTxOs.filter((item) => item !== null);
                console.log("Valid NFTs:", validNFTs);

                if (validNFTs.length === 0) {
                    console.warn("No valid NFTs found in the contract.");
                    return;
                }

                setNfts(validNFTs);
            } catch (error) {
                console.error("Error fetching NFTs from marketplace:", error);
            }
        }

        fetchNFTsFromMarketplace();
    }, [lucid]);

    return nfts;
};



export { useFetchNFTsFromMarketplace };
