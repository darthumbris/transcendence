// import Paddle from './paddle.js';

class Paddle {
    constructor(game) {
        this.width = 150;
        this.height = 30;
        this.gameWidth = game.gameWidth;
        this.gameHeight = game.gameHeight;
        this.maxSpeed = 100;
        this.speed = 0;
        this.position = {
            x: this.gameWidth / 2 - this.width / 2,
            y: this.gameHeight - this.height - 10,
        }
    }

    moveLeft() {
        this.speed = -this.maxSpeed;
    }

    moveRight() {
        this.speed = this.maxSpeed;
    }

    stopPaddle() {
        this.speed = 0;
    }


    draw(ctx) {
        ctx.fillStyle = '#0f0c';
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    }

    update(deltaTime) {
        this.position.x += this.speed / deltaTime;
        if (this.position.x > this.gameWidth - this.width - 15)
            this.position.x = this.gameWidth - this.width - 15;
        if (this.position.x < 15)
            this.position.x = 15;
    }
}

class Ball {

    constructor(game) {
        this.image = document.getElementById('img_ball');
        this.gameHeight = game.gameHeight;
        this.gameWidth = game.gameWidth;
        this.game = game;
        this.size = 16;
        this.speed = {x: 4, y: -4};
        this.position = {x: this.gameWidth / 2, y: this.gameHeight - 50};
    }

    draw(ctx) {

        ctx.drawImage(this.image, Math.floor(this.position.x), Math.floor(this.position.y), this.size, this.size);
    }

    update(deltaTime) {
        this.position.x += this.speed.x;
        this.position.y += this.speed.y;

        // hit a wall on the right and left side
        if (this.position.x > this.gameWidth - this.size || this.position.x < 0)
            this.speed.x = -this.speed.x;
        //hit ceiling
        if (this.position.y < 0)
            this.speed.y = -this.speed.y;

        //hit floor
        if (this.position.y > this.gameHeight - this.size)
        {
            this.game.lives--;
            this.speed = {x: 4, y: -4};
            this.position = {x: this.gameWidth / 2, y: this.gameHeight - 50};
        }
        // collision with paddle
        collisionDetection(this, this.game.paddle);       
    }
 }

 class Brick {

    constructor(game, position) {
        this.image = document.getElementById('img_brick');
        this.gameHeight = game.gameHeight;
        this.gameWidth = game.gameWidth;
        this.game = game;
        this.deleteBrick = false;
        this.width = 64;
        this.height = 32;
        this.position = {
            x: position.x,
            y: position.y,
        }
    }

    update(deltaTime) {
        if (collisionDetection(this.game.ball, this))
            this.deleteBrick = true;
    }

    draw(ctx) {
        ctx.drawImage(
        this.image, 
        Math.floor(this.position.x), Math.floor(this.position.y), 
        this.width, this.height);
    }
 }

function detectCollisionDirection(ball, gameObject) {
    const hitFromLeft = () => ball.position.x + (ball.size) - ball.speed.x <= gameObject.position.x;
    const hitFromRight = () => ball.position.x - ball.speed.x >= gameObject.position.x + gameObject.width;

    if (hitFromLeft() || hitFromRight())
        ball.speed.x = -ball.speed.x;
    else
        ball.speed.y = -ball.speed.y;
}

 function collisionDetection(ball, gameObject) {

    let topObject = gameObject.position.y;
    let bottomObject = gameObject.position.y + gameObject.height;
    let leftSideObject = gameObject.position.x;
    let rightSideObject = gameObject.position.x + gameObject.width;
    let topBall = ball.position.y;
    let bottomBall = ball.position.y + ball.size;
    let leftSideBall = ball.position.x;
    let rightSideBall = ball.position.x + ball.size;

    if (leftSideBall >= leftSideObject &&
        rightSideBall <= rightSideObject &&
        ((bottomBall >= topObject && bottomBall < bottomObject) || 
        (topBall <= bottomObject && topBall > topObject))) {
            detectCollisionDirection(ball, gameObject);
            return true;
        }
    return false;
 }

let canvas = document.getElementById("gameScreen");
let ctx = canvas.getContext('2d');

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;

class InputHandler {
    constructor(paddle, game) {
        document.addEventListener('keydown', event => {
            switch(event.keyCode) {
                case 37:
                    paddle.moveLeft();
                    break;
                case 39:
                    paddle.moveRight();
                    break;
                case 27:
                    game.togglePause();
                    break;
                case 32:
                    game.start();
                    break;
                case 109: //debug
                    game.lives -= 1;
                    break;
            }
        });
        document.addEventListener('keyup', event => {
            switch(event.keyCode) {
                case 37:
                    if (paddle.speed < 0) paddle.stopPaddle();
                    break;
                case 39:
                    if (paddle.speed > 0) paddle.stopPaddle();
                    break;
            }
        });
    }
}

const level1 = [
    [0,1,0,1,0,1,0,1,0,1,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1],
    [0,0,0,0,0,0,0,0,0,0,0,0],
    [1,1,1,1,1,1,1,1,1,1,1,1]
];

const GAMESTATE = {
    PAUSED: 0,
    RUNNING: 1,
    MENU: 2,
    GAMEOVER: 3
};

function buildLevel(level, game) {
    let bricks = [];

    level.forEach((row, rowIndex) => {
        row.forEach((brick, brickIndex) => {
            if (brick === 1) {
                let position = {
                    x: 64 * brickIndex + brickIndex * 2, 
                    y: 32 * rowIndex + 32 + rowIndex * 3};
                bricks.push(new Brick(game, position));
            }
        });
    });
    return bricks;
}

class Game {

    constructor(gameWidth, gameHeight) {
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;
        this.gameState = GAMESTATE.MENU;
        this.paddle = new Paddle(this);
        this.ball = new Ball(this);
        new InputHandler(this.paddle, this);
        this.gameObjects = [];
        this.lives = 3;
    }

    start() {
        if (this.gameState != GAMESTATE.MENU) return;
        this.gameState = GAMESTATE.RUNNING;
        this.bricks = buildLevel(level1, game);
        this.gameObjects = [this.ball, this.paddle,...this.bricks];
    }

    update(deltaTime) {
        if (this.gameState != GAMESTATE.RUNNING) return;

        if (this.lives === 0) this.gameState = GAMESTATE.GAMEOVER;

        
        this.gameObjects.forEach(Object => Object.update(deltaTime));
        this.gameObjects = this.gameObjects.filter(object => !object.deleteBrick);
        console.log(deltaTime);
    }

    draw(ctx) {
        this.gameObjects.forEach(Object => Object.draw(ctx));
        if (this.gameState == GAMESTATE.PAUSED)
        {
            ctx.rect(0, 0, this.gameWidth, this.gameHeight);
            ctx.fillStyle = "rgba(0,0,0,0.5";
            ctx.fill();
            ctx.font = "30px Arial";
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.fillText("Paused", this.gameWidth / 2, this.gameHeight / 2);
        }
        if (this.gameState == GAMESTATE.MENU)
        {
            ctx.rect(0, 0, this.gameWidth, this.gameHeight);
            ctx.fillStyle = "rgba(0,0,0,1";
            ctx.fill();
            ctx.font = "30px Arial";
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.fillText("Press Space to Start", this.gameWidth / 2, this.gameHeight / 2);
        }
        if (this.gameState == GAMESTATE.GAMEOVER)
        {
            ctx.rect(0, 0, this.gameWidth, this.gameHeight);
            ctx.fillStyle = "rgba(255,0,0,0.8";
            ctx.fill();
            ctx.font = "30px Arial";
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.fillText("GAME OVER", this.gameWidth / 2, this.gameHeight / 2);
        }
    }

    togglePause() {
        if (this.gameState == GAMESTATE.PAUSED)
            this.gameState = GAMESTATE.RUNNING;
        else
            this.gameState = GAMESTATE.PAUSED;
    }
}

let lastTime = 0;
let game = new Game(GAME_WIDTH, GAME_HEIGHT);
// game.start();

function gameLoop(timeStamp) {
    let deltaTime = timeStamp - lastTime;
    lastTime = timeStamp;

    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    game.update(deltaTime);
    game.draw(ctx);
    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);