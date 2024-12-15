import React from "react";
import { Link } from "react-router-dom";
import { shortAddress } from "../lib/utils";

type HeaderProps = {
  address: string | null;
  balance: string | null;
  connectWallet: () => void;
};

const Header: React.FC<HeaderProps> = ({ address, balance, connectWallet }) => {
  return (
    <header className="w-auto h-auto flex p-4 justify-between items-center bg-[#161627] mr-[100px] ml-[100px]">
      <div className="text-3xl font-bold text-gray-200 font-mono">
        <Link to="/">NFTelligence</Link>
      </div>
      <nav className="flex space-x-6">
        <Link
          to="/"
          className="text-gray-400 font-mono font-bold hover:text-[#6e77d6]"
        >
          Home
        </Link>
        <Link
          to="/mynft"
          className="text-gray-400 font-mono font-bold hover:text-[#6e77d6]"
        >
          MyNFT
        </Link>
        <Link
          to="/market"
          className="text-gray-400 font-mono font-bold hover:text-[#6e77d6]"
        >
          Marketplace
        </Link>
      </nav>
      <div className="flex flex-col items-center space-y-4">
        {address ? (
          <div className="bg-[#6e77d6] font-mono text-white px-4 py-2 rounded-full flex items-center space-x-2">
            <img
              src="https://gold-imperial-tuna-683.mypinata.cloud/ipfs/QmWxaxVu5Ym5hhLQ4V8X1HA5uC1iR1XynV5gsLEbsJQFSD"
              className="bg-[#E0B1CB] rounded-full w-10 h-10"
            ></img>
            <div>
              <p className="text-sm font-semibold">{shortAddress(address)}</p>
              <p className="text-xs">{balance} ADA</p>
            </div>
          </div>
        ) : (
          <button
            onClick={connectWallet}
            className="bg-[#6e77d6] hover:bg-[#5a66c3] font-bold text-white px-6 py-2 rounded-full font-mono shadow-md"
          >
            Connect Wallet
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
