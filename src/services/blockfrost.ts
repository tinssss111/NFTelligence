class BlockfrostSE {
    private baseURL: string;
    private projectID: string;

    constructor() {
        this.baseURL = "https://cardano-preprod.blockfrost.io/api/v0";
        this.projectID = "preprodKdtH4a7FVm5TDPfxWQBXqDquliI6mFlk";
    }
    async getUtxos(address: string) {
        if (!address) {
            throw new Error("Address is required");
        }
        try {
            const response = await fetch(
                `${this.baseURL}/addresses/${address}/utxos`,
                {
                    headers: {
                        'Project_id': this.projectID
                    }
                }
            );
            return await response.json();
        } catch (error) {
            console.error('Error fetching UTXOs:', error);
            throw error;
        }
    }

    async getAsset(unit: string) {
        if (!unit) {
            throw new Error("loi");
        }
        try {
            const response = await fetch(
                `${this.baseURL}/assets/${unit}`,
                {
                    headers: {
                        'Project_id': this.projectID
                    }
                }
            );
            return await response.json();
        } catch (error) {
            console.error('error', error);
            throw error;
        }
    }
    async getNFTs(address: string) {
        if (!address) throw new Error("Address is required");

        try {
            const utxos = await this.getUtxos(address);

            const nonLovelaceAssets = utxos.flatMap(utxo =>
                utxo.amount.filter(asset => asset.unit !== 'lovelace')
            );

            const nftDetails = await Promise.all(
                nonLovelaceAssets.map(async (asset) => {
                    const assetDe = await this.getAsset(asset.unit);

                    if (
                        assetDe.onchain_metadata &&
                        assetDe.onchain_metadata_standard === 'CIP25v1' // Only CIP-25 NFTs
                    ) {
                        return {
                            ...asset,
                            assetDe
                        };
                    }
                    return null; // Return null for non-NFTs
                })
            );

            // Remove non-NFTs (null values)
            return nftDetails.filter(nft => nft !== null);
            // return nftDetails;

        } catch (error) {
            console.error('Error fetching NFTs:', error);
            throw error;
        }
    }



}

export default BlockfrostSE;