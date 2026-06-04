import type { GameSpec } from "@shared/types/GameSpec";

export function generateDiceBattleContract(spec: GameSpec): string {
  return `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title ${spec.title}
/// @notice Demo-only single-player Dice Battle template generated for ${spec.hackathonContext}.
/// @dev Unaudited. Do not use with real funds.
contract DiceBattle {
    uint8 public constant WINNING_ROLL = 4;

    uint256 public immutable entryFee;
    uint256 public roundId;
    address public player;
    address public winner;
    bool public prizeClaimed;
    bool public roundSettled;

    uint8 private playerRoll;
    bool private playerHasRolled;
    uint256 private rollNonce;

    event PlayerJoined(uint256 indexed roundId, address indexed player);
    event DiceRolled(uint256 indexed roundId, address indexed player, uint8 roll);
    event WinnerDecided(uint256 indexed roundId, address indexed winner);
    event PrizeClaimed(uint256 indexed roundId, address indexed winner, uint256 amount);

    error IncorrectEntryFee();
    error GameAlreadyStarted();
    error PrizePending();
    error NotPlayer();
    error AlreadyRolled();
    error RollRequired();
    error LosingRoll();
    error OnlyWinnerCanClaim();
    error PrizeAlreadyClaimed();
    error TransferFailed();

    constructor(uint256 _entryFee) {
        entryFee = _entryFee;
    }

    function joinGame() external payable {
        if (msg.value != entryFee) revert IncorrectEntryFee();
        if (player != address(0) && !roundSettled) revert GameAlreadyStarted();
        if (winner != address(0) && !prizeClaimed) revert PrizePending();

        roundId++;
        player = msg.sender;
        winner = address(0);
        prizeClaimed = false;
        roundSettled = false;
        playerRoll = 0;
        playerHasRolled = false;

        emit PlayerJoined(roundId, msg.sender);
    }

    function rollDice() external {
        if (msg.sender != player) revert NotPlayer();
        if (playerHasRolled) revert AlreadyRolled();

        // Insecure pseudo-randomness for testnet/demo only.
        // Replace with a production-grade randomness source before using real funds.
        rollNonce++;
        uint8 roll = uint8(
            (uint256(
                keccak256(
                    abi.encodePacked(block.timestamp, block.prevrandao, msg.sender, address(this), roundId, rollNonce)
                )
            ) % 6) + 1
        );

        playerRoll = roll;
        playerHasRolled = true;
        roundSettled = true;
        emit DiceRolled(roundId, msg.sender, roll);

        if (roll >= WINNING_ROLL) {
            winner = msg.sender;
        }

        emit WinnerDecided(roundId, winner);
    }

    function claimPrize() external {
        if (!playerHasRolled) revert RollRequired();
        if (winner == address(0)) revert LosingRoll();
        if (msg.sender != winner) revert OnlyWinnerCanClaim();
        if (prizeClaimed) revert PrizeAlreadyClaimed();

        prizeClaimed = true;
        uint256 amount = address(this).balance;
        (bool success, ) = winner.call{value: amount}("");
        if (!success) revert TransferFailed();

        emit PrizeClaimed(roundId, winner, amount);
    }

    function rolls(address account) external view returns (uint8) {
        return account == player ? playerRoll : 0;
    }

    function hasRolled(address account) external view returns (bool) {
        return account == player && playerHasRolled;
    }
}`;
}
