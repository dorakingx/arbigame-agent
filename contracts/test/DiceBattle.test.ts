import { expect } from "chai";
import { ethers } from "hardhat";

describe("DiceBattle", function () {
  const entryFee = ethers.parseEther("0.001");

  async function deployDiceBattle() {
    const [player1, player2, player3, outsider] = await ethers.getSigners();
    const DiceBattle = await ethers.getContractFactory("DiceBattle");
    const diceBattle = await DiceBattle.deploy(entryFee);
    await diceBattle.waitForDeployment();

    return { diceBattle, player1, player2, player3, outsider };
  }

  it("players can join with correct entry fee", async function () {
    const { diceBattle, player1, player2 } = await deployDiceBattle();

    await expect(diceBattle.connect(player1).joinGame({ value: entryFee }))
      .to.emit(diceBattle, "PlayerJoined")
      .withArgs(player1.address);
    await expect(diceBattle.connect(player2).joinGame({ value: entryFee }))
      .to.emit(diceBattle, "PlayerJoined")
      .withArgs(player2.address);

    expect(await diceBattle.player1()).to.equal(player1.address);
    expect(await diceBattle.player2()).to.equal(player2.address);
  });

  it("wrong entry fee reverts", async function () {
    const { diceBattle, player1 } = await deployDiceBattle();

    await expect(diceBattle.connect(player1).joinGame({ value: ethers.parseEther("0.002") })).to.be.revertedWithCustomError(
      diceBattle,
      "IncorrectEntryFee"
    );
  });

  it("third player cannot join", async function () {
    const { diceBattle, player1, player2, player3 } = await deployDiceBattle();
    await diceBattle.connect(player1).joinGame({ value: entryFee });
    await diceBattle.connect(player2).joinGame({ value: entryFee });

    await expect(diceBattle.connect(player3).joinGame({ value: entryFee })).to.be.revertedWithCustomError(
      diceBattle,
      "GameFull"
    );
  });

  it("same player cannot join both slots", async function () {
    const { diceBattle, player1 } = await deployDiceBattle();
    await diceBattle.connect(player1).joinGame({ value: entryFee });

    await expect(diceBattle.connect(player1).joinGame({ value: entryFee })).to.be.revertedWithCustomError(
      diceBattle,
      "AlreadyJoined"
    );
  });

  it("non-player cannot roll", async function () {
    const { diceBattle, outsider } = await deployDiceBattle();

    await expect(diceBattle.connect(outsider).rollDice()).to.be.revertedWithCustomError(diceBattle, "NotPlayer");
  });

  it("players cannot roll before both players join", async function () {
    const { diceBattle, player1 } = await deployDiceBattle();
    await diceBattle.connect(player1).joinGame({ value: entryFee });

    await expect(diceBattle.connect(player1).rollDice()).to.be.revertedWithCustomError(diceBattle, "NeedTwoPlayers");
  });

  it("player cannot roll twice", async function () {
    const { diceBattle, player1, player2 } = await deployDiceBattle();
    await diceBattle.connect(player1).joinGame({ value: entryFee });
    await diceBattle.connect(player2).joinGame({ value: entryFee });

    await diceBattle.connect(player1).rollDice();

    await expect(diceBattle.connect(player1).rollDice()).to.be.revertedWithCustomError(diceBattle, "AlreadyRolled");
  });

  it("winner is decided after both players roll", async function () {
    const { diceBattle, player1, player2 } = await deployDiceBattle();
    await diceBattle.connect(player1).joinGame({ value: entryFee });
    await diceBattle.connect(player2).joinGame({ value: entryFee });

    await diceBattle.connect(player1).rollDice();
    await expect(diceBattle.connect(player2).rollDice()).to.emit(diceBattle, "WinnerDecided");

    const winner = await diceBattle.winner();
    expect([player1.address, player2.address]).to.include(winner);
  });

  it("only winner can claim prize", async function () {
    const { diceBattle, player1, player2 } = await deployDiceBattle();
    await diceBattle.connect(player1).joinGame({ value: entryFee });
    await diceBattle.connect(player2).joinGame({ value: entryFee });
    await diceBattle.connect(player1).rollDice();
    await diceBattle.connect(player2).rollDice();

    const winner = await diceBattle.winner();
    const loser = winner === player1.address ? player2 : player1;

    await expect(diceBattle.connect(loser).claimPrize()).to.be.revertedWithCustomError(diceBattle, "OnlyWinnerCanClaim");
  });

  it("prize is transferred after claim", async function () {
    const { diceBattle, player1, player2 } = await deployDiceBattle();
    await diceBattle.connect(player1).joinGame({ value: entryFee });
    await diceBattle.connect(player2).joinGame({ value: entryFee });
    await diceBattle.connect(player1).rollDice();
    await diceBattle.connect(player2).rollDice();

    const winnerAddress = await diceBattle.winner();
    const winner = winnerAddress === player1.address ? player1 : player2;
    const prize = entryFee * 2n;

    await expect(diceBattle.connect(winner).claimPrize()).to.changeEtherBalances(
      [winner, diceBattle],
      [prize, -prize]
    );

    expect(await diceBattle.prizeClaimed()).to.equal(true);
  });
});
