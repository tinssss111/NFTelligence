import { SpendingValidator } from "lucid-cardano";
import nftMarketplace from "./plutus-nft.json"


const getValidator = (): SpendingValidator => {
    const marketplaceValidator = nftMarketplace.validators.find((validator) => validator.title
        === "marketplace.marketplace"
    );
    if (!marketplaceValidator) {
        throw new Error("loi")
    }
    return {
        type: "PlutusV2",
        script: marketplaceValidator.compiledCode,
    }
}

export default getValidator;