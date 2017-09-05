/**
 * Created by Guilherme Duarte on 02/05/2017.
 */
const GAME_STATE_PLAY = 0;
const GAME_STATE_PAUSE = 1;
const GAME_STATE_OVER = 2;
const GAME_STATE_MENU = 3;
const GAME_LEVEL_HARD = 2;
const GAME_LEVEL_MEDIUM = 1;
const GAME_LEVEL_EASY = 0;
const SNAKE_SIZE = 15;

var snake;
var myGameArea;
var apple;
var gameBackground;
var obstacles;
var gameSound;
var endSound;
var earnPointsSound;
var score_count;
var level = 0;
var colision = false;
var menu;
var easyText;
var normalText;
var hardText;
var gameOverText;
var gamePausedText;
var recordText;
var clickMenu;
var record;

function gameStart() {
    myGameArea.start();
    myGameArea.gameState = GAME_STATE_MENU;
    gameMenu();
    //SOUNDS
    gameSound = document.querySelector("#gameAudio");
    playGameSound();
    earnPointsSound = document.querySelector("#earnPoints");
    record = localStorage.getItem("snakeRecord");
}

// GAME MENU
function gameMenu(){
    menu = new component(0, 0, "JS SNAKE", 380, 40, "text");
    easyText = new component(90, 30, "EASY", 400, 120, "text");
    normalText = new component(90, 30, "NORMAL", 385, 160,"text");
    hardText = new component(90, 30, "HARD", 400, 200,  "text");
}

// GAME OVER
function gameOver() {
    gameOverText = new component(90, 30, "GAME OVER, LOOSER!", 400, 120, "text");
    recordText = new component(90, 30, "RECORD: "+record, 400, 180, "text");
    clickMenu = new component(90, 30, "Click and go to menu", 400, 210, "text");
}

// GAME INIT
function gameInit() {
    snake = [];
    obstacles = [];
    gameBackground = new component(myGameArea.canvas.width, myGameArea.canvas.height, "images/background.png", 0, 0, "img");
    snake[0] = new component(SNAKE_SIZE, SNAKE_SIZE, "rgb(64, 97, 54)", 40, 0);
    score = new component(0, 0,"Score: 0", 600, 40, "text");
    gamePausedText = new component(0, 0, "GAME PAUSED!", 400, 80, "text");
    score_count = 0;
    setGameLevel();
    snakeAddBody();
    generateObstacles();
    generateApple();
    myGameArea.gameState = GAME_STATE_PLAY;
}

// ATTACH GAME LEVE
function setGameLevel(){
    if(level == GAME_LEVEL_MEDIUM){
        snake[0].speed = 10;
    } else if(level == GAME_LEVEL_EASY){
        snake[0].speed = 5;
    } else {
        snake[0].speed = 15;
        colision = true;
    }
}

function generateObstacles(){
    for (let i = 0 ; i < 6*level ; i++ ){
        let w = Math.floor((Math.random()*80)+10);
        let h = Math.floor((Math.random()*80)+10);
        let x = Math.floor(Math.random() * myGameArea.canvas.width-15) + 1;
        let y = Math.floor(Math.random() * myGameArea.canvas.width-15) + 1;
        let newObstacle = new component(w, h, "rgb(119, 87, 71)",x, y);
        do{
            snake.forEach(function (part) {
                if(part.verifyCollision(newObstacle)){
                    generateObstacles();
                    return;
                }
            })
        } while (snake.forEach(function (part) {
            part.verifyCollision(newObstacle)
        }));
        obstacles.push(newObstacle);
    }
}

// CREATE THE GAME AREA
myGameArea = {
    canvas : document.createElement("canvas"),
    start : function() {
        this.gameState = GAME_STATE_PLAY;
        this.canvas.width = 800;
        this.canvas.height = 800;
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        this.fps = 60;
        this.frame = 0;
        this.gameFrequency = 1000 / this.fps;
        this.frequency = 1 / this.fps;
        this.interval = setInterval(updateGame, this.gameFrequency);
    },
    clear : function(){
        this.context.clearRect(0,0,this.canvas.width, this.canvas.height);
    },
    stop : function(){
        clearInterval(this.interval);
    }
}

