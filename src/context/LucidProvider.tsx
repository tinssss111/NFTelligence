import { Blockfrost, Lucid, UTxO } from "lucid-cardano";
import { createContext, useContext, useEffect, useState } from "react";

interface LucidContextType {
  lucid: Lucid | null;
  address: string | null;
  balance: string | null;
  setLucid: (lucid: Lucid) => void;
  connectWallet: () => Promise<void>;
  getUtxos: () => Promise<UTxO[]>;
}

const LucidContext = createContext<LucidContextType | undefined>(undefined);

export const LucidProvider = ({ children }: { children: React.ReactNode }) => {
  const [lucid, setLucid] = useState<Lucid | null>(null);
  const [address, setaddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);

  useEffect(() => {
    async function initLucid() {
      const lucidInstance = await Lucid.new(
        new Blockfrost(
          "https://cardano-preprod.blockfrost.io/api/v0",
          "preprodTu2ehz3QzRraoFPjzUEpgZprS8bQ3NI2"
        ),
        "Preprod"
      );
      setLucid(lucidInstance);
    }
    initLucid();
  }, []);

  const connectWallet = async () => {
    if (!lucid) {
      throw new Error("Lucid is not initialized");
    }
    const api = await window.cardano.nami.enable();
    lucid.selectWallet(api);
    const addressR = await lucid.wallet.address();
    setaddress(addressR);
  };

  const getUtxos = async () => {
    if (!lucid) {
      throw new Error("useLucid must be used within a LucidProvider");
    }
    const utxos = await lucid.wallet.getUtxos();
    let totalBalance: bigint = BigInt(0);

    for (const utxo of utxos) {
      const value = utxo.assets;

      if (value && value.lovelace) {
        totalBalance += value.lovelace;
      }
    }

    const totalBalanceInAda = totalBalance / BigInt(1_000_000);
    const formattedBalance = new Intl.NumberFormat().format(
      Number(totalBalanceInAda)
    );

    setBalance(formattedBalance);
    return utxos;
  };

  return (
    <LucidContext.Provider
      value={{ lucid, setLucid, address, connectWallet, getUtxos, balance }}
    >
      {children}
    </LucidContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useLucid = () => {
  const context = useContext(LucidContext);
  if (!context) {
    throw new Error("useLucid must be used within a LucidProvider");
  }
  return context;
};
