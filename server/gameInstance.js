const MoveTimeoutSeconds = 30;

class GameInstance {
    
    constructor(instance, gameState, io) {
        this.instance = instance;
        this.gameState = gameState;
        this.io = io;
        this.gameState.players = {};
        setTimeout(() => this.doGameLoop(), 3000); 
    }

    doGameLoop() {
        // each player broadcast scenario for location and game state
        let tickCounter = 0;
        let ticker = setInterval(() => {
            
            if(tickCounter < MoveTimeoutSeconds) {
                console.log(tickCounter);
                this.io.to(this.instance).emit('game-timer', { count: tickCounter, max: MoveTimeoutSeconds });
            }
            else {
                clearInterval(ticker);
                this.processActions();
                this.doGameLoop();
            }
            tickCounter++;
        }, 1000);
    }

    processActions() {
        console.log('Process actions...');
    }

}

module.exports = GameInstance;