// CREATE A NEW COMPONENT
function component (width, height, src, x, y, type) {
    // DEFAULT CONFIGS
    this.width = width;
    this.height = height;
    this.type = type;
    this.x = x;
    this.y = y;
    this.speed = 0;
    this.direction = [1, 0];
    this.context = myGameArea.context;
    if(this.type == "img"){
        this.image = new Image;
        this.image.src = src;
    } else {
        this.image = src;
    }
    // RENDER THE OBJECT
    this.render = function () {
        if(this.type == "img"){
            this.context.drawImage(this.image, this.x, this.y, this.width, this.height);
        } else if(this.type == "text"){
            this.context.font = "20px Arial";
            this.context.fillStyle = "black";
            this.context.fillText(this.image, this.x, this.y);
        } else {
            this.context.fillStyle = src;
            this.context.fillRect(this.x, this.y, this.width, this.height);
        }
    }
    // VERIFY COLLISION BETWEEN OBJECTS
    this.verifyCollision = function(otherObj){
        // THIS OBJECT
        var myLeft = this.x;
        var myRight = this.x + this.width;
        var myTop = this.y;
        var myBottom = this.y + this.height;
        // OTHER OBJECT
        var otherLeft = otherObj.x;
        var otherRight = otherObj.x + otherObj.width;
        var otherTop = otherObj.y;
        var otherBottom = otherObj.y + otherObj.height;
        var crash = true;
        // VERIFY THE COLLISION HYPOTHESIS
        if((myBottom < otherTop) ||
            (myTop > otherBottom) ||
            (myRight < otherLeft) ||
            (myLeft > otherRight)){
            crash = false;
        }
        return crash;
    }

    // MOVE THE OBJECT
    this.movePosition = function(){
        this.x += this.speed * this.direction[0];
        this.y += this.speed * this.direction[1];
        if(!colision){
            if(this.x >= myGameArea.canvas.width){
                this.x = 0;
            }else if(this.x <= 0){
                this.x = myGameArea.canvas.width;
            }
            if(this.y >= myGameArea.canvas.height){
                this.y = 0;
            } else if(this.y < 0){
                this.y = myGameArea.canvas.height;
            }
        } else {
            if(this.x > myGameArea.canvas.width || this.x < 0 || this.y > myGameArea.canvas.height || this.y < 0){
                myGameArea.gameState = GAME_STATE_OVER;
                gameOver();
            }
        }
    }

    // VERIFY THE CLICK
    this.clicked = function (cx, cy) {
        if ((cx => (this.x-5) && cx <= (this.x+this.width+5))
            && (cy >= (this.y-5) && cy <= (this.y+this.height+5))){
            return true;
        }
        return false;
    }
}

// UPDATE GAME FUNCTION
function updateGame(){
    if(myGameArea.gameState == GAME_STATE_PLAY){
        myGameArea.clear();
        gameBackground.render();
        snakeMove();
        snake.forEach(function (part) {
            part.render();
        })
        apple.render();
        score = new component(0, 0, "Score: "+ score_count, 500, 40, "text");
        score.render();
        obstacles.forEach(function (obstacle) {
            obstacle.render();
        })
        myGameArea.frame++;
        if(myGameArea.frame == 60){
            myGameArea.frame = 0;
        }
    } else if (myGameArea.gameState == GAME_STATE_OVER){
        if (score_count > record){
            localStorage.setItem("snakeRecord", score_count);
            record = score_count;
        }
        localStorage.getItem("snakeRecord");
        menu.render();
        gameOverText.render();
        recordText.render();
        clickMenu.render();
    } else if(myGameArea.gameState == GAME_STATE_MENU){
        myGameArea.clear();
        menu.render();
        easyText.render();
        normalText.render();
        hardText.render();
    } else if (myGameArea.gameState == GAME_STATE_PAUSE){
        gamePausedText.render();
    }
}

