import { expect } from "chai";
import { ethers } from "hardhat";

describe("DiceBattle", function () {
  const entryFee = ethers.parseEther("0.001");

  async function deployDiceBattle() {
    const [player, outsider] = await ethers.getSigners();
    const DiceBattle = await ethers.getContractFactory("DiceBattle");
    const diceBattle = await DiceBattle.deploy(entryFee);
    await diceBattle.waitForDeployment();

    return { diceBattle, player, outsider };
  }

  it("player can join with correct entry fee", async function () {
    const { diceBattle, player } = await deployDiceBattle();

    await expect(diceBattle.connect(player).joinGame({ value: entryFee }))
      .to.emit(diceBattle, "PlayerJoined")
      .withArgs(player.address);

    expect(await diceBattle.player()).to.equal(player.address);
  });

  it("wrong entry fee reverts", async function () {
    const { diceBattle, player } = await deployDiceBattle();

    await expect(diceBattle.connect(player).joinGame({ value: ethers.parseEther("0.002") })).to.be.revertedWithCustomError(
      diceBattle,
      "IncorrectEntryFee"
    );
  });

  it("second player cannot join an active solo game", async function () {
    const { diceBattle, player, outsider } = await deployDiceBattle();
    await diceBattle.connect(player).joinGame({ value: entryFee });

    await expect(diceBattle.connect(outsider).joinGame({ value: entryFee })).to.be.revertedWithCustomError(
      diceBattle,
      "GameAlreadyStarted"
    );
  });

  it("non-player cannot roll", async function () {
    const { diceBattle, outsider } = await deployDiceBattle();

    await expect(diceBattle.connect(outsider).rollDice()).to.be.revertedWithCustomError(diceBattle, "NotPlayer");
  });

  it("player cannot roll before joining", async function () {
    const { diceBattle, player } = await deployDiceBattle();

    await expect(diceBattle.connect(player).rollDice()).to.be.revertedWithCustomError(diceBattle, "NotPlayer");
  });

  it("player cannot roll twice", async function () {
    const { diceBattle, player } = await deployDiceBattle();
    await diceBattle.connect(player).joinGame({ value: entryFee });
    await diceBattle.connect(player).rollDice();

    await expect(diceBattle.connect(player).rollDice()).to.be.revertedWithCustomError(diceBattle, "AlreadyRolled");
  });

  it("winner is decided after the solo player rolls", async function () {
    const { diceBattle, player } = await deployDiceBattle();
    await diceBattle.connect(player).joinGame({ value: entryFee });

    await expect(diceBattle.connect(player).rollDice()).to.emit(diceBattle, "WinnerDecided");

    const roll = await diceBattle.rolls(player.address);
    const winner = await diceBattle.winner();

    expect(roll).to.be.greaterThanOrEqual(1);
    expect(roll).to.be.lessThanOrEqual(6);

    if (roll >= 4) {
      expect(winner).to.equal(player.address);
    } else {
      expect(winner).to.equal(ethers.ZeroAddress);
    }
  });

  it("claim requires a completed roll", async function () {
    const { diceBattle, player } = await deployDiceBattle();
    await diceBattle.connect(player).joinGame({ value: entryFee });

    await expect(diceBattle.connect(player).claimPrize()).to.be.revertedWithCustomError(diceBattle, "RollRequired");
  });

  it("only the winner can claim when the player wins", async function () {
    const { diceBattle, player, outsider } = await deployDiceBattle();
    await diceBattle.connect(player).joinGame({ value: entryFee });
    await diceBattle.connect(player).rollDice();

    if ((await diceBattle.winner()) === player.address) {
      await expect(diceBattle.connect(outsider).claimPrize()).to.be.revertedWithCustomError(
        diceBattle,
        "OnlyWinnerCanClaim"
      );
    } else {
      await expect(diceBattle.connect(outsider).claimPrize()).to.be.revertedWithCustomError(diceBattle, "LosingRoll");
    }
  });

  it("prize claim follows the roll outcome", async function () {
    const { diceBattle, player } = await deployDiceBattle();
    await diceBattle.connect(player).joinGame({ value: entryFee });
    await diceBattle.connect(player).rollDice();

    if ((await diceBattle.winner()) === player.address) {
      await expect(diceBattle.connect(player).claimPrize()).to.changeEtherBalances(
        [player, diceBattle],
        [entryFee, -entryFee]
      );
      expect(await diceBattle.prizeClaimed()).to.equal(true);
    } else {
      await expect(diceBattle.connect(player).claimPrize()).to.be.revertedWithCustomError(diceBattle, "LosingRoll");
    }
  });
});
