//Pair Prototype Project
//Authors: Alexander Robert and Milo Fisher
title = "Puzzle Platform";

description = `
Paddle follows mouse
Click - rotate
Hold - materialize
`;

characters = [
//a: character right side (anim 1 of 2)
`
llllll
ll l l
ll l l
llllll
 l  l
 l  l
`, 
//b: character right side (anim 2 of 2)
`
llllll
ll l l
ll l l
llllll
ll  ll
`,
//c: character left side (anim 1 of 2)
`
llllll
l l ll
l l ll
llllll
 l  l
 l  l
`,
//d: character left side (anim 2 of 2)
`
llllll
l l ll
l l ll
llllll
ll  ll
`,
//e: upward facing spike 
`
  ll 
 llll 
llllll
`, 
//f: downward facing spike (for static and falling spikes)
`
llllll
 llll 
  ll 
`,
//g: button, jump pad, teleport pad, 
`
 llll
bbbbbb
`,
//h: button clicked
`
llllllll
`,
//i: stairs left
`
l
ll
lll
llll
lllll
llllll
`,
//j: stairs right
`
     l
    ll
   lll
  llll
 lllll
llllll
`,
//k: the arrow head left
`
ll
llll 
llllll
llll 
ll
`,
//l: the arrow head right
`
    ll
  llll 
llllll
  llll 
    ll
`,
];

//Game constant for fine tuning important numbers and clarifying their usage.
const G = {
  WIDTH: 150,
  HEIGHT: 150,

  NPC_WIDTH: 6,
  NPC_HEIGHT: 6,
  NPC_X_SPEED: 0.7,
  NPC_Y_SPEED_JUMPING : 3,
  NPC_Y_SPEED_FALLING_MIN: 0.4,
  NPC_Y_SPEED_FALLING_MAX: 0.7,
  NPC_Y_ACCELERATION: 0.1,

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
* @property { number } Xspeed - The NPC horizontal speed
* @property { number } Yspeed - The NPC vertical speed
* @property { number } Yacceleration - The NPC vertical acceleration (change in speed)
* @property { number } side - the direction the character is facing
* @property { boolean } falling - if the player is falling or not
* @property { boolean } jumping - if the player is jumping or not
*/
let npc;

/**
* @typedef { object } PADDLE - The rectangle the player controls
* @property { Vector } pos - The current position of the object
* @property { String } type - type "paddle" specifies in an object list what object type this is and how it should behave
* @property { String } color - the current color of the paddle (visual indicator of collision mode)
* @property { String } rotation - either "horizontal" or "vertical"
* @property { number } height 
* @property { number } width 
*/
let paddle;
let paddleHold = false; //boolean for single execution of code per holding input
let inputTimer = 0; //timer variable to track holding input
const waitTime = 15; //how many ticks we should wait to determine holding vs tapping

let objectList = []; //the array of all objects we check for the NPC colliding with
let platformList = []; //the array of all objects we check for the NPC colliding with

let ground; //temp object to stop the player from falling forever

/*
Game Objects have the following properties:
pos: {x: int/float, y: int/float},
    color: string,
    width: int, (float width/height seems super gross, just don't do it)
    height: int,
    drawLabel: string, (string is either "rectangle" or a character letter EX. "e" indicates an upward facing spike)
    collisionFunction: () => {}, //the functions might be left empty on purpose //they might also simply call a function defined in code below
    updateFunction: () => {},
  };
*/
let upwardSpike, downwardSpike, fallingSpike, arrow, button, buttonToggle, jumpPad, teleportPad, stairsLeft, stairsRight;
//objects with additional properties:
//fallingSpike: speed (int)
//arrow: speed (int), side ("left" or "right")
//button: pressed (boolean)
//jumpPad: launchHeight (int)
//teleportPad: destination: {x: (int), y: (int)},

function update() {
  if (!ticks) { //INITIALIZE SECTION-----------------------------------------
    intializeGameObjects();
  }//END OF INIT SECTION-----------------------------------------------------

  //create ground platform right below the screen
  rect(ground.pos.x, ground.pos.y, ground.width, ground.height);

  updatePaddle(); //updatePaddle before updateNPC bc last drawn item gets displayed on top
  updateObjects();
  updateNPC();

  //console.log("Yspeed: " + npc.Yspeed + " jumping: " + npc.jumping +" falling: " + npc.falling);
}

function intializeGameObjects() {
  //define the NPC properties
  npc = {
    pos: vec(G.WIDTH * 0.5, G.HEIGHT - 7),
    //uses the constant base speed, but we want to modify it's sign
    Xspeed: G.NPC_X_SPEED, //so we have the speed property
    Yspeed: 0,
    Yacceleration: G.NPC_Y_ACCELERATION,
    side: "right",
    falling: true,
    jumping: false,
  };

  //define the paddle properties
  paddle = {
    pos: vec(G.WIDTH * 0.5, G.HEIGHT * 0.5),
    type: "paddle",
    color: "light_blue",
    rotation: "horizontal",
    width: 6,
    height: 24,
  };

  ground = {
    pos: vec(0, G.HEIGHT - 1),
    color: "light_black",
    width: G.WIDTH,
    height: 1
  };
  //isolate platforms to their own list?
  platformList.push(paddle);
  platformList.push(ground);

  //add all objects besides the NPC to the objectList
  
  //easy to implement
  upwardSpike = {
    pos: {x:25, y:40},
    color: "red",
    width: 6,
    height: 3,
    drawLabel: "e",
    collisionFunction: () => { console.log("NPC hit upwardSpike!")},
    updateFunction: () => {},
  };
  objectList.push(upwardSpike);

  //easy to implement
  downwardSpike = {
    pos: {x:25, y:50},
    color: "red",
    width: 6,
    height: 3,
    drawLabel: "f",
    collisionFunction: () => { console.log("NPC hit downwardSpike!")},
    updateFunction: () => {},
  };
  objectList.push(downwardSpike);

  //semi working
  fallingSpike = {
    pos: {x:25, y:5},
    color: "red",
    width: 6,
    height: 3,
    drawLabel: "f",
    collisionFunction: () => { console.log("NPC hit fallingSpike!")},
    updateFunction: () => {fallingSpike.pos.y += 1;},
  };
  objectList.push(fallingSpike);

  //semi working
  arrow = {
    side: "left", //left or right
    pos: {x:50, y:50},
    color: "red",
    width: 6,
    height: 3,
    drawLabel: "k",
    collisionFunction: () => { console.log("NPC hit arrow!")},
    updateFunction: () => { arrow.pos.x += (arrow.side == "left") ? 1 : -1;},
  };
  arrow.drawLabel = (arrow.side == "left") ? "k" : "l"; 
  objectList.push(arrow);
  
  //not implemented yet
  button = {
    pressed: false,
    pos: {x:50, y:30},
    color: "blue",
    width: 6,
    height: 3,
    drawLabel: "g",
    collisionFunction: () => { console.log("NPC pressed button!")},
    updateFunction: () => {},
  };
  objectList.push(button);
  
  //not implemented yet
  buttonToggle = {
    pressed: false,
    pos: {x:60, y:30},
    color: "green",
    width: 6,
    height: 3,
    drawLabel: "g",
    collisionFunction: () => { console.log("NPC pressed buttonToggle!")},
    updateFunction: () => {},
  };
  objectList.push(buttonToggle);

  //mostly working
  jumpPad = {
    launchHeight: 50,
    pos: {x:50, y:50},
    color: "cyan",
    width: 6,
    height: 3,
    drawLabel: "g",
    collisionFunction: () => { 
      console.log("NPC jumped on the jump pad!");
      npc.falling = false;
      npc.jumping = true;
      npc.Yspeed = G.NPC_Y_SPEED_JUMPING * -1; 
  },
    updateFunction: () => {},
  };
  objectList.push(jumpPad);

  //working
  teleportPad = {
    destination: {x: 80, y: G.HEIGHT - 2 - 20},
    pos: {x:80, y:50},
    color: "yellow",
    width: 6,
    height: 3,
    drawLabel: "g",
    collisionFunction: () => { console.log("NPC activated the teleport pad!");
    npc.pos.x = teleportPad.destination.x;
    npc.pos.y = teleportPad.destination.y;
  },
    updateFunction: () => { 
      //draw it's destination teleport pad (allows us to handle source and destination in the same object)
      color(teleportPad.color);
      char(teleportPad.drawLabel, teleportPad.destination.x, teleportPad.destination.y);
    },
  };
  objectList.push(teleportPad);

  //NOT WORKING
  stairsLeft = {
    pos: {x:6, y:50},
    color: "cyan",
    width: 6,
    height: 3,
    drawLabel: "i",
    collisionFunction: () => { console.log("NPC collided with stairs left!");},
    updateFunction: () => {},
  };
  objectList.push(stairsLeft);

  //NOT WORKING
  stairsRight = {
    pos: {x:G.WIDTH - 20, y: 50},
    color: "cyan",
    width: 6,
    height: 6,
    drawLabel: "j",
    collisionFunction: () => {
      console.log("NPC collided with stairs right!");
      //TODO: fit stairs into the special collision handling with platforms instead of disabling gravity
      //npc.pos.y -= abs(npc.Xspeed);
      npc.Yspeed = 0;
      npc.falling = false;
      npc.pos.y = stairsRight.pos.y - (stairsRight.height);
    },
    updateFunction: () => {},
  };
  objectList.push(stairsRight);
}

//Draws & moves animated NPC with running particles behind it 
function updateNPC() {
  //save old position of NPC for if collisions occur to revert back to old position before drawing
  let previousNPCProperties = {
    pos: vec(npc.pos),
    //uses the constant base speed, but we want to modify it's sign
    Xspeed: npc.Xspeed, //so we have the speed property
    Yspeed: npc.Yspeed,
    side: npc.side,
    falling: npc.falling,
    jumping: npc.jumping,
  }

  //TODO: see if slowing horizontal speed while falling feels better
  //have the NPC constantly move horizontally
  npc.pos.x += npc.Xspeed;
  //gravity for NPC
  if (npc.falling) {
    if (npc.Yspeed == 0) { npc.Yspeed = G.NPC_Y_SPEED_FALLING_MIN; }
    else if (npc.Yspeed > G.NPC_Y_SPEED_FALLING_MAX) { npc.Yspeed == G.NPC_Y_SPEED_FALLING_MAX; } //don't add any more Yspeed
    else { npc.Yspeed += npc.Yacceleration; } //acceleration!!!
    npc.pos.y += npc.Yspeed;
  }
  if(npc.jumping) {
      if (npc.Yspeed > 0) { npc.jumping = false; npc.falling = true; } //switch from jumping to falling
      else { npc.Yspeed += npc.Yacceleration;} //acceleration!!!
      npc.pos.y += npc.Yspeed;
  }
  else if (!npc.falling && !npc.jumping) { npc.Yspeed = 0; }

  //check if npc hits edge of screen
  if (npc.pos.x >= G.WIDTH || npc.pos.x <= 0) {
    changeDirection();
  }

  npc.pos.clamp(0, G.WIDTH, 0, G.HEIGHT); //safety line of code? not sure if it helps at all

  //TODO: check collisions right here before drawing the NPC
  //checkCollisions(previousNPCProperties);
  checkPlatformCollisions(previousNPCProperties);

  //draw the npc based on the direction they are facing
  //addWithCharCode seems to allow us to rotate the character letter 
  //between "a"&"b" or "c"&"d" respectively at a consistent framerate
  //AKA CrispGameLib's janky form of animation!!!!
  color("purple");
  if (npc.side == "right")
    char(addWithCharCode("a", floor(ticks / 15) % 2), npc.pos);
  else if (npc.side == "left")
    char(addWithCharCode("c", floor(ticks / 15) % 2), npc.pos);

  //create some particles while moving/falling
  let particleAngle = (npc.falling) ? (-PI / 2) : (-PI / 6);
  if (npc.Xspeed != 0) {
    color("black");
    let offset = (npc.side == "left") ? -3 : 3;
    particle(
      npc.pos.x - offset, // x coordinate
      npc.pos.y + 3, // y coordinate
      1, // The number of particles
      0.35, // The speed of the particles
      particleAngle, // The emitting angle
      PI / 2  // The emitting width
    );
  }
}

//takes object's properties to draw it, call it's own update funciton and check collisions with the NPC
function updateObjects() {
  for(let i = 0; i < objectList.length; i++) {

    objectList[i].updateFunction();

    color(objectList[i].color);
    if(objectList[i].drawLabel.length == 1) { //we're trying to draw a custom char image
      char(objectList[i].drawLabel, objectList[i].pos.x, objectList[i].pos.y);
    }
  }
  checkCollisions();
}

//checks all collisions between the objectList and the NPC
//if collision is found, call the objects collision callback function
function checkCollisions() {
  for (let i = 0; i < objectList.length; i++) {
    let npcX = npc.pos.x - (G.NPC_WIDTH / 2); //put the x position in the top left
    let npcY = npc.pos.y - (G.NPC_HEIGHT / 2);//put the y position in the top left
    //TODO: abstract the AA BB hitbox collision logic to be it's own function
    //name that function checkCollision and rename this function handleCollisions()
    //have handleCollisions() handle collision for NPC and collisions with other objects in the objectList
    //but do separate for loops for NPC (first) and for object on object collisions (second) for best performance
    //simple AA BB hitbox collision detection
    if (objectList[i].pos.x < npcX + G.NPC_WIDTH &&       //left   side
      objectList[i].pos.x + objectList[i].width > npcX && //right  side
      objectList[i].pos.y < npcY + G.NPC_HEIGHT &&        //top    side
      objectList[i].pos.y + objectList[i].height > npcY)  //bottom side
    {
      objectList[i].collisionFunction();
    }
  }
}

//special platform collision handling looking at all the sides of the player.
function checkPlatformCollisions(previousNPCProperties) {
  color("green");
  for (var i = 0; i < platformList.length; i++) {
    if (platformList[i].type == "paddle") {
      if (paddle.color == "blue")
        rect(platformList[i].pos, platformList[i].width, platformList[i].height);
    }
    else
      rect(platformList[i].pos, platformList[i].width, platformList[i].height);
  }

  color("red");
  // Bottom
  if (rect(vec(npc.pos.x - 3, npc.pos.y + 2), 6, 1).isColliding.rect.green) {
    //console.log("bottom of NPC");
    //run collision code
    npc.pos.y = previousNPCProperties.pos.y; //reset y position
  }
  // Bottom
  if (rect(vec(npc.pos.x - 3, npc.pos.y + 2), 6, 1).isColliding.rect.green) {
    //console.log("bottom of NPC");
    //run collision code
    npc.pos.y = previousNPCProperties.pos.y; //reset y position
  }
  // Top
  if (rect(vec(npc.pos.x - 3, npc.pos.y - 3), 6, 1).isColliding.rect.green) {
    //console.log("top of NPC");
    //run collision code
  }
  // Right
  if (rect(vec(npc.pos.x + 2, npc.pos.y - 2), 1, 5).isColliding.rect.green) {
    //console.log("right of NPC");
    //run collision code
    changeDirection();
  }
  // Left
  if (rect(vec(npc.pos.x - 3, npc.pos.y - 2), 1, 5).isColliding.rect.green) {
    //console.log("left of NPC");
    //run collision code
    changeDirection();
  }
}

//simply changes the NPC's direction, very simple code but reused in several areas
function changeDirection() {
  npc.side = (npc.side == "left") ? "right" : "left";
  npc.Xspeed *= -1;
}

//draws paddle, checks input types and updates the paddle accordingly 
function updatePaddle() {
  //check hold vs tap input
  if (input.isPressed && !input.isJustPressed) {
    //wait enough time to differentiate a click vs hold
    inputTimer += 1;
    if (inputTimer >= waitTime) //then we are holding the button
    {
      // Draw the paddle
      if (!paddleHold) { //bool to have holding execute holding logic once per hold
        paddleHold = true;
        //TODO: check if NPC and light blue paddle are colliding
        paddle.color = "blue";
        console.log("holding");
      }
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
      paddle.width = paddle.height;
      paddle.height = temp;
    }
    inputTimer = 0;
  }

  //if we're not currently holding the paddle, have it follow the cursor
  if (paddle.color != "blue") {
    paddle.pos.x = input.pos.x - (paddle.width / 2);
    paddle.pos.y = input.pos.y - (paddle.height / 2);
  }
  // Choose the correct color to draw
  color(paddle.color);
  // Draw the paddle
  rect(paddle.pos, paddle.width, paddle.height);
}