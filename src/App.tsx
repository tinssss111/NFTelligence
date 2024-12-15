import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { useLucid } from "./context/LucidProvider";
import Header from "./components/Header";
import { Mint } from "./components/Mint";
import { MyNFT } from "./components/MyNFT";
import { SendAda } from "./components/SendAda";
import MarketPlace from "./components/MarketPlace";
import { shortAddress } from "./lib/utils";
import { PriceADA } from "./components/PriceADA";
import { Hodling } from "./components/Hodling";

const App: React.FC = () => {
  const { address, connectWallet, getUtxos, balance } = useLucid();

  useEffect(() => {
    const fetchData = async () => {
      if (address) {
        try {
          await getUtxos();
        } catch (error) {
          console.error("Error fetching UTXOs:", error);
        }
      }
    };
    fetchData();
  }, [address, getUtxos]);

  return (
    <Router>
      <div className="min-h-screen bg-[#161627] animate-fade-in">
        <Header
          address={address}
          balance={balance}
          connectWallet={connectWallet}
        />
        <main className="p-6">
          <Routes>
            <Route
              path="/"
              element={
                <div className="flex flex-col items-center justify-center space-y-4 mt-[30px] animate-slide-up">
                  <h1 className="text-4xl font-bold font-mono text-gray-400">
                    Welcome to{" "}
                    <span className="text-[#6e77d6]">NFTelligence</span>
                  </h1>
                  <p className="text-lg font-bold text-[#666] font-mono border-b pb-[30px] border-gray-500">
                    Your gateway to unique digital assets.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mx-[100px]">
                    <Link to="/mint">
                      <div className="bg-[#252145] h-[400px] rounded-lg shadow-md p-4 hover:bg-[#373150] hover:scale-105 transition-transform duration-300 ease-in-out cursor-pointer flex flex-col">
                        <img
                          src="https://gold-imperial-tuna-683.mypinata.cloud/ipfs/QmcjgbmZZkT3Wt8iujqUoeZbwSrZcQzPRL2WD6megzjfLh"
                          alt="Mint NFT"
                          className="w-20 h-20 rounded-md object-cover mr-4 mb-4"
                        />
                        <div className="flex-grow">
                          <h3 className="uppercase font-mono text-xl font-bold text-white mb-2">
                            Which Memecoin Should We Buy Right Now?
                          </h3>
                          <p className="text-gray-400 font-mono">
                            This prediction will be minted as an NFT, preserving
                            its uniqueness and value on the blockchain.
                          </p>
                        </div>
                      </div>
                    </Link>
                    <Link to="/buybtc">
                      <div className="bg-[#252145] h-[400px] rounded-lg shadow-md p-4 hover:bg-[#373150] hover:scale-105 transition-transform duration-300 ease-in-out cursor-pointer flex flex-col">
                        <img
                          src="https://gold-imperial-tuna-683.mypinata.cloud/ipfs/QmWxaxVu5Ym5hhLQ4V8X1HA5uC1iR1XynV5gsLEbsJQFSD"
                          alt="Send ADA"
                          className="w-20 h-20 rounded-md object-cover mr-4 mb-4"
                        />
                        <div className="flex-grow">
                          <p className="text-gray-400 font-mono">
                            {shortAddress(
                              "addr_test1wpl2peu9nera9zj6zvwzuy6s454uqzgntq59tt6xk5fh93cpvc46h"
                            )}
                          </p>
                          <h3 className="uppercase text-xl font-mono font-bold text-white mb-2">
                            Should I Buy BTC Now?
                          </h3>
                          <p className="text-gray-400 font-mono">
                            The ADA will be locked in a smart contract, and AI
                            analysis will be displayed after processing.
                          </p>
                        </div>
                      </div>
                    </Link>
                    <Link to="/ada">
                      <div className="bg-[#252145] h-[400px] rounded-lg shadow-md p-4 hover:bg-[#373150] hover:scale-105 transition-transform duration-300 ease-in-out cursor-pointer flex flex-col">
                        <img
                          src="https://gold-imperial-tuna-683.mypinata.cloud/ipfs/Qmepe28apWbm59uiiH3Mo4JCLRM389eAa4bcdvXCEGxJMo"
                          alt="Marketplace"
                          className="w-20 h-20 rounded-md object-cover mr-4 mb-4"
                        />
                        <div className="flex-grow">
                          <p className="text-gray-400 font-mono">
                            {shortAddress(
                              "addr_test1wpl2peu9nera9zj6zvwzuy6s454uqzgntq59tt6xk5fh93cpvc46h"
                            )}
                          </p>
                          <h3 className="uppercase text-xl font-mono font-bold text-white mb-2">
                            ADA price on electronic exchanges?
                          </h3>
                          <p className="text-gray-400 font-mono">
                            AI analysis will be displayed after executing the
                            transaction.
                          </p>
                        </div>
                      </div>
                    </Link>
                    <Link to="/hodling">
                      <div className="bg-[#252145] h-[400px] rounded-lg shadow-md p-4 hover:bg-[#373150] hover:scale-105 transition-transform duration-300 ease-in-out cursor-pointer flex flex-col">
                        <img
                          src="https://gold-imperial-tuna-683.mypinata.cloud/ipfs/QmZ8vUczCMfkJuQkejFxpZSbs9ecdsbAYQUptVZDCxeBGN"
                          alt="My NFTs"
                          className="w-20 h-20 rounded-md object-cover mr-4 mb-4"
                        />
                        <div className="flex-grow">
                          <p className="text-gray-400 font-mono">
                            {shortAddress(
                              "addr_test1wpl2peu9nera9zj6zvwzuy6s454uqzgntq59tt6xk5fh93cpvc46h"
                            )}
                          </p>
                          <h3 className="uppercase font-mono text-xl font-bold text-white mb-2">
                            Best cryptocurrencies for long term investment 2024.
                          </h3>
                          <p className="text-gray-400 font-mono">
                            Below is an updated version of the code to analyze
                            and give advice on long-term investing (HODLing).
                          </p>
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
              }
            />
            <Route path="/market" element={<MarketPlace />} />
            <Route path="/mint" element={<Mint />} />
            <Route path="/mynft" element={<MyNFT />} />
            <Route path="/buybtc" element={<SendAda />} />
            <Route path="/ada" element={<PriceADA />} />
            <Route path="/hodling" element={<Hodling />} />
            <Route
              path="*"
              element={
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4 animate-fade-in">
                  <h1 className="text-4xl font-bold font-mono text-[#F76A68]">
                    404
                  </h1>
                  <p className="text-lg font-mono text-gray-400">
                    Oops! The page you're looking for doesn't exist.
                  </p>
                  <a
                    href="/"
                    className="mt-4 bg-[#6e77d6] font-mono hover:bg-[#5a66c3] text-white px-6 py-2 rounded-lg shadow-md"
                  >
                    Back to Home
                  </a>
                </div>
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
