const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { ethers } = require("hardhat");

describe("PolkaReap", function () {
  async function deployFixture() {
    const [owner, user1, user2] = await ethers.getSigners();

    const PolkaReap = await ethers.getContractFactory("PolkaReap");
    const polkaReap = await PolkaReap.deploy();

    const MockYieldStrategy = await ethers.getContractFactory("MockYieldStrategy");
    const strategy1 = await MockYieldStrategy.deploy(
      "DOT Staking",
      2000, // chainId
      ethers.parseEther("1"),
      800 // 8% APY
    );
    const strategy2 = await MockYieldStrategy.deploy(
      "Lending Pool",
      2000,
      ethers.parseEther("0.5"),
      1200 // 12% APY
    );

    return { polkaReap, strategy1, strategy2, owner, user1, user2 };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { polkaReap, owner } = await loadFixture(deployFixture);
      expect(await polkaReap.owner()).to.equal(owner.address);
    });

    it("Should have XCM precompile address", async function () {
      const { polkaReap } = await loadFixture(deployFixture);
      expect(await polkaReap.getXcmPrecompile()).to.equal("0x00000000000000000000000000000000000a0000");
    });
  });

  describe("Strategy Registration", function () {
    it("Should register strategies", async function () {
      const { polkaReap, strategy1, strategy2 } = await loadFixture(deployFixture);

      const tx1 = await polkaReap.registerStrategy(await strategy1.getAddress());
      await expect(tx1).to.emit(polkaReap, "StrategyRegistered").withArgs(1, await strategy1.getAddress(), "DOT Staking");

      const tx2 = await polkaReap.registerStrategy(await strategy2.getAddress());
      await expect(tx2).to.emit(polkaReap, "StrategyRegistered").withArgs(2, await strategy2.getAddress(), "Lending Pool");

      expect(await polkaReap.strategies(1)).to.equal(await strategy1.getAddress());
      expect(await polkaReap.strategies(2)).to.equal(await strategy2.getAddress());
      expect(await polkaReap.strategyCount()).to.equal(2);
    });

    it("Should revert when non-owner registers", async function () {
      const { polkaReap, strategy1, user1 } = await loadFixture(deployFixture);
      await expect(polkaReap.connect(user1).registerStrategy(await strategy1.getAddress())).to.be.revertedWithCustomError(
        polkaReap,
        "Unauthorized"
      );
    });
  });

  describe("Deposit & Withdraw", function () {
    it("Should allow deposits", async function () {
      const { polkaReap, strategy1, user1 } = await loadFixture(deployFixture);
      await polkaReap.registerStrategy(await strategy1.getAddress());

      const amount = ethers.parseEther("10");
      await expect(polkaReap.connect(user1).deposit(1, amount))
        .to.emit(polkaReap, "StrategyDeposit")
        .withArgs(user1.address, 1, amount);

      expect(await polkaReap.getUserBalance(1, user1.address)).to.equal(amount);
      expect(await polkaReap.totalDeposits(1)).to.equal(amount);
    });

    it("Should revert deposit below minimum", async function () {
      const { polkaReap, strategy1, user1 } = await loadFixture(deployFixture);
      await polkaReap.registerStrategy(await strategy1.getAddress());

      await expect(polkaReap.connect(user1).deposit(1, ethers.parseEther("0.5"))).to.be.revertedWithCustomError(
        polkaReap,
        "InsufficientDeposit"
      );
    });

    it("Should allow withdrawals", async function () {
      const { polkaReap, strategy1, user1 } = await loadFixture(deployFixture);
      await polkaReap.registerStrategy(await strategy1.getAddress());
      await polkaReap.connect(user1).deposit(1, ethers.parseEther("10"));

      await expect(polkaReap.connect(user1).withdraw(1, ethers.parseEther("5")))
        .to.emit(polkaReap, "StrategyWithdraw")
        .withArgs(user1.address, 1, ethers.parseEther("5"));

      expect(await polkaReap.getUserBalance(1, user1.address)).to.equal(ethers.parseEther("5"));
    });

    it("Should revert withdrawal above balance", async function () {
      const { polkaReap, strategy1, user1 } = await loadFixture(deployFixture);
      await polkaReap.registerStrategy(await strategy1.getAddress());
      await polkaReap.connect(user1).deposit(1, ethers.parseEther("10"));

      await expect(polkaReap.connect(user1).withdraw(1, ethers.parseEther("20"))).to.be.revertedWithCustomError(
        polkaReap,
        "InsufficientBalance"
      );
    });
  });

  describe("getBestStrategy", function () {
    it("Should return strategy with highest APY", async function () {
      const { polkaReap, strategy1, strategy2 } = await loadFixture(deployFixture);
      await polkaReap.registerStrategy(await strategy1.getAddress()); // 8% APY
      await polkaReap.registerStrategy(await strategy2.getAddress()); // 12% APY

      const [bestId, bestAPY] = await polkaReap.getBestStrategy();
      expect(bestId).to.equal(2);
      expect(bestAPY).to.equal(1200);
    });
  });
});
