import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { PolkaReapABI } from "../abis/PolkaReap";
import { CONTRACT_ADDRESS, POLKADOT_HUB_TESTNET } from "../config";

export function usePolkaReap(signerOrProvider, address) {
  const [contract, setContract] = useState(null);
  const [strategies, setStrategies] = useState([]);
  const [bestStrategy, setBestStrategy] = useState({ id: 0, apy: 0 });
  const [userBalances, setUserBalances] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!signerOrProvider || CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") return;
    const signer = signerOrProvider.getSigner ? signerOrProvider : signerOrProvider;
    setContract(new ethers.Contract(CONTRACT_ADDRESS, PolkaReapABI, signer));
  }, [signerOrProvider]);

  const fetchStrategies = useCallback(async () => {
    if (!contract) return;
    setLoading(true);
    setError(null);
    try {
      const count = Number(await contract.strategyCount());
      const infos = await contract.getStrategiesInfo();
      const list = [];
      for (let i = 0; i < count; i++) {
        list.push({
          id: i + 1,
          name: infos[i].name,
          chainId: Number(infos[i].chainId),
          minDeposit: infos[i].minDeposit.toString(),
          isActive: infos[i].isActive,
        });
      }
      setStrategies(list);
    } catch (err) {
      setError(err.message);
      setStrategies([]);
    } finally {
      setLoading(false);
    }
  }, [contract]);

  const fetchBestStrategy = useCallback(async () => {
    if (!contract) return;
    try {
      const [id, apy] = await contract.getBestStrategy();
      setBestStrategy({ id: Number(id), apy: Number(apy) });
    } catch {
      setBestStrategy({ id: 0, apy: 0 });
    }
  }, [contract]);

  const fetchUserBalances = useCallback(async () => {
    if (!contract || !address || strategies.length === 0) return;
    try {
      const balances = {};
      for (const s of strategies) {
        balances[s.id] = (await contract.getUserBalance(s.id, address)).toString();
      }
      setUserBalances(balances);
    } catch {
      setUserBalances({});
    }
  }, [contract, address, strategies]);

  useEffect(() => {
    fetchStrategies();
  }, [fetchStrategies]);

  useEffect(() => {
    fetchBestStrategy();
  }, [fetchBestStrategy]);

  useEffect(() => {
    fetchUserBalances();
  }, [fetchUserBalances]);

  const deposit = async (strategyId, amountWei) => {
    if (!contract) throw new Error("Contract not connected");
    const tx = await contract.deposit(strategyId, amountWei);
    await tx.wait();
    await fetchUserBalances();
    await fetchStrategies();
  };

  const withdraw = async (strategyId, amountWei) => {
    if (!contract) throw new Error("Contract not connected");
    const tx = await contract.withdraw(strategyId, amountWei);
    await tx.wait();
    await fetchUserBalances();
    await fetchStrategies();
  };

  const refresh = () => {
    fetchStrategies();
    fetchBestStrategy();
    fetchUserBalances();
  };

  return {
    contract,
    strategies,
    bestStrategy,
    userBalances,
    loading,
    error,
    deposit,
    withdraw,
    refresh,
    isConfigured: CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000",
  };
}