// SET THE SNAKE MOVEMENT
function snakeMove(){
    if(myGameArea.frame % 3 == 0){
        var oldX = snake[0].x;
        var oldY = snake[0].y;
        var helper;
        snake[0].movePosition();
        score_count += 1;
        for(let i = 0; i < snake.length ; i++){
            if(i > 0){
                if (snake[0].direction[0] == 1){
                    helper = snake[i].x;
                    snake[i].x = oldX-(level+1);
                    oldX = helper;
                } else if (snake[0].direction[0] == -1){
                    helper = snake[i].x;
                    snake[i].x = oldX+(level+1);
                    oldX = helper;
                } else {
                    helper = snake[i].x;
                    snake[i].x = oldX;
                    oldX = helper;
                }
                if (snake[0].direction[1] == 1){
                    helper = snake[i].y;
                    snake[i].y = oldY-(level+1);
                    oldY = helper;
                } else if (snake[0].direction[1] == -1){
                    helper = snake[i].y;
                    snake[i].y = oldY+(level+1);
                    oldY = helper;
                } else {
                    helper = snake[i].y;
                    snake[i].y = oldY;
                    oldY = helper;
                }
            }
        }
    }
    for(let i = 3 ; i < snake.length ; i ++){
        if(snake[0].verifyCollision(snake[i])){
            myGameArea.gameState = GAME_STATE_OVER;
            gameOver();
        }
    }
    // VERIFY IF IT TAKES THE APPLE
    if(snake[0].verifyCollision(apple)){
        snakeAddBody();
        generateApple();
        playEarnPoints();
        score_count += 250;
    }

    // VERIFY OBSTACLE COLISION
    obstacles.forEach(function (obstacle) {
        if(obstacle.verifyCollision(snake[0])){
            myGameArea.gameState = GAME_STATE_OVER;
            gameOver();
        }
    })
}

// ADD A SNAKE BODY PART
function snakeAddBody(){
    let x = snake[snake.length-1].x;
    let y = snake[snake.length-1].y;
    for (let i = 0 ; i < 2 ; i++){
        snake.push(new component(SNAKE_SIZE, SNAKE_SIZE, "rgb(64, 160, 54)", x, y));
    }
}

// GENERATE THE APPLE
function generateApple(){
    let x = Math.floor(Math.random() * myGameArea.canvas.width-15) + 1;
    let y = Math.floor(Math.random() * myGameArea.canvas.width-15) + 1;
    apple = new component(15, 15, "images/apple.png", x+5, y+5, "img");
    // VERIFY IF THE APPLE ISN'T IN A SNAKE PART
    do{
        snake.forEach(function (part) {
            if(part.verifyCollision(apple)){
                generateApple();
                return;
            }
        })
    } while (snake.forEach(function (part) {
        part.verifyCollision(apple)
    }));
    do{
        obstacles.forEach(function (part) {
            if(part.verifyCollision(apple)){
                generateApple();
                return;
            }
        })
    } while (obstacles.forEach(function (part) {
        part.verifyCollision(apple)
    }));
}

// CONTROLLER
window.addEventListener("keydown", function (key) {

    function clearDirection() {
        snake[0].direction[0] = 0;
        snake[0].direction[1] = 0;
    }

    switch (key.key){
        case "w":
            if(snake[0].direction[1] != 1){
                clearDirection();
                snake[0].direction[1] = -1;
            }
            break;
        case "a":
            if(snake[0].direction[0] != 1){
                clearDirection();
                snake[0].direction[0] = -1;
            }
            break;
        case "s":
            if(snake[0].direction[1] != -1){
                clearDirection();
                snake[0].direction[1] = 1;
            }
            break;
        case "d":
            if(snake[0].direction[0] != -1){
                clearDirection();
                snake[0].direction[0] = 1;
            }
            break;
        case "p":
            if(myGameArea.gameState != GAME_STATE_OVER && myGameArea.gameState != GAME_STATE_MENU && myGameArea.gameState != GAME_STATE_PAUSE){
                myGameArea.gameState = GAME_STATE_PAUSE;
                break;
            }else if(myGameArea.gameState != GAME_STATE_OVER && myGameArea.gameState != GAME_STATE_MENU) {
                myGameArea.gameState = GAME_STATE_PLAY;
                break;
            }
            break;
    }
})


window.addEventListener("mousedown", function (click) {
    let cx = click.pageX;
    let cy = click.pageY;
    if(myGameArea.gameState == GAME_STATE_MENU){
        if(easyText.clicked(cx, cy)){
            level = GAME_LEVEL_EASY;
            gameInit();
        } else if(normalText.clicked(cx, cy)){
            level = GAME_LEVEL_MEDIUM;
            gameInit();
        } else if (hardText.clicked(cx, cy)) {
            level = GAME_LEVEL_HARD;
            gameInit();
        }
    } else if(myGameArea.gameState == GAME_STATE_OVER){
        myGameArea.gameState = GAME_STATE_MENU;
    }
})

// GAME AUDIOS
function playGameSound() {
    gameSound.src = "sounds/game-.mp3";
    gameSound.loop = true;
    gameSound.play();
}

function playEarnPoints(){
    earnPointsSound.src = "sounds/ganha_fruta.mp3";
    earnPointsSound.loop = false;
    earnPointsSound.volume = 0.1;
    earnPointsSound.play();
}
