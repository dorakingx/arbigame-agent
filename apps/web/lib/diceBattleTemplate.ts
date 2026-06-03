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
    address public player;
    address public winner;
    bool public prizeClaimed;
    uint256 private rollNonce;

    mapping(address => uint8) public rolls;
    mapping(address => bool) public hasRolled;

    event PlayerJoined(address indexed player);
    event DiceRolled(address indexed player, uint8 roll);
    event WinnerDecided(address indexed winner);
    event PrizeClaimed(address indexed winner, uint256 amount);

    error IncorrectEntryFee();
    error GameAlreadyStarted();
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
        if (player != address(0)) revert GameAlreadyStarted();

        player = msg.sender;
        emit PlayerJoined(msg.sender);
    }

    function rollDice() external {
        if (msg.sender != player) revert NotPlayer();
        if (hasRolled[msg.sender]) revert AlreadyRolled();

        // Insecure pseudo-randomness for testnet/demo only.
        // Replace with a production-grade randomness source before using real funds.
        rollNonce++;
        uint8 roll = uint8(
            (uint256(
                keccak256(
                    abi.encodePacked(block.timestamp, block.prevrandao, msg.sender, address(this), rollNonce)
                )
            ) % 6) + 1
        );

        rolls[msg.sender] = roll;
        hasRolled[msg.sender] = true;
        emit DiceRolled(msg.sender, roll);

        if (roll >= WINNING_ROLL) {
            winner = msg.sender;
        }

        emit WinnerDecided(winner);
    }

    function claimPrize() external {
        if (!hasRolled[player]) revert RollRequired();
        if (winner == address(0)) revert LosingRoll();
        if (msg.sender != winner) revert OnlyWinnerCanClaim();
        if (prizeClaimed) revert PrizeAlreadyClaimed();

        prizeClaimed = true;
        uint256 amount = address(this).balance;
        (bool success, ) = winner.call{value: amount}("");
        if (!success) revert TransferFailed();

        emit PrizeClaimed(winner, amount);
    }
}`;
}
