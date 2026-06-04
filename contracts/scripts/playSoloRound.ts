import { ethers } from "hardhat";

async function main() {
  const address = process.env.DICE_BATTLE_ADDRESS;

  if (!address) {
    throw new Error("Set DICE_BATTLE_ADDRESS to the deployed DiceBattle contract address.");
  }

  const [player] = await ethers.getSigners();
  const diceBattle = await ethers.getContractAt("DiceBattle", address);
  const entryFee = await diceBattle.entryFee();

  console.log(`Player: ${player.address}`);
  console.log(`DiceBattle: ${address}`);
  console.log(`Entry fee: ${ethers.formatEther(entryFee)} ETH`);

  const joinTx = await diceBattle.connect(player).joinGame({ value: entryFee });
  await joinTx.wait();
  console.log(`Joined round ${await diceBattle.roundId()}: ${joinTx.hash}`);

  const rollTx = await diceBattle.connect(player).rollDice();
  await rollTx.wait();

  const roll = await diceBattle.rolls(player.address);
  const winner = await diceBattle.winner();
  console.log(`Rolled: ${roll}`);
  console.log(`Winner: ${winner}`);

  if (winner === player.address) {
    const claimTx = await diceBattle.connect(player).claimPrize();
    await claimTx.wait();
    console.log(`Claimed prize: ${claimTx.hash}`);
  } else {
    console.log("Round completed as a loss. No claim is available, and the next round can start.");
  }

  console.log(`Round settled: ${await diceBattle.roundSettled()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
