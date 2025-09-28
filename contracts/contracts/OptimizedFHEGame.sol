// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.20;

import {FHE, euint32, externalEuint32, ebool} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title OptimizedFHEGame
 * @notice Player vs player guessing game with FHE encryption
 * @dev Includes:
 *  - Encrypted inputs with async decryption
 *  - Consent-based refunds
 *  - Pull-based prize claiming
 *  - Helpers to check win/loss status
 * WARNING: Admin can update oracle address; use multisig/DAO in production.
 */
contract OptimizedFHEGame is SepoliaConfig {
    // --- Data Structures ---
    enum GameStatus {
        WaitingForChallenger,  // Player 1 created game, waiting for Player 2
        Challenged,            // Player 2 has challenged, waiting for decryption
        Revealed,              // Results revealed (winner set, prize available)
        PrizeClaimed           // Winner has claimed prize or refund executed
    }

    struct Game {
        uint256 gameId;
        address player1;
        address player2;
        uint256 betAmount;
        GameStatus status;
        euint32 player1Choice;  // Encrypted choice (1 or 2)
        euint32 player2Guess;   // Encrypted guess (1 or 2)
        address winner;
        uint256 createdAt;
        bool player1ConsentRefund;
        bool player2ConsentRefund;
    }

    // --- State Variables ---
    uint256 public gameCounter;
    mapping(uint256 => Game) public games;

    // Track prize pools until claimed
    mapping(uint256 => uint256) public prizePool;
    
    // Admin controls
    address public admin;
    address public decryptionOracle;
    
    // Async decryption state
    mapping(uint256 => uint256) private requestToGameId;
    mapping(uint256 => uint256) private gameToRequestId;
    mapping(uint256 => bool) private isDecryptionPending;

    // --- Events ---
    event GameCreated(uint256 indexed gameId, address indexed player1, uint256 betAmount);
    event GameChallenged(uint256 indexed gameId, address indexed player2, uint256 betAmount);
    event GameRevealed(uint256 indexed gameId, address indexed winner, uint256 prize);
    event PrizeAvailable(uint256 indexed gameId, address indexed winner, uint256 amount);
    event PrizeClaimed(uint256 indexed gameId, address indexed winner, uint256 amount);
    event DecryptionRequested(uint256 indexed gameId, uint256 indexed requestId);
    event RefundConsented(uint256 indexed gameId, address indexed player);
    event RefundExecuted(uint256 indexed gameId, uint256 amount);
    event OracleUpdated(address indexed oldOracle, address indexed newOracle);
    event AdminTransferred(address indexed oldAdmin, address indexed newAdmin);

    // --- Modifiers ---
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }

    modifier onlyOracle() {
        require(msg.sender == decryptionOracle, "Only oracle");
        _;
    }

    // --- Constructor ---
    constructor(address _decryptionOracle) {
        admin = msg.sender;
        decryptionOracle = _decryptionOracle;
        emit AdminTransferred(address(0), admin);
        emit OracleUpdated(address(0), _decryptionOracle);

        if (_decryptionOracle != address(0)) {
            FHE.setDecryptionOracle(_decryptionOracle);
        }
    }

    // --- Core Functions ---

    function createGame(externalEuint32 _encryptedChoice, bytes calldata inputProof) public payable {
        require(msg.value > 0, "Bet must be > 0");
        
        uint256 gameId = gameCounter++;
        Game storage newGame = games[gameId];
        
        newGame.gameId = gameId;
        newGame.player1 = msg.sender;
        newGame.betAmount = msg.value;
        newGame.status = GameStatus.WaitingForChallenger;
        newGame.createdAt = block.timestamp;
        
        newGame.player1Choice = FHE.fromExternal(_encryptedChoice, inputProof);
        FHE.allowThis(newGame.player1Choice);

        emit GameCreated(gameId, msg.sender, msg.value);
    }

    function challengeGame(uint256 gameId, externalEuint32 _encryptedGuess, bytes calldata inputProof) public payable {
        Game storage game = games[gameId];
        
        require(game.status == GameStatus.WaitingForChallenger, "Not available");
        require(msg.sender != game.player1, "Cannot challenge self");
        require(msg.value == game.betAmount, "Bet mismatch");
        
        game.player2 = msg.sender;
        game.player2Guess = FHE.fromExternal(_encryptedGuess, inputProof);
        FHE.allowThis(game.player2Guess);
        
        game.status = GameStatus.Challenged;
        
        _requestResultDecryption(gameId);
        
        emit GameChallenged(gameId, msg.sender, msg.value);
    }

    function concludeGame(uint256 gameId) public {
        Game storage game = games[gameId];
        require(game.status == GameStatus.Challenged, "Not ready");
        require(decryptionOracle != address(0), "Oracle not set");
        _requestResultDecryption(gameId);
    }

    function _requestResultDecryption(uint256 gameId) internal {
        Game storage game = games[gameId];
        
        require(game.status == GameStatus.Challenged, "Not ready");
        require(!isDecryptionPending[gameId], "Pending");
        require(decryptionOracle != address(0), "Oracle not set");
        
        ebool isMatch = FHE.eq(game.player2Guess, game.player1Choice);
        bytes32[] memory ctsHandles = new bytes32[](1);
        ctsHandles[0] = FHE.toBytes32(isMatch);
        
        uint256 requestId = FHE.requestDecryption(ctsHandles, this.decryptionCallback.selector);
        
        requestToGameId[requestId] = gameId;
        gameToRequestId[gameId] = requestId;
        isDecryptionPending[gameId] = true;
        
        emit DecryptionRequested(gameId, requestId);
    }
    
    function decryptionCallback(
        uint256 requestId,
        bool decryptedInput,
        bytes[] memory signatures
    ) public onlyOracle {
        FHE.checkSignatures(requestId, signatures);
        
        uint256 gameId = requestToGameId[requestId];
        Game storage game = games[gameId];
        
        require(isDecryptionPending[gameId], "No decryption pending");
        require(game.status == GameStatus.Challenged, "Not challenged");
        
        bool player2Wins = decryptedInput;
        uint256 totalPrize = game.betAmount * 2;

        if (player2Wins) {
            game.winner = game.player2;
        } else {
            game.winner = game.player1;
        }

        prizePool[gameId] = totalPrize;
        game.status = GameStatus.Revealed;
        isDecryptionPending[gameId] = false;

        delete requestToGameId[requestId];
        delete gameToRequestId[gameId];

        emit GameRevealed(gameId, game.winner, totalPrize);
        emit PrizeAvailable(gameId, game.winner, totalPrize);
    }

    // --- Claim Prize ---
    function claimPrize(uint256 gameId) public {
        Game storage game = games[gameId];
        require(game.status == GameStatus.Revealed, "Not revealed");
        require(game.winner == msg.sender, "Not winner");

        uint256 amount = prizePool[gameId];
        require(amount > 0, "No prize");

        prizePool[gameId] = 0;
        game.status = GameStatus.PrizeClaimed;

        (bool sent, ) = payable(msg.sender).call{value: amount}("");
        require(sent, "Transfer failed");

        emit PrizeClaimed(gameId, msg.sender, amount);
    }

    // --- Consent-based Refund ---
    function consentRefund(uint256 gameId) public {
        Game storage game = games[gameId];
        require(game.status == GameStatus.Challenged, "Not eligible");
        require(msg.sender == game.player1 || msg.sender == game.player2, "Only players");

        if (msg.sender == game.player1) {
            require(!game.player1ConsentRefund, "Already consented");
            game.player1ConsentRefund = true;
        } else {
            require(!game.player2ConsentRefund, "Already consented");
            game.player2ConsentRefund = true;
        }
        
        emit RefundConsented(gameId, msg.sender);
        
        if (game.player1ConsentRefund && game.player2ConsentRefund) {
            _executeRefund(gameId);
        }
    }
    
    function _executeRefund(uint256 gameId) internal {
        Game storage game = games[gameId];
        require(game.player1ConsentRefund && game.player2ConsentRefund, "Both must consent");
        require(game.status == GameStatus.Challenged, "Not eligible");
        
        uint256 refundAmount = game.betAmount;

        isDecryptionPending[gameId] = false;
        uint256 requestId = gameToRequestId[gameId];
        if (requestId != 0) {
            delete requestToGameId[requestId];
            delete gameToRequestId[gameId];
        }
        
        game.status = GameStatus.PrizeClaimed;
        
        (bool s1, ) = payable(game.player1).call{value: refundAmount}("");
        require(s1, "Refund p1 failed");
        (bool s2, ) = payable(game.player2).call{value: refundAmount}("");
        require(s2, "Refund p2 failed");
        
        emit RefundExecuted(gameId, refundAmount * 2);
    }

    // --- Admin ---
    function setDecryptionOracle(address _oracle) public onlyAdmin {
        address oldOracle = decryptionOracle;
        decryptionOracle = _oracle;
        FHE.setDecryptionOracle(_oracle);
        emit OracleUpdated(oldOracle, _oracle);
    }
    
    function transferAdmin(address _newAdmin) public onlyAdmin {
        require(_newAdmin != address(0), "Zero addr");
        address oldAdmin = admin;
        admin = _newAdmin;
        emit AdminTransferred(oldAdmin, _newAdmin);
    }

    // --- View Helpers ---
    function getGame(uint256 gameId) public view returns (
        uint256 id,
        address player1,
        address player2,
        uint256 betAmount,
        GameStatus status,
        address winner,
        uint256 createdAt
    ) {
        Game storage game = games[gameId];
        return (
            game.gameId,
            game.player1,
            game.player2,
            game.betAmount,
            game.status,
            game.winner,
            game.createdAt
        );
    }
    
    function getGameCount() public view returns (uint256) {
        return gameCounter;
    }

    /// @notice Check if caller won the game
    function didIWin(uint256 gameId) public view returns (bool) {
        Game storage game = games[gameId];
        require(
            game.status == GameStatus.Revealed || game.status == GameStatus.PrizeClaimed,
            "Result not ready"
        );
        return (msg.sender == game.winner);
    }

    /// @notice Get result for any player
    function getGameResult(uint256 gameId, address player) public view returns (string memory) {
        Game storage game = games[gameId];
        if (game.status == GameStatus.WaitingForChallenger || game.status == GameStatus.Challenged) {
            return "Pending";
        } else {
            if (player == game.winner) {
                return "Won";
            } else {
                return "Lost";
            }
        }
    }
}
