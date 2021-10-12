//Pair Prototype Project
//Authors: Alexander Robert and Milo Fisher
title = "Puzzle Platform";

description = `
Paddle follows mouse
Click - rotate
Hold - materialize
`;

characters = [`
llllll
ll l l
ll l l
llllll
 l  l
 l  l
`, `
llllll
ll l l
ll l l
llllll
ll  ll
`, `
llllll
l l ll
l l ll
llllll
 l  l
 l  l
`, `
llllll
l l ll
l l ll
llllll
ll  ll
`
];

//Game constant for fine tuning important numbers and clarifying their usage.
const G = {
  WIDTH: 150,
  HEIGHT: 150,

  NPC_SPEED: 0.7,
  NPC_WIDTH: 6,
  NPC_HEIGHT: 6,

  //maybe have some simple form of acceleration?
  FALLING_SPEED_MIN: 0.4,
  FALLING_SPEED_MAX: 0.7,
};

//Important settings that define key aspects of the game, e.g. viewport, music, etc.
options = {
  viewSize: { x: G.WIDTH, y: G.HEIGHT },
  //isPlayingBgm: true,
  //seed: 7,
  //isReplayEnabled: true,
  //theme: "dark",
};

/**
* @typedef { object } NPC - The object the player is guiding through the game
* @property { Vector } pos - The current position of the object
* @property { number } speed - The NPC speed
* @property { number } side - the direction the character is facing
*/
let npc;

/**
* @typedef { object } PADDLE - The rectangle the player controls
* @property { () => void } callbackFunction - The collision callback function
* @property { Vector } pos - The current position of the object
* @property { String } color - the current color of the paddle (visual indicator of collision mode)
* @property { String } rotation - either "horizontal" or "vertical"
* @property { number } length 
* @property { number } width 
*/
let paddle;
let paddleHold = false; //boolean for single execution of code per holding input

let objectList = []; //the array of all objects we check for the NPC colliding with

let inputTimer = 0; //timer variable to track holding input
const waitTime = 15; //how many ticks we should wait to determine holding vs tapping

function update() {
  if (!ticks) { //INITIALIZE SECTION-----------------------------------------
    //define the NPC properties
    npc = {
      pos: vec(G.WIDTH * 0.5, G.HEIGHT - 3),
      //uses the constant base speed, but we want to modify it's sign
      speed: G.NPC_SPEED, //so we have the speed property
      side: "right",
    };

    //define the paddle properties
    paddle = {
      pos: vec(G.WIDTH * 0.5, G.HEIGHT * 0.5),
      color: "light_blue",
      callbackFunction: () => { if (paddle.color == "blue") { changeDirection(); } },
      rotation: "horizontal",
      length: 24,
      width: 6
    }

    //add all objects besides the NPC to the objectList
    objectList.push(paddle);
  }//END OF INIT SECTION-----------------------------------------------------

  updateNPC();
  updatePaddle();
}

//Draws & moves animated NPC with running particles behind it 
function updateNPC() {
  //have the npc constantly move horizontally
  npc.pos.x += npc.speed;

  //check if npc hits edge of screen
  if (npc.pos.x >= G.WIDTH || npc.pos.x <= 0) {
    changeDirection();
  }

  checkCollisions();

  npc.pos.clamp(0, G.WIDTH, 0, G.HEIGHT); //safety line of code? not sure if it helps at all

  //draw the npc based on the direction they are facing
  //addWithCharCode seems to allow us to rotate the character letter 
  //between "a"&"b" or "c"&"d" respectively at a consistent framerate
  //AKA CrispGameLib's janky form of animation!!!!
  color("purple");
  if (npc.side == "right")
    char(addWithCharCode("a", floor(ticks / 15) % 2), npc.pos);
  else if (npc.side == "left")
    char(addWithCharCode("c", floor(ticks / 15) % 2), npc.pos);

  //create some particles while moving
  if (npc.speed != 0) {
    color("black");
    let offset = (npc.side == "left") ? -3 : 3;
    particle(
      npc.pos.x - offset, // x coordinate
      npc.pos.y + 3, // y coordinate
      1, // The number of particles
      0.35, // The speed of the particles
      -PI / 2, // The emitting angle
      PI / 2  // The emitting width
    );
  }
}

//checks all collisions between the objectList and the NPC
//if collision is found, call the objects collision callback function
function checkCollisions() {
  for (let i = 0; i < objectList.length; i++) {
    let npcX = npc.pos.x - (G.NPC_WIDTH / 2); //put the x position in the top left
    let npcY = npc.pos.y - (G.NPC_HEIGHT / 2);//put the y position in the top left
    //simple AA BB hitbox collision detection
    if (objectList[i].pos.x < npcX + G.NPC_WIDTH &&       //left   side
      objectList[i].pos.x + objectList[i].width > npcX && //right  side
      objectList[i].pos.y < npcY + G.NPC_HEIGHT &&        //top    side
      objectList[i].pos.y + objectList[i].length > npcY)  //bottom side
      {
       
      //TODO: figure out why these ifs aren't working and properly determine which side the NPC collided with
            //then replace console.logs with callbackFunctions("left/right/top/bottom side") respectively
            //collision functions the require special handling of certain side collisions need some parameter
            //NOTE: top and bottom collions take precedence
      //we collided with an object, now have the object handle its own collision with the NPC
      if (objectList[i].pos.x < npcX + 1 + G.NPC_WIDTH)
        console.log("left side");
      if (objectList[i].pos.x + objectList[i].width > npcX - 1)
        console.log("right side");
      if (objectList[i].pos.y < npcY + 1 + G.NPC_HEIGHT)
        console.log("top side");
      if (objectList[i].pos.y + objectList[i].length > npcY - 1)
        console.log("bottom side");

      objectList[i].callbackFunction();
    }
  }
}

//simply changes the NPC's direction, very simple code but reused in several areas
function changeDirection() {
  npc.side = (npc.side == "left") ? "right" : "left";
  npc.speed *= -1;
}

//draws paddle, checks input types and updates the paddle accordingly 
function updatePaddle() {
  //check hold vs tap input
  if (input.isPressed && !input.isJustPressed) {
    //wait enough time to differentiate a click vs hold
    inputTimer += 1;
    if (inputTimer >= waitTime) //then we are holding the button
      if (!paddleHold) {
        paddleHold = true;
        paddle.color = "blue";
        console.log("holding");
        
      }
    }
    if (input.isJustReleased) {
      //if the player held the input
      if (inputTimer >= waitTime) {
        paddleHold = false;
        paddle.color = "light_blue";
      console.log("hold reset");
      //reset the paddleHold boolean toggle
    }
    else { //otherwise they didn't hold the button long enough, AKA they clicked
      console.log("clicked!");
      //rotate the paddle!    
      paddle.rotation = (paddle.rotation == "horizontal") ? "vertical" : "horizontal";
      let temp = paddle.width;
      paddle.width = paddle.length;
      paddle.length = temp;
    }
    inputTimer = 0;
  }

  //if we're not currently holding the paddle, have it follow the cursor
  if(paddle.color != "blue") {
    paddle.pos.x = input.pos.x - (paddle.width/2);
    paddle.pos.y = input.pos.y - (paddle.length/2);
  }
  // Choose the correct color to draw
  color(paddle.color);
  // Draw the paddle
  rect(paddle.pos, paddle.width, paddle.length);
}