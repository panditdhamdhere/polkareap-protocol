import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { POLKADOT_HUB_TESTNET } from "../config";

export function useWallet() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [address, setAddress] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);

  const targetChainId = `0x${POLKADOT_HUB_TESTNET.chainIdDecimal.toString(16)}`;

  const switchToPolkadotHub = useCallback(async () => {
    if (!window.ethereum) return;
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: targetChainId }],
      });
    } catch (err) {
      if (err.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: targetChainId,
              chainName: POLKADOT_HUB_TESTNET.name,
              rpcUrls: [POLKADOT_HUB_TESTNET.rpcUrl],
              blockExplorerUrls: [POLKADOT_HUB_TESTNET.blockExplorer],
            },
          ],
        });
      }
    }
  }, [targetChainId]);

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      setError("Install MetaMask or Talisman");
      return;
    }
    setIsConnecting(true);
    setError(null);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const network = await provider.getNetwork();
      setProvider(provider);
      setSigner(signer);
      setAddress(accounts[0]);
      setChainId(Number(network.chainId));
      if (Number(network.chainId) !== POLKADOT_HUB_TESTNET.chainIdDecimal) {
        await switchToPolkadotHub();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsConnecting(false);
    }
  }, [switchToPolkadotHub]);

  const disconnect = useCallback(() => {
    setProvider(null);
    setSigner(null);
    setAddress(null);
    setChainId(null);
  }, []);

  useEffect(() => {
    if (!window.ethereum) return;
    const onAccountsChanged = (accounts) => {
      if (accounts.length === 0) disconnect();
    };
    const onChainChanged = () => window.location.reload();
    window.ethereum.on("accountsChanged", onAccountsChanged);
    window.ethereum.on("chainChanged", onChainChanged);
    return () => {
      window.ethereum?.removeListener("accountsChanged", onAccountsChanged);
      window.ethereum?.removeListener("chainChanged", onChainChanged);
    };
  }, [disconnect]);

  return {
    provider,
    signer,
    address,
    chainId,
    isConnected: !!address,
    isConnecting,
    error,
    connect,
    disconnect,
    switchToPolkadotHub,
    isCorrectChain: chainId === POLKADOT_HUB_TESTNET.chainIdDecimal,
  };
}
