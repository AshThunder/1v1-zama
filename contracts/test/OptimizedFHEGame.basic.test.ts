import { expect } from "chai";
import { ethers } from "hardhat";
import { OptimizedFHEGame } from "../types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("OptimizedFHEGame - Basic Functions (No FHE)", function () {
  let game: OptimizedFHEGame;
  let owner: HardhatEthersSigner;
  let player1: HardhatEthersSigner;
  let player2: HardhatEthersSigner;
  let oracle: HardhatEthersSigner;
  let mockOracle: string;

  beforeEach(async function () {
    [owner, player1, player2, oracle] = await ethers.getSigners();
    mockOracle = oracle.address;

    const OptimizedFHEGameFactory = await ethers.getContractFactory("OptimizedFHEGame");
    game = await OptimizedFHEGameFactory.deploy(mockOracle);
    await game.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct admin", async function () {
      expect(await game.admin()).to.equal(owner.address);
    });

    it("Should set the correct decryption oracle", async function () {
      expect(await game.decryptionOracle()).to.equal(mockOracle);
    });
  });

  describe("Admin Functions", function () {
    it("Should allow admin to set decryption oracle", async function () {
      const newOracle = player1.address;
      
      await expect(game.setDecryptionOracle(newOracle))
        .to.emit(game, "OracleUpdated")
        .withArgs(mockOracle, newOracle);
      
      expect(await game.decryptionOracle()).to.equal(newOracle);
    });

    it("Should not allow non-admin to set decryption oracle", async function () {
      await expect(game.connect(player1).setDecryptionOracle(player2.address))
        .to.be.revertedWith("Only admin can call this function");
    });

    it("Should allow admin to transfer admin role", async function () {
      await expect(game.transferAdmin(player1.address))
        .to.emit(game, "AdminTransferred")
        .withArgs(owner.address, player1.address);
      
      expect(await game.admin()).to.equal(player1.address);
    });

    it("Should not allow transfer to zero address", async function () {
      await expect(game.transferAdmin(ethers.ZeroAddress))
        .to.be.revertedWith("New admin cannot be zero address");
    });

    it("Should not allow non-admin to transfer admin role", async function () {
      await expect(game.connect(player1).transferAdmin(player2.address))
        .to.be.revertedWith("Only admin can call this function");
    });
  });

  describe("Game Creation Validation", function () {
    it("Should not allow creating game with zero bet", async function () {
      await expect(game.connect(player1).createGame("0x00", "0x00", { value: 0 }))
        .to.be.revertedWith("Bet amount must be greater than 0");
    });
  });

  describe("Conclude Game Validation", function () {
    it("Should not allow concluding when oracle not set", async function () {
      // Deploy new contract with zero oracle
      const OptimizedFHEGameFactory = await ethers.getContractFactory("OptimizedFHEGame");
      const gameWithoutOracle = await OptimizedFHEGameFactory.deploy(ethers.ZeroAddress);
      
      await expect(gameWithoutOracle.concludeGame(0))
        .to.be.revertedWith("Decryption oracle not set");
    });

    it("Should not allow concluding non-existent game", async function () {
      await expect(game.concludeGame(999))
        .to.be.revertedWith("Game not ready for conclusion");
    });
  });

  describe("Consent Refund Validation", function () {
    it("Should not allow consent for non-existent game", async function () {
      await expect(game.connect(player1).consentRefund(999))
        .to.be.revertedWith("Game must be in Challenged status");
    });
  });

  describe("View Functions", function () {
    it("Should return default values for non-existent game", async function () {
      const gameData = await game.getGame(999);
      expect(gameData.id).to.equal(0);
      expect(gameData.player1).to.equal(ethers.ZeroAddress);
      expect(gameData.player2).to.equal(ethers.ZeroAddress);
      expect(gameData.betAmount).to.equal(0);
      expect(gameData.status).to.equal(0);
      expect(gameData.winner).to.equal(ethers.ZeroAddress);
    });

    it("Should return correct game counter", async function () {
      expect(await game.gameCounter()).to.equal(0);
    });
  });
});
