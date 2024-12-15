import { SpendingValidator } from "lucid-cardano";
import plutus from "./plutus.json";

const getValidator = (): SpendingValidator => {
    const helloWorldValidator = plutus.validators.find((validator) => validator.title === "helloworld.helloworld");

    if (!helloWorldValidator) {
        throw new Error("Validator not found");
    }

    return {
        type: "PlutusV2",
        script: helloWorldValidator.compiledCode,
    }
}
export default getValidator;