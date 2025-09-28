// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title SimplePlayerVsPlayerGame
 * @notice A simplified player vs player guessing game without FHE for testing
 */
contract SimplePlayerVsPlayerGame {
    // --- Data Structures ---
    enum GameStatus {
        WaitingForChallenger,  // Player 1 created game, waiting for Player 2
        Challenged,            // Player 2 has challenged, game complete
        Revealed,              // Results revealed to both players
        PrizeClaimed           // Winner has claimed prize
    }

    struct Game {
        uint256 gameId;
        address player1;
        address player2;
        uint256 betAmount;
        GameStatus status;
        uint32 player1Choice;  // Simple uint32 instead of encrypted
        uint32 player2Guess;   // Simple uint32 instead of encrypted
        address winner;
        uint256 createdAt;
    }

    // --- State Variables ---
    mapping(uint256 => Game) public games;
    uint256 public gameCounter;

    // --- Events ---
    event GameCreated(uint256 indexed gameId, address indexed player1, uint256 betAmount);
    event GameChallenged(uint256 indexed gameId, address indexed player2, uint256 betAmount);
    event GameRevealed(uint256 indexed gameId, address indexed winner, uint256 prize);
    event PrizeClaimed(uint256 indexed gameId, address indexed winner, uint256 amount);

    // --- Core Functions ---

    /**
     * @notice Player 1 creates a new game with their choice
     * @param _choice Player 1's choice (1 or 2)
     */
    function createGame(uint32 _choice) public payable {
        require(msg.value > 0, "Bet amount must be greater than 0");
        require(_choice == 1 || _choice == 2, "Choice must be 1 or 2");
        
        uint256 gameId = gameCounter++;
        Game storage newGame = games[gameId];
        
        newGame.gameId = gameId;
        newGame.player1 = msg.sender;
        newGame.betAmount = msg.value;
        newGame.status = GameStatus.WaitingForChallenger;
        newGame.player1Choice = _choice;
        newGame.createdAt = block.timestamp;

        emit GameCreated(gameId, msg.sender, msg.value);
    }

    /**
     * @notice Player 2 challenges a game with their guess
     * @param gameId The game to challenge
     * @param _guess Player 2's guess (1 or 2)
     */
    function challengeGame(uint256 gameId, uint32 _guess) public payable {
        Game storage game = games[gameId];
        
        require(game.status == GameStatus.WaitingForChallenger, "Game not available for challenge");
        require(msg.sender != game.player1, "Cannot challenge your own game");
        require(msg.value == game.betAmount, "Must match the bet amount");
        require(_guess == 1 || _guess == 2, "Guess must be 1 or 2");
        
        game.player2 = msg.sender;
        game.player2Guess = _guess;
        game.status = GameStatus.Challenged;
        
        // Immediately reveal the result
        _revealGame(gameId);
        
        emit GameChallenged(gameId, msg.sender, msg.value);
    }

    /**
     * @notice Internal function to reveal game results
     * @param gameId The game to reveal
     */
    function _revealGame(uint256 gameId) internal {
        Game storage game = games[gameId];
        
        require(game.status == GameStatus.Challenged, "Game not ready for reveal");
        
        // Check if player2's guess matches player1's choice
        bool player2Wins = (game.player2Guess == game.player1Choice);
        
        if (player2Wins) {
            game.winner = game.player2;
        } else {
            game.winner = game.player1;
        }
        
        game.status = GameStatus.Revealed;
        
        uint256 totalPrize = game.betAmount * 2;
        emit GameRevealed(gameId, game.winner, totalPrize);
    }

    /**
     * @notice Winner claims their prize
     * @param gameId The game to claim prize from
     */
    function claimPrize(uint256 gameId) public {
        Game storage game = games[gameId];
        
        require(game.status == GameStatus.Revealed, "Game not ready for prize claim");
        require(msg.sender == game.winner, "Only winner can claim prize");
        
        uint256 prize = game.betAmount * 2;
        game.status = GameStatus.PrizeClaimed;
        
        payable(game.winner).transfer(prize);
        
        emit PrizeClaimed(gameId, game.winner, prize);
    }

    // --- View Functions ---
    
    function getGame(uint256 gameId) public view returns (Game memory) {
        return games[gameId];
    }
    
    function getGameCount() public view returns (uint256) {
        return gameCounter;
    }
}
