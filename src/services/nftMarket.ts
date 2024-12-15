import { Lucid } from "lucid-cardano";
import getValidator from "../contract/marketplace/plutus-nft";
class marketService {
    private contractAddress: string;
    private lucid: Lucid;

    constructor(lucid: Lucid) {
        this.lucid = lucid;
        const validator = getValidator();
        const contractAddress = lucid?.utils.validatorToAddress(validator);
        this.contractAddress = contractAddress;
    }
    getContractAddress() {
        return this.contractAddress;
    }

    async getUtxo() {
        return this.lucid.utxosAt(this.contractAddress);
    }
}
export default marketService;