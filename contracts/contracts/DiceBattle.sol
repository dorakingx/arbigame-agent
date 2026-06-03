// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title DiceBattle
/// @notice Demo-only two-player dice battle for Arbitrum Sepolia.
/// @dev Unaudited. This contract is not suitable for real funds.
contract DiceBattle {
    uint256 public immutable entryFee;
    address public player1;
    address public player2;
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
    error GameFull();
    error AlreadyJoined();
    error NotPlayer();
    error NeedTwoPlayers();
    error AlreadyRolled();
    error WinnerNotDecided();
    error OnlyWinnerCanClaim();
    error PrizeAlreadyClaimed();
    error TransferFailed();

    constructor(uint256 _entryFee) {
        entryFee = _entryFee;
    }

    function joinGame() external payable {
        if (msg.value != entryFee) revert IncorrectEntryFee();
        if (player1 != address(0) && player2 != address(0)) revert GameFull();
        if (msg.sender == player1) revert AlreadyJoined();

        if (player1 == address(0)) {
            player1 = msg.sender;
        } else {
            player2 = msg.sender;
        }

        emit PlayerJoined(msg.sender);
    }

    function rollDice() external {
        if (!_isPlayer(msg.sender)) revert NotPlayer();
        if (player1 == address(0) || player2 == address(0)) revert NeedTwoPlayers();
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

        if (hasRolled[player1] && hasRolled[player2]) {
            _decideWinner();
        }
    }

    function claimPrize() external {
        if (winner == address(0)) revert WinnerNotDecided();
        if (msg.sender != winner) revert OnlyWinnerCanClaim();
        if (prizeClaimed) revert PrizeAlreadyClaimed();

        prizeClaimed = true;
        uint256 amount = address(this).balance;
        (bool success, ) = winner.call{value: amount}("");
        if (!success) revert TransferFailed();

        emit PrizeClaimed(winner, amount);
    }

    function _decideWinner() private {
        uint8 player1Roll = rolls[player1];
        uint8 player2Roll = rolls[player2];

        if (player1Roll > player2Roll) {
            winner = player1;
        } else if (player2Roll > player1Roll) {
            winner = player2;
        } else {
            winner = uint256(keccak256(abi.encodePacked(blockhash(block.number - 1), player1, player2))) % 2 == 0
                ? player1
                : player2;
        }

        emit WinnerDecided(winner);
    }

    function _isPlayer(address account) private view returns (bool) {
        return account == player1 || account == player2;
    }
}
