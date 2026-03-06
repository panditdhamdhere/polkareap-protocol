import { useState } from "react";
import { ethers } from "ethers";
import { useWallet } from "./hooks/useWallet";
import { usePolkaReap } from "./hooks/usePolkaReap";
import "./App.css";

function App() {
  const {
    signer,
    address,
    isConnected,
    isConnecting,
    error: walletError,
    connect,
    disconnect,
    isCorrectChain,
    switchToPolkadotHub,
  } = useWallet();

  const {
    strategies,
    bestStrategy,
    userBalances,
    loading,
    error: contractError,
    deposit,
    withdraw,
    refresh,
    isConfigured,
  } = usePolkaReap(signer, address);

  const [activeStrategy, setActiveStrategy] = useState(null);
  const [amount, setAmount] = useState("");
  const [txPending, setTxPending] = useState(false);
  const [txError, setTxError] = useState("");

  const handleDeposit = async (e) => {
    e.preventDefault();
    if (!activeStrategy || !amount || parseFloat(amount) <= 0) return;
    setTxPending(true);
    setTxError("");
    try {
      const amountWei = ethers.parseEther(amount);
      await deposit(activeStrategy.id, amountWei);
      setAmount("");
      setActiveStrategy(null);
    } catch (err) {
      setTxError(err.message || "Transaction failed");
    } finally {
      setTxPending(false);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!activeStrategy || !amount || parseFloat(amount) <= 0) return;
    const balance = userBalances[activeStrategy.id] || "0";
    if (ethers.parseEther(amount) > BigInt(balance)) {
      setTxError("Insufficient balance");
      return;
    }
    setTxPending(true);
    setTxError("");
    try {
      await withdraw(activeStrategy.id, ethers.parseEther(amount));
      setAmount("");
      setActiveStrategy(null);
    } catch (err) {
      setTxError(err.message || "Transaction failed");
    } finally {
      setTxPending(false);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <div className="logo">
          <span className="logo-icon">🌾</span>
          <h1>PolkaReap</h1>
        </div>
        <p className="tagline">Cross-chain yield aggregator on Polkadot Hub</p>
        <div className="wallet-section">
          {!isConnected ? (
            <button
              className="btn btn-primary"
              onClick={connect}
              disabled={isConnecting}
            >
              {isConnecting ? "Connecting..." : "Connect Wallet"}
            </button>
          ) : (
            <div className="wallet-info">
              {!isCorrectChain && (
                <button
                  className="btn btn-outline"
                  onClick={switchToPolkadotHub}
                >
                  Switch to Polkadot Hub
                </button>
              )}
              <span className="address">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </span>
              <button className="btn btn-ghost" onClick={disconnect}>
                Disconnect
              </button>
            </div>
          )}
        </div>
      </header>

      {(walletError || contractError) && (
        <div className="banner banner-error">
          {walletError || contractError}
        </div>
      )}

      {isConnected && !isConfigured && (
        <div className="banner banner-warn">
          Contract not deployed. Set VITE_POLKAREAP_ADDRESS or deploy first.
        </div>
      )}

      <main className="main">
        {isConnected && isConfigured && (
          <>
            {bestStrategy.id > 0 && (
              <div className="card best-strategy">
                <h3>Best APY</h3>
                <p>
                  Strategy #{bestStrategy.id} —{" "}
                  <strong>{(bestStrategy.apy / 100).toFixed(2)}%</strong> APY
                </p>
              </div>
            )}

            <section className="strategies">
              <h2>Yield Strategies</h2>
              {loading ? (
                <p className="muted">Loading strategies...</p>
              ) : strategies.length === 0 ? (
                <p className="muted">No strategies registered yet.</p>
              ) : (
                <div className="strategy-grid">
                  {strategies.map((s) => (
                    <div key={s.id} className="card strategy-card">
                      <h4>{s.name}</h4>
                      <p className="chain">Chain ID: {s.chainId}</p>
                      <p className="min-deposit">
                        Min: {ethers.formatEther(s.minDeposit)} tokens
                      </p>
                      <p className="balance">
                        Your balance:{" "}
                        {ethers.formatEther(userBalances[s.id] || "0")}
                      </p>
                      <div className="strategy-actions">
                        <button
                          className="btn btn-sm"
                          onClick={() =>
                            setActiveStrategy(
                              activeStrategy?.id === s.id ? null : s
                            )
                          }
                        >
                          {activeStrategy?.id === s.id ? "Cancel" : "Deposit / Withdraw"}
                        </button>
                      </div>
                      {activeStrategy?.id === s.id && (
                        <form
                          className="deposit-form"
                          onSubmit={(e) => {
                            e.preventDefault();
                            const mode = e.nativeEvent.submitter?.dataset?.mode;
                            if (mode === "deposit") handleDeposit(e);
                            else if (mode === "withdraw") handleWithdraw(e);
                          }}
                        >
                          <input
                            type="text"
                            placeholder="Amount"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            disabled={txPending}
                          />
                          <div className="form-actions">
                            <button
                              type="submit"
                              data-mode="deposit"
                              className="btn btn-sm btn-primary"
                              disabled={txPending || !amount}
                            >
                              Deposit
                            </button>
                            <button
                              type="submit"
                              data-mode="withdraw"
                              className="btn btn-sm btn-outline"
                              disabled={
                                txPending ||
                                !amount ||
                                BigInt(userBalances[s.id] || "0") === 0n
                              }
                            >
                              Withdraw
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {txError && (
              <div className="banner banner-error">{txError}</div>
            )}

            <button
              className="btn btn-ghost refresh-btn"
              onClick={refresh}
              disabled={loading}
            >
              ↻ Refresh
            </button>
          </>
        )}

        {!isConnected && (
          <div className="hero">
            <p>Connect your wallet to start harvesting cross-chain yield.</p>
            <p className="muted">
              Built for Polkadot Solidity Hackathon 2026 • XCM-native
            </p>
          </div>
        )}
      </main>

      <footer className="footer">
        <a
          href="https://docs.polkadot.com/develop/smart-contracts/precompiles/xcm-precompile"
          target="_blank"
          rel="noopener noreferrer"
        >
          XCM Precompile Docs
        </a>
        <a
          href="https://polkadot.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          Polkadot
        </a>
      </footer>
    </div>
  );
}

export default App;
