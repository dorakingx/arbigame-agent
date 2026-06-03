import { ethers } from "hardhat";

async function main() {
  const entryFee = ethers.parseEther("0.001");
  const DiceBattle = await ethers.getContractFactory("DiceBattle");
  const diceBattle = await DiceBattle.deploy(entryFee);

  await diceBattle.waitForDeployment();

  console.log(`DiceBattle deployed to: ${await diceBattle.getAddress()}`);
  console.log(`Entry fee: ${ethers.formatEther(entryFee)} ETH`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
