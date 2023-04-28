import { useWeb3React } from "@web3-react/core";
import { useEffect, useState } from "react";
import { injected } from "../components/wallet/connectors";

import { spiralAddress } from "../constants";
import sprialABI from "../constants/spiral.json";
import { Contract } from "@ethersproject/contracts";
import { formatEther } from "@ethersproject/units";
export default function Home() {
  const { active, account, chainId, library, activate, deactivate } =
    useWeb3React();
  const [ethBalance, setEthBalance] = useState(undefined);

  // example of switching or adding network with ZkSync ERA Mainnet
  async function connect() {
    try {
      await activate(injected);

      console.log(active);

      localStorage.setItem("isWalletConnected", true);
    } catch (ex) {
      console.log(ex);
    }
  }

  async function disconnect() {
    try {
      deactivate();
      localStorage.setItem("isWalletConnected", false);
    } catch (ex) {
      console.log(ex);
    }
  }

  async function withdrawFunds() {
    const SpiralContract = new Contract(
      spiralAddress,
      sprialABI,
      library.getSigner()
    );
    await SpiralContract.withdrawFunds();
  }

  async function withdrawUnsoldSPIRAL() {
    const SpiralContract = new Contract(
      spiralAddress,
      sprialABI,
      library.getSigner()
    );
    await SpiralContract.withdrawUnsoldSPIRAL();
  }

  async function withdrawAllSPIRAL() {
    const SpiralContract = new Contract(
      spiralAddress,
      sprialABI,
      library.getSigner()
    );
    await SpiralContract.withdrawAllSPIRAL();
  }

  useEffect(() => {
    async function switchChain() {
      if (chainId !== 324) {
        console.log(chainId);
        try {
          await library.provider.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0x144" }]
          });
        } catch (switchError) {
          // 4902 error code indicates the chain is missing on the wallet
          if (switchError.code === 4902) {
            try {
              await library.provider.request({
                method: "wallet_addEthereumChain",
                params: [
                  {
                    chainId: "0x144",
                    rpcUrls: ["https://zksync2-mainnet.zksync.io"],
                    chainName: "zkSync Era Mainnet",
                    nativeCurrency: {
                      name: "ETH",
                      decimals: 18,
                      symbol: "ETH"
                    },
                    blockExplorerUrls: ["https://explorer.zksync.io/"]
                  }
                ]
              });
            } catch (error) {
              console.error(error);
            }
          }
        }
      }
    }
    const connectWalletOnPageLoad = async () => {
      // if (localStorage?.getItem("isWalletConnected") === "true") {
      try {
        await activate(injected);
        await switchChain();
        localStorage.setItem("isWalletConnected", true);
      } catch (ex) {
        console.log(ex);
      }
      // }
    };
    connectWalletOnPageLoad();
  }, [activate]);

  useEffect(() => {
    if (active && account) {
      library?.getBalance(account).then((result) => {
        setEthBalance(Number(formatEther(result)));
      });
    }
  });
  return (
    <>
      <div className="flex flex-row items-center justify-center gap-2">
        <button
          onClick={connect}
          className="py-2 mt-20 mb-4 text-lg font-bold text-white rounded-lg w-56 bg-blue-600 hover:bg-blue-800"
        >
          Connect to MetaMask
        </button>
        <button
          onClick={disconnect}
          className="py-2 mt-20 mb-4 text-lg font-bold text-white rounded-lg w-56 bg-blue-600 hover:bg-blue-800"
        >
          Disconnect
        </button>
      </div>
      <div className="flex flex-col items-center justify-center">
        {active ? (
          <>
            <span>
              Connected with <b>{account}</b>
            </span>
            <div>balance: {ethBalance}</div>
          </>
        ) : (
          <span>Not connected</span>
        )}
      </div>
      <div className="flex flex-row gap-3 items-center justify-center">
        <button
          onClick={withdrawFunds}
          className="py-2 mt-20 mb-4 text-lg font-bold text-white rounded-lg w-56 bg-blue-600 hover:bg-blue-800"
        >
          Withdraw Funds
        </button>

        <button
          onClick={withdrawUnsoldSPIRAL}
          className="py-2 mt-20 mb-4 text-lg font-bold text-white rounded-lg w-56 bg-blue-600 hover:bg-blue-800"
        >
          withdrawUnsoldSPIRAL
        </button>
        <button
          onClick={withdrawAllSPIRAL}
          className="py-2 mt-20 mb-4 text-lg font-bold text-white rounded-lg w-56 bg-blue-600 hover:bg-blue-800"
        >
          withdrawAllSPIRAL
        </button>
      </div>
    </>
  );
}
