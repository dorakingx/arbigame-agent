import { ethers } from "hardhat";

async function main() {
  const entryFee = ethers.parseEther("0.001");
  const DiceBattle = await ethers.getContractFactory("DiceBattle");
  const diceBattle = await DiceBattle.deploy(entryFee);

  await diceBattle.waitForDeployment();
  const address = await diceBattle.getAddress();

  console.log(`DiceBattle deployed to: ${address}`);
  console.log(`Entry fee: ${ethers.formatEther(entryFee)} ETH`);
  console.log("");
  console.log("Add this to apps/web/.env.local and Vercel Production env:");
  console.log(`NEXT_PUBLIC_DICE_BATTLE_ADDRESS=${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
