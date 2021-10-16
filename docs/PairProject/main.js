//Pair Prototype Project
//Authors: Alexander Robert and Milo Fisher

title = "Puzzle Platform";

description = `
Paddle follows mouse
Click - rotate
Hold - materialize
`;

characters = 
[//a: character right side (anim 1 of 2)
`
llllll
ll l l
ll l l
llllll
 l  l
 l  l
`,//b: character right side (anim 2 of 2)
`
llllll
ll l l
ll l l
llllll
ll  ll
`,//c: character left side (anim 1 of 2)
`
llllll
l l ll
l l ll
llllll
 l  l
 l  l
`,//d: character left side (anim 2 of 2)
`
llllll
l l ll
l l ll
llllll
ll  ll
`,//e: upward facing spike 
`
  l
  l
 lLl
 lLl
lLLLl 
lLLLl
`,//f: downward facing spike (for static and falling spikes)
`
lLLLl
lLLLl 
 lLl
 lLl
  l
  l 
`,//g: teleport pad, 
`
  cc
 cCCc
cCCCCc
cCCCCc
 cCCc
LLccLL
`,//h: button clicked
`
llllllll
`,//i: stairs left
`
l
ll
lll
llll
lllll
llllll
`,//j: stairs right
`
     l
    ll
   lll
  llll
 lllll
llllll
`,//k: the arrow head left
`
ll
lLll 
lLLLll
lLll 
ll
`,//l: the arrow head right
`
    ll
  llLl 
llLLLl
  llLl 
    ll
`,//m: jump pad, 
`
 gggg
bbbbbb
`,//n: teleport pad receiver 
`
  cc
 cCCc
cCCCCc
cCCCCc
 cCCc
LLccLL
`,//o: end flag
`
yyyyy
yyyyy
yyyyy
L
L
L
L
`
];

const SETTINGS = {
  WIDTH: 120,
  HEIGHT: 120,

  WAIT_TIME: 10,
  LAYOUT_WIDTH: 3,
  NPC_WIDTH: 6,
  NPC_HEIGHT: 6,
  NPC_X_SPEED: 0.7,
  NPC_Y_SPEED_JUMPING: 3,
  NPC_Y_SPEED_FALLING_MIN: 0.4,
  NPC_Y_SPEED_FALLING_MAX: 0.7,
  NPC_Y_ACCELERATION: 0.1,
  BASE_OFFSET_X: 60,
  BASE_OFFSET_Y: 60,
};

options = {
  viewSize: {x: SETTINGS.WIDTH, y:SETTINGS.HEIGHT},
  isDrawingParticleFront: true,
  //isPlayingBgm: true,
  //seed: 7,
  //isReplayEnabled: true,
  //theme: "dark",
};

// Global Variables
let roomLayout;
let currentRoom;
let startRoomTypes;
let roomTypes;
let npc;
let paddle;
let paddleHold; //boolean for single execution of code per holding input
let inputTimer; //timer variable to track holding input
let objectList; //the array of all objects we check for the NPC colliding with
let platformList; //the array of all objects we check for the NPC colliding with
let ground; //temp object to stop the player from falling forever
let cameraPanning;
let worldOffsetX;
let worldOffsetY;
const unit = 6;
const stairOffset = 3;
const teleportOffset = 3;
const jumpPadOffsetX = 3;
const jumpPadOffsetY = 5;
const spikeOffset = 3;
const arrowOffset = 2;
const exitOffsetX = 2;
const exitOffsetY = 3;

// Called once upon initialization
function start() {
  //Initialize variables
  worldOffsetX = 0;
  worldOffsetY = 0;
  cameraPanning = 0;
  paddleHold = false;
  inputTimer = 0;
  objectList = [];
  platformList = [];
  startRoomTypes = [0]; // Store all variations of the start room in this array
  roomTypes = [new t0(), new t1(), new t2(), new t3(), new t4(), new t5(), new t6(), new t7(), new t8(), new t9(), new t10(), new t11(), new t12(), new t13(), new t14(), new t15(), new t16(), new t17(), new t18(), new t19()];
  roomLayout = [];
  currentRoom = undefined;
  currentRoom = generateRoom();
  for(var i = 0; i < 10; i++) {
    currentRoom = generateRoom();
  }
  console.log(roomLayout);

  //define the NPC properties
  npc = {
    pos: vec(SETTINGS.BASE_OFFSET_X - 8.5 * 6, SETTINGS.BASE_OFFSET_Y + 8.5 * 6),
    //uses the constant base speed, but we want to modify it's sign
    Xspeed: SETTINGS.NPC_X_SPEED, //so we have the speed property
    Yspeed: 0,
    Yacceleration: SETTINGS.NPC_Y_ACCELERATION,
    side: "right",
    falling: true,
    jumping: false,
    onStairs: false,
  };

  //define the paddle properties
  paddle = {
    pos: vec(SETTINGS.WIDTH * 0.5, SETTINGS.HEIGHT * 0.5),
    type: "paddle",
    color: "light_blue",
    rotation: "horizontal",
    width: 6,
    height: 24,
  };

  ground = {
    pos: vec(0, SETTINGS.HEIGHT - 1),
    color: "light_black",
    width: SETTINGS.WIDTH,
    height: 1
  };
  //isolate platforms to their own list?
  platformList.push(ground);

  //add all objects besides the NPC to the objectList
  // objectList.push(new upwardSpike(25, 40));
  // objectList.push(new downwardSpike(25, 50));
  // objectList.push(new fallingSpike(25, 5, npc.pos.y + 3));
  // objectList.push(new arrow(0, npc.pos.y + 2, 150));
  // objectList.push(new arrow(300, npc.pos.y + 2, 150));
  //objectList.push(new button(50, 30));
  //objectList.push(new buttonToggle(60, 30));
  // objectList.push(new jumpPad(240, npc.pos.y + 5)); 
  // objectList.push(new teleportPad(80, 50, 80, npc.pos.y - 86)); 
  // objectList.push(new stairsLeft(40, npc.pos.y + 3)); 
  // objectList.push(new stairsLeft(34, npc.pos.y - 3));
  // objectList.push(new stairsLeft(28, npc.pos.y - 9));
  // objectList.push(new stairsLeft(22, npc.pos.y - 15));
  // objectList.push(new stairsRight(60, npc.pos.y + 3)); 
  // objectList.push(new stairsRight(66, npc.pos.y - 3));
  // objectList.push(new stairsRight(72, npc.pos.y - 9));
  // objectList.push(new stairsRight(78, npc.pos.y - 15));
}

// Called every frame, 60 fps
function update() {
  if (!ticks) { start(); }

  panning();
  drawPhysicsObjects();
  updateBackground();
  updatePaddle();
  updatePlatforms();
  updateObjects();
  updateNPC();
}

function panning() {
  if(cameraPanning > 0) {
    cameraPanning -= 1;
    worldOffsetX -= 1;
  }
}

function panCamera() {
  if(cameraPanning == 0){
    cameraPanning = 120;
    paddleHold = false;
    paddle.color = "light_blue";
  }
  console.log("Panning Camera");
}

function gameOver() {
  console.log("Game Over!");
  end();
}

function updateBackground(){
  for(var r = 0; r < roomLayout.length; r++) {
    for(var c = 0; c < SETTINGS.LAYOUT_WIDTH; c++) {
      if(roomLayout[r][c] != undefined) {
        if (r % 2 == 0 ? c % 2 == 0 : c % 2 == 1){
          color("light_green");
        } else {
          color("light_yellow");
        }
        box(c * 120 + SETTINGS.BASE_OFFSET_X + worldOffsetX, r * -120 + SETTINGS.BASE_OFFSET_Y + worldOffsetY, 120);
      }
    }
  }
}

function drawPhysicsObjects() {
  color("light_cyan");
  box(npc.pos.x + worldOffsetX, npc.pos.y + worldOffsetY, 6);
  color("green");
  if(paddle.color == "blue") {
    rect(paddle.pos.x + worldOffsetX, paddle.pos.y + worldOffsetY, paddle.width, paddle.height);
  }
  for (var i = 0; i < platformList.length; i++) {
    rect(platformList[i].pos.x + worldOffsetX, platformList[i].pos.y + worldOffsetY, platformList[i].width, platformList[i].height);
  }
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
    if (npc.Yspeed == 0) { npc.Yspeed = SETTINGS.NPC_Y_SPEED_FALLING_MIN; }
    else if (npc.Yspeed > SETTINGS.NPC_Y_SPEED_FALLING_MAX) { npc.Yspeed == SETTINGS.NPC_Y_SPEED_FALLING_MAX; } //don't add any more Yspeed
    else { npc.Yspeed += npc.Yacceleration; } //acceleration!!!
    npc.pos.y += npc.Yspeed;
  }
  if (npc.jumping) {
    if (npc.Yspeed > 0) { npc.jumping = false; npc.falling = true; } //switch from jumping to falling
    else { npc.Yspeed += npc.Yacceleration; } //acceleration!!!
    npc.pos.y += npc.Yspeed;
  }
  else if (!npc.falling && !npc.jumping) { npc.Yspeed = 0; }

  //check if npc hits edge of screen
  // if (npc.pos.x + worldOffsetX >= SETTINGS.WIDTH || npc.pos.x + worldOffsetX <= 0) {
  //   changeDirection();
  // }

  // npc.pos.clamp(worldOffsetX, SETTINGS.WIDTH + worldOffsetX, worldOffsetY, SETTINGS.HEIGHT + worldOffsetY); //safety line of code? not sure if it helps at all

  //TODO: check collisions right here before drawing the NPC
  //checkCollisions(previousNPCProperties);
  checkPlatformCollisions(previousNPCProperties);

  //draw the npc based on the direction they are facing
  //addWithCharCode seems to allow us to rotate the character letter 
  //between "a"&"b" or "c"&"d" respectively at a consistent framerate
  //AKA CrispGameLib's janky form of animation!!!!
  color("purple");
  if (npc.side == "right")
    char(addWithCharCode("a", floor(ticks / 15) % 2), npc.pos.x + worldOffsetX, npc.pos.y + worldOffsetY);
  else if (npc.side == "left")
    char(addWithCharCode("c", floor(ticks / 15) % 2), npc.pos.x + worldOffsetX, npc.pos.y + worldOffsetY);

  //create some particles while moving/falling
  let particleAngle = (npc.falling) ? (-PI / 2) : (-PI / 6);
  if (npc.Xspeed != 0) {
    color("black");
    let offset = (npc.side == "left") ? -3 : 3;
    particle(
      npc.pos.x + worldOffsetX - offset, // x coordinate
      npc.pos.y + worldOffsetY + 3, // y coordinate
      1, // The number of particles
      0.35, // The speed of the particles
      particleAngle, // The emitting angle
      PI / 2  // The emitting width
    );
  }
}

//takes object's properties to draw it, call it's own update funciton and check collisions with the NPC
function updateObjects() {
  for (let i = 0; i < objectList.length; i++) {
    objectList[i].updateFunction();
    color("black");
    if (objectList[i].drawLabel.length == 1) { //we're trying to draw a custom char image
      if (char(objectList[i].drawLabel, objectList[i].pos.x + worldOffsetX, objectList[i].pos.y + worldOffsetY).isColliding.rect.light_cyan)
      {
        objectList[i].collisionFunction();
      }
    }
  }
}

function updatePlatforms() {
  color("black");
  for (let i = 0; i < platformList.length; i++) {
    rect(platformList[i].pos.x + worldOffsetX, platformList[i].pos.y + worldOffsetY, platformList[i].width, platformList[i].height);
  }
}

//special platform collision handling looking at all the sides of the player.
function checkPlatformCollisions(previousNPCProperties) {
  var hitany = false;
  var startSide = npc.side;
  color("transparent");
  // Bottom
  if (rect(vec(npc.pos.x + worldOffsetX - 3, npc.pos.y + worldOffsetY + 2), 6, 1).isColliding.rect.green) {
    npc.pos.y = previousNPCProperties.pos.y; //reset y position
    hitany = true;
  }
  // Right
  if (rect(vec(npc.pos.x + worldOffsetX + 2, npc.pos.y + worldOffsetY - 2), 1, 5).isColliding.rect.green) {
    if (npc.side == "right") {
      if (startSide == npc.side) {
        changeDirection();
      }
    }
    hitany = true;
  }
  // Left
  if (rect(vec(npc.pos.x + worldOffsetX - 3, npc.pos.y + worldOffsetY - 2), 1, 5).isColliding.rect.green) {
    if (npc.side == "left") {
      if (startSide == npc.side) {
        changeDirection();
      }
    }
    hitany = true;
  }
  // Top
  if (rect(vec(npc.pos.x + worldOffsetX - 2, npc.pos.y + worldOffsetY - 3), 4, 1).isColliding.rect.green) {
    if (npc.onStairs){
      if(startSide == npc.side){
        changeDirection();
      }
    } else if (!hitany) {
      npc.falling = true;
      npc.jumping = false;
      npc.Yspeed = 0;
      npc.pos.y = previousNPCProperties.pos.y; //reset y position
    } else {
      npc.pos.y = previousNPCProperties.pos.y; //reset y position
    }
  }
  npc.onStairs = false;
}

//simply changes the NPC's direction, very simple code but reused in several areas
function changeDirection() {
  npc.side = (npc.side == "left") ? "right" : "left";
  npc.Xspeed *= -1;
}

//draws paddle, checks input types and updates the paddle accordingly 
function updatePaddle() {
  //check hold vs tap input
  if (input.isPressed) {
    //wait enough time to differentiate a click vs hold
    inputTimer += 1;
    if (inputTimer >= SETTINGS.WAIT_TIME) //then we are holding the button
    {
      // Draw the paddle
      color("transparent");
      if (!rect(paddle.pos, paddle.width, paddle.height).isColliding.rect.light_cyan) {
        if (!paddleHold && cameraPanning == 0) { //bool to have holding execute holding logic once per hold
          paddleHold = true;
          //TODO: check if NPC and light blue paddle are colliding
          paddle.color = "blue";
          console.log("holding");
        }
      }
    }
  } else if (input.isJustReleased) {
    //if the player held the input
    if (inputTimer >= SETTINGS.WAIT_TIME) {
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
  color(paddle.color);
  rect(paddle.pos.x, paddle.pos.y, paddle.width, paddle.height);
}

// Generates and returns a room in the layout
function generateRoom() {
  // If currentRoom is undefined, generate the first room
  if(currentRoom == undefined) {
    addRows(2);
    var r = new room(startRoomTypes[rndi(0,startRoomTypes.length)], 0, 0);
    roomLayout[0][0] = r;
    return r;
  }
  // Otherwise, find exit of current room and spawn a room with a corresponding entrance
  var exit = roomTypes[currentRoom.type].exit;
  if (currentRoom.row >= roomLayout.length - 2) {
    addRows(2);
  }
  var targetPosition;
  var requiredOrientation;
  var requiredHalf;
  var requiredEntrance;
  var requiredExit;
  var acceptableRoomOrientations = ["1x1"];

  switch(exit) {
    case "north": 
      requiredEntrance = "south";
      targetPosition = vec(currentRoom.row + 1, currentRoom.col);
      // Add acceptable orientations
      acceptableRoomOrientations.push("1x2");
      // Randomly choose an acceptable orientation
      requiredOrientation = acceptableRoomOrientations[rndi(0, acceptableRoomOrientations.length)];
      switch (requiredOrientation) {
        case "1x1":
          if (targetPosition.y == 0) {
            requiredExit = "east";
          } else {
            requiredExit = "west";
          }
          requiredHalf = undefined;
          break;
        case "1x2":
          if (targetPosition.y == 0) {
            requiredExit = "east";
            requiredHalf = "left";
          } else {
            requiredExit = "west";
            requiredHalf = "right";
          }
          break;
      }
      break;
    case "west":
      requiredEntrance = "east";
      targetPosition = vec(currentRoom.row, currentRoom.col - 1);
      // Test for acceptable orientations
      if (targetPosition.y == 1) {
        acceptableRoomOrientations.push("1x2");
      } else if (targetPosition.y == 0) {
        acceptableRoomOrientations.push("2x1");
      }
      // Randomly choose an acceptable orientation
      requiredOrientation = acceptableRoomOrientations[rndi(0, acceptableRoomOrientations.length)];
      switch (requiredOrientation) {
        case "1x1":
          if (targetPosition.y > 0) {
            requiredExit = "west";
          } else {
            requiredExit = "north";
          }
          requiredHalf = undefined;
          break;
        case "1x2":
          requiredExit = "north";
          requiredHalf = "right";
          break;
        case "2x1":
          requiredExit = "east";
          requiredHalf = "bottom";
          break;
      }
      break;
    case "east":
      requiredEntrance = "west";
      targetPosition = vec(currentRoom.row, currentRoom.col + 1);
      // Test for acceptable orientations
      if(targetPosition.y == SETTINGS.LAYOUT_WIDTH - 2) {
        acceptableRoomOrientations.push("1x2");
      } else if (targetPosition.y == SETTINGS.LAYOUT_WIDTH - 1) {
        acceptableRoomOrientations.push("2x1");
      }
      // Randomly choose an acceptable orientation
      requiredOrientation = acceptableRoomOrientations[rndi(0,acceptableRoomOrientations.length)];
      switch (requiredOrientation) {
        case "1x1":
          if (targetPosition.y < SETTINGS.LAYOUT_WIDTH - 1) {
            requiredExit = "east";
          } else {
            requiredExit = "north";
          }
          requiredHalf = undefined;
          break;
        case "1x2":
          requiredExit = "north";
          requiredHalf = "left";
          break;
        case "2x1":
          requiredExit = "west";
          requiredHalf = "bottom";
          break;
      }
      break;
  }

  // Adds all eligible room types to a list that we can choose from
  var eligibleRoomTypes = [];
  for(var i = 0; i < roomTypes.length; i++) {
    if (roomTypes[i].orientation == requiredOrientation && roomTypes[i].half == requiredHalf && roomTypes[i].entrance == requiredEntrance && roomTypes[i].exit == requiredExit) {
      eligibleRoomTypes.push(i);
    }
  }
  if(eligibleRoomTypes.length == 0) {
    console.log("Not enough eligible room types to generate room:");
    console.log("Required orientation: " + requiredOrientation);
    console.log("Required half: " + requiredHalf);
    console.log("Required entrance: " + requiredEntrance);
    console.log("Required exit: " + requiredExit);
    return undefined;
  }
  
  // Randomly select type and fill in roomLayout
  var selectedType = eligibleRoomTypes[rndi(0, eligibleRoomTypes.length)];
  switch(roomTypes[selectedType].half) {
    case undefined:
      var r = new room(selectedType, targetPosition.x, targetPosition.y);
      roomLayout[targetPosition.x][targetPosition.y] = r;
      return r;
    case "bottom":
      var r = new room(selectedType, targetPosition.x, targetPosition.y);
      roomLayout[targetPosition.x][targetPosition.y] = r;
      r = new room(selectedType + 1, targetPosition.x + 1, targetPosition.y);
      roomLayout[targetPosition.x + 1][targetPosition.y] = r;
      return r;
    case "left":
      var r = new room(selectedType, targetPosition.x, targetPosition.y);
      roomLayout[targetPosition.x][targetPosition.y] = r;
      r = new room(selectedType + 1, targetPosition.x, targetPosition.y + 1);
      roomLayout[targetPosition.x][targetPosition.y + 1] = r;
      return r;
    case "right":
      var r = new room(selectedType, targetPosition.x, targetPosition.y);
      roomLayout[targetPosition.x][targetPosition.y] = r;
      r = new room(selectedType - 1, targetPosition.x, targetPosition.y - 1);
      roomLayout[targetPosition.x][targetPosition.y - 1] = r;
      return r;
    case "top":
      console.log("Should not be reachable");
      return undefined;
  }
  
}

// Adds (X) amount of empty rows at the top of the map
function addRows(amount) {
  for(var j = 0; j < amount; j++) {
    roomLayout.push([]);
    for(var i = 0; i < SETTINGS.LAYOUT_WIDTH; i++) {
      roomLayout[roomLayout.length - 1].push(undefined);
    }
  }
}

function barrier(x, y, w, h) {
  this.pos = vec(x, y);
  this.width = w;
  this.height = h;
};
function exit(x, y, w, h) {
  this.pos = vec(x, y);
  this.width = w;
  this.height = h;
  this.drawLabel = "o";
  this.collisionFunction = () => { };
  this.updateFunction = () => { 
    color("transparent");
    if (rect(this.pos.x - 2 + worldOffsetX, this.pos.y + 3 + worldOffsetY - this.height, this.width, this.height).isColliding.rect.light_cyan) {
      panCamera();
    }
  };
};
function upwardSpike(x, y) {
  this.pos = vec(x,y);
  this.drawLabel = "e";
  this.collisionFunction = () => { gameOver(); };
  this.updateFunction = () => { };
};
function downwardSpike(x, y) {
  this.pos = vec(x, y);
  this.drawLabel = "f";
  this.collisionFunction = () => { gameOver(); };
  this.updateFunction = () => { };
};
function fallingSpike(x, y, destY) {
  this.startY = y;
  this.pos = vec(x, y);
  this.destinationPos = vec(x, destY);
  this.drawLabel = "f";
  this.collisionFunction = () => { gameOver(); };
  this.updateFunction = () => { 
    this.pos.y += 1; 
    if (this.pos.y == this.destinationPos.y) {
      this.pos.y = this.startY;
    }
  };
};
function arrow(x, y, destX) {
  this.direction = destX > x ? "left" : "right"; //left or right
  this.startX = x;
  this.pos = vec(x, y);
  this.destinationPos = vec(destX, y);
  this.drawLabel = (this.direction == "left") ? "k" : "l";
  this.collisionFunction = () => { gameOver(); };
  this.updateFunction = () => { 
    this.pos.x += (this.direction == "left") ? 1 : -1;
    if(this.pos.x == this.destinationPos.x) {
      this.pos.x = this.startX; 
    }
  };
};
function button(x, y) {
  this.pressed = false;
  this.pos = vec(x, y);
  this.drawLabel = "g";
  this.collisionFunction = () => { console.log("NPC pressed button!") };
  this.updateFunction = () => { };
};
function buttonToggle(x, y) {
  this.pressed = false;
  this.pos = vec(x, y);
  this.drawLabel = "g";
  this.collisionFunction = () => { console.log("NPC pressed buttonToggle!") };
  this.updateFunction = () => { };
};
function jumpPad(x, y) {
  this.launchHeight = 50;
  this.pos = vec(x, y);
  this.drawLabel = "m";
  this.collisionFunction = () => {
    console.log("NPC jumped on the jump pad!");
    npc.falling = false;
    npc.jumping = true;
    npc.Yspeed = SETTINGS.NPC_Y_SPEED_JUMPING * -1;
  };
  this.updateFunction = () => { };
};
function teleportPad(x, y, destX, destY) {
  this.destinationPos = vec(destX, destY);
  this.pos = vec(x, y);
  this.drawLabel = "g";
  this.collisionFunction = () => {
    console.log("NPC activated the teleport pad!");
    npc.pos.x = this.destinationPos.x;
    npc.pos.y = this.destinationPos.y - 3;
  };
  this.updateFunction = () => {
    //draw it's destination teleport pad (allows us to handle source and destination in the same object)
    color("black");
    char("n", this.destinationPos.x + worldOffsetX, this.destinationPos.y + worldOffsetY);
  };
};
function stairsLeft(x, y) {
  this.pos = vec(x, y);
  this.drawLabel = "i";
  this.collisionFunction = () => { 
    npc.onStairs = true;
    if(npc.side == "left") {
      npc.pos.y -= 1.5;
    } else {
      npc.pos.y -= .1;
    }
  };
  this.updateFunction = () => {};
};
function stairsRight(x, y) {
  this.pos = vec(x, y);
  this.drawLabel = "j";
  this.collisionFunction = () => {
    npc.onStairs = true;
    if (npc.side == "right") {
      npc.pos.y -= 1.5;
    } else {
      npc.pos.y -= .1;
    }
  };
  this.updateFunction = () => {};
};

/* Rooms:
 * TYPE: (integer) the numerical value used to identify which room type is associated with it
 * Row, Col: (integers) the row and column coordinates in the roomLayout 2D array for the room
 */
function room(type, row, col) {
  this.type = type;
  this.row = row;
  this.col = col;
  roomTypes[type].spawnObjects(row,col);
}

/* Custom Room Types (tX):
 * Here is where custom rooms are defined.  Make sure that any definitions down here
 * are added to the array roomTypes in the start() function.
 * 
 * Additional Info:
 * For 1x2: entrance will always be on one half, and the exit on the other half
 * For 2x1: the entrance will always be on the bottom half, and the exit will be on the top half
 * Both halves of 1x2 and 2x1 list both the entrance and exit directions
 * Left and Bottom are both listed before Right and Top
 */
function t0() {
  this.entrance = undefined; // south, east, or west *Note no north entrances allowed**
  this.exit = "east"; // north, east, or west **Note no south exits allowed**
  this.orientation = "1x1"; // 1x1, 1x2, or 2x1
  this.half = undefined; // undefined, left, right, top, or bottom
  this.spawnObjects = (r, c) => {
    // Room position is calculated based off of relative row and column plus some other offsets
    var roomPos = vec(SETTINGS.BASE_OFFSET_X - unit * 10 + c * 120, SETTINGS.BASE_OFFSET_Y + unit * 9 + r * -120);
    // Barriers are added to the platformList to build up the walls and floors of the room
    // Change the numbers to alter the position/shape with the following pattern:
    // row, col, width, height
    platformList.push(new barrier(roomPos.x + unit * 0, roomPos.y - unit * 0, unit * 20, unit * 1));
    platformList.push(new barrier(roomPos.x + unit * 0, roomPos.y - unit * 19, unit * 20, unit * 1));
    platformList.push(new barrier(roomPos.x + unit * 0, roomPos.y - unit * 19, unit * 1, unit * 20));
    platformList.push(new barrier(roomPos.x + unit * 19, roomPos.y - unit * 18, unit * 1, unit * 6));
    platformList.push(new barrier(roomPos.x + unit * 19, roomPos.y - unit * 6, unit * 1, unit * 6));
    platformList.push(new barrier(roomPos.x + unit * 13, roomPos.y - unit * 6, unit * 6, unit * 1));
    platformList.push(new barrier(roomPos.x + unit * 15, roomPos.y - unit * 15, unit * 1, unit * 9));
    platformList.push(new barrier(roomPos.x + unit * 1, roomPos.y - unit * 6, unit * 8, unit * 1));
    platformList.push(new barrier(roomPos.x + unit * 1, roomPos.y - unit * 9, unit * 5, unit * 1));
    platformList.push(new barrier(roomPos.x + unit * 1, roomPos.y - unit * 13, unit * 10, unit * 1));
    platformList.push(new barrier(roomPos.x + unit * 10, roomPos.y - unit * 12, unit * 1, unit * 2));
    platformList.push(new barrier(roomPos.x + unit * 11, roomPos.y - unit * 11, unit * 4, unit * 1));
    platformList.push(new barrier(roomPos.x + unit * 12, roomPos.y - unit * 5, unit * 7, unit * 5));
    platformList.push(new barrier(roomPos.x + unit * 11, roomPos.y - unit * 4, unit * 1, unit * 4));
    platformList.push(new barrier(roomPos.x + unit * 10, roomPos.y - unit * 3, unit * 1, unit * 3));
    platformList.push(new barrier(roomPos.x + unit * 9, roomPos.y - unit * 2, unit * 1, unit * 2));
    platformList.push(new barrier(roomPos.x + unit * 8, roomPos.y - unit * 1, unit * 1, unit * 1));
    platformList.push(new barrier(roomPos.x + unit * 1, roomPos.y - unit * 8, unit * 6, unit * 2));
    platformList.push(new barrier(roomPos.x + unit * 7, roomPos.y - unit * 7, unit * 1, unit * 1));
    // Objects are added to the objectList to spawn objects in the room
    // Change the numbers to alter the positions with the following pattern:
    // row, col
    // some objects have extra conditions, such as:
    // teleport pad other pad coordinates
    // exit height and width (inversely drawn from how barriers are drawn)
    // arrow end X pos so it knows where to redraw it at its start (they loop)
    objectList.push(new stairsRight(roomPos.x + stairOffset + unit * 7, roomPos.y + stairOffset - unit * 1));
    objectList.push(new stairsRight(roomPos.x + stairOffset + unit * 8, roomPos.y + stairOffset - unit * 2));
    objectList.push(new stairsRight(roomPos.x + stairOffset + unit * 9, roomPos.y + stairOffset - unit * 3));
    objectList.push(new stairsRight(roomPos.x + stairOffset + unit * 10, roomPos.y + stairOffset - unit * 4));
    objectList.push(new stairsRight(roomPos.x + stairOffset + unit * 11, roomPos.y + stairOffset - unit * 5));
    objectList.push(new stairsRight(roomPos.x + stairOffset + unit * 12, roomPos.y + stairOffset - unit * 6));
    objectList.push(new stairsLeft(roomPos.x + stairOffset + unit * 8, roomPos.y + stairOffset - unit * 7));
    objectList.push(new stairsLeft(roomPos.x + stairOffset + unit * 7, roomPos.y + stairOffset - unit * 8));
    objectList.push(new stairsLeft(roomPos.x + stairOffset + unit * 6, roomPos.y + stairOffset - unit * 9));
    objectList.push(new teleportPad(roomPos.x + teleportOffset + unit * 1, roomPos.y + teleportOffset - unit * 10, roomPos.x + teleportOffset + unit * 10, roomPos.y + teleportOffset - unit * 14));
    objectList.push(new jumpPad(roomPos.x + jumpPadOffsetX + unit * 12, roomPos.y + jumpPadOffsetY - unit * 12));
    objectList.push(new upwardSpike(roomPos.x + spikeOffset + unit * 1, roomPos.y + spikeOffset - unit * 14));
    objectList.push(new exit(roomPos.x + exitOffsetX + unit * 19, roomPos.y - exitOffsetY - unit * 6, unit * 1, unit * 6));
    objectList.push(new arrow(roomPos.x + arrowOffset + unit * 1, roomPos.y + arrowOffset - unit * 18, roomPos.x + arrowOffset + unit * 18));
    objectList.push(new downwardSpike(roomPos.x + spikeOffset + unit * 1, roomPos.y + spikeOffset - unit * 5));
  };
}
// ROOM 1
function t1() {
  this.entrance = "south"; // south, east, or west *Note no north entrances allowed**
  this.exit = "north"; // north, east, or west **Note no south exits allowed**
  this.orientation = "1x1"; // 1x1, 1x2, or 2x1
  this.half = undefined; // undefined, left, right, top, or bottom
  this.spawnObjects = (r, c) => {
    // Room position is calculated based off of relative row and column plus some other offsets
    var roomPos = vec(SETTINGS.BASE_OFFSET_X - unit * 10 + c * 120, SETTINGS.BASE_OFFSET_Y + unit * 9 + r * -120);
  };
}
// ROOM 2
function t2() {
  this.entrance = "south"; // south, east, or west *Note no north entrances allowed**
  this.exit = "east"; // north, east, or west **Note no south exits allowed**
  this.orientation = "1x1"; // 1x1, 1x2, or 2x1
  this.half = undefined; // undefined, left, right, top, or bottom
  this.spawnObjects = (r, c) => {
    // Room position is calculated based off of relative row and column plus some other offsets
    var roomPos = vec(SETTINGS.BASE_OFFSET_X - unit * 10 + c * 120, SETTINGS.BASE_OFFSET_Y + unit * 9 + r * -120);
   };
}
// ROOM 3
function t3() {
  this.entrance = "south"; // south, east, or west *Note no north entrances allowed**
  this.exit = "west"; // north, east, or west **Note no south exits allowed**
  this.orientation = "1x1"; // 1x1, 1x2, or 2x1
  this.half = undefined; // undefined, left, right, top, or bottom
  this.spawnObjects = (r, c) => { 
    // Room position is calculated based off of relative row and column plus some other offsets
    var roomPos = vec(SETTINGS.BASE_OFFSET_X - unit * 10 + c * 120, SETTINGS.BASE_OFFSET_Y + unit * 9 + r * -120);
  };
}
// ROOM 4
function t4() {
  this.entrance = "east"; // south, east, or west *Note no north entrances allowed**
  this.exit = "north"; // north, east, or west **Note no south exits allowed**
  this.orientation = "1x1"; // 1x1, 1x2, or 2x1
  this.half = undefined; // undefined, left, right, top, or bottom
  this.spawnObjects = (r, c) => {
    // Room position is calculated based off of relative row and column plus some other offsets
    var roomPos = vec(SETTINGS.BASE_OFFSET_X - unit * 10 + c * 120, SETTINGS.BASE_OFFSET_Y + unit * 9 + r * -120);
   };
}
// ROOM 5
function t5() {
  this.entrance = "east"; // south, east, or west *Note no north entrances allowed**
  this.exit = "west"; // north, east, or west **Note no south exits allowed**
  this.orientation = "1x1"; // 1x1, 1x2, or 2x1
  this.half = undefined; // undefined, left, right, top, or bottom
  this.spawnObjects = (r, c) => { 
    // Room position is calculated based off of relative row and column plus some other offsets
    var roomPos = vec(SETTINGS.BASE_OFFSET_X - unit * 10 + c * 120, SETTINGS.BASE_OFFSET_Y + unit * 9 + r * -120);
  };
}
// ROOM 6
function t6() {
  this.entrance = "west"; // south, east, or west *Note no north entrances allowed**
  this.exit = "north"; // north, east, or west **Note no south exits allowed**
  this.orientation = "1x1"; // 1x1, 1x2, or 2x1
  this.half = undefined; // undefined, left, right, top, or bottom
  this.spawnObjects = (r, c) => {
    // Room position is calculated based off of relative row and column plus some other offsets
    var roomPos = vec(SETTINGS.BASE_OFFSET_X - unit * 10 + c * 120, SETTINGS.BASE_OFFSET_Y + unit * 9 + r * -120);
   };
}
// ROOM 7
function t7() {
  this.entrance = "west"; // south, east, or west *Note no north entrances allowed**
  this.exit = "east"; // north, east, or west **Note no south exits allowed**
  this.orientation = "1x1"; // 1x1, 1x2, or 2x1
  this.half = undefined; // undefined, left, right, top, or bottom
  this.spawnObjects = (r, c) => { 
    // Room position is calculated based off of relative row and column plus some other offsets
    var roomPos = vec(SETTINGS.BASE_OFFSET_X - unit * 10 + c * 120, SETTINGS.BASE_OFFSET_Y + unit * 9 + r * -120);
  };
}
// ROOM 8
function t8() {
  this.entrance = "west"; // south, east, or west *Note no north entrances allowed**
  this.exit = "north"; // north, east, or west **Note no south exits allowed**
  this.orientation = "1x2"; // 1x1, 1x2, or 2x1
  this.half = "left"; // undefined, left, right, top, or bottom
  this.spawnObjects = (r, c) => {
    // Room position is calculated based off of relative row and column plus some other offsets
    var roomPos = vec(SETTINGS.BASE_OFFSET_X - unit * 10 + c * 120, SETTINGS.BASE_OFFSET_Y + unit * 9 + r * -120);
   };
}
function t9() {
  this.entrance = "west"; // south, east, or west *Note no north entrances allowed**
  this.exit = "north"; // north, east, or west **Note no south exits allowed**
  this.orientation = "1x2"; // 1x1, 1x2, or 2x1
  this.half = "right"; // undefined, left, right, top, or bottom
  this.spawnObjects = (r, c) => { 
    // Room position is calculated based off of relative row and column plus some other offsets
    var roomPos = vec(SETTINGS.BASE_OFFSET_X - unit * 10 + c * 120, SETTINGS.BASE_OFFSET_Y + unit * 9 + r * -120);
  };
}
// ROOM 9
function t10() {
  this.entrance = "east"; // south, east, or west *Note no north entrances allowed**
  this.exit = "north"; // north, east, or west **Note no south exits allowed**
  this.orientation = "1x2"; // 1x1, 1x2, or 2x1
  this.half = "left"; // undefined, left, right, top, or bottom
  this.spawnObjects = (r, c) => {
    // Room position is calculated based off of relative row and column plus some other offsets
    var roomPos = vec(SETTINGS.BASE_OFFSET_X - unit * 10 + c * 120, SETTINGS.BASE_OFFSET_Y + unit * 9 + r * -120);
   };
}
function t11() {
  this.entrance = "east"; // south, east, or west *Note no north entrances allowed**
  this.exit = "north"; // north, east, or west **Note no south exits allowed**
  this.orientation = "1x2"; // 1x1, 1x2, or 2x1
  this.half = "right"; // undefined, left, right, top, or bottom
  this.spawnObjects = (r, c) => {
    // Room position is calculated based off of relative row and column plus some other offsets
    var roomPos = vec(SETTINGS.BASE_OFFSET_X - unit * 10 + c * 120, SETTINGS.BASE_OFFSET_Y + unit * 9 + r * -120);
   };
}
// ROOM 10
function t12() {
  this.entrance = "south"; // south, east, or west *Note no north entrances allowed**
  this.exit = "east"; // north, east, or west **Note no south exits allowed**
  this.orientation = "1x2"; // 1x1, 1x2, or 2x1
  this.half = "left"; // undefined, left, right, top, or bottom
  this.spawnObjects = (r, c) => { 
    // Room position is calculated based off of relative row and column plus some other offsets
    var roomPos = vec(SETTINGS.BASE_OFFSET_X - unit * 10 + c * 120, SETTINGS.BASE_OFFSET_Y + unit * 9 + r * -120);
  };
}
function t13() {
  this.entrance = "south"; // south, east, or west *Note no north entrances allowed**
  this.exit = "east"; // north, east, or west **Note no south exits allowed**
  this.orientation = "1x2"; // 1x1, 1x2, or 2x1
  this.half = "right"; // undefined, left, right, top, or bottom
  this.spawnObjects = (r, c) => { 
    // Room position is calculated based off of relative row and column plus some other offsets
    var roomPos = vec(SETTINGS.BASE_OFFSET_X - unit * 10 + c * 120, SETTINGS.BASE_OFFSET_Y + unit * 9 + r * -120);
  };
}
// ROOM 11
function t14() {
  this.entrance = "south"; // south, east, or west *Note no north entrances allowed**
  this.exit = "west"; // north, east, or west **Note no south exits allowed**
  this.orientation = "1x2"; // 1x1, 1x2, or 2x1
  this.half = "left"; // undefined, left, right, top, or bottom
  this.spawnObjects = (r, c) => { 
    // Room position is calculated based off of relative row and column plus some other offsets
    var roomPos = vec(SETTINGS.BASE_OFFSET_X - unit * 10 + c * 120, SETTINGS.BASE_OFFSET_Y + unit * 9 + r * -120);
  };
}
function t15() {
  this.entrance = "south"; // south, east, or west *Note no north entrances allowed**
  this.exit = "west"; // north, east, or west **Note no south exits allowed**
  this.orientation = "1x2"; // 1x1, 1x2, or 2x1
  this.half = "right"; // undefined, left, right, top, or bottom
  this.spawnObjects = (r, c) => { 
    // Room position is calculated based off of relative row and column plus some other offsets
    var roomPos = vec(SETTINGS.BASE_OFFSET_X - unit * 10 + c * 120, SETTINGS.BASE_OFFSET_Y + unit * 9 + r * -120);
  };
}
// ROOM 12
function t16() {
  this.entrance = "west"; // south, east, or west *Note no north entrances allowed**
  this.exit = "west"; // north, east, or west **Note no south exits allowed**
  this.orientation = "2x1"; // 1x1, 1x2, or 2x1
  this.half = "bottom"; // undefined, left, right, top, or bottom
  this.spawnObjects = (r, c) => {
    // Room position is calculated based off of relative row and column plus some other offsets
    var roomPos = vec(SETTINGS.BASE_OFFSET_X - unit * 10 + c * 120, SETTINGS.BASE_OFFSET_Y + unit * 9 + r * -120);
   };
}
function t17() {
  this.entrance = "west"; // south, east, or west *Note no north entrances allowed**
  this.exit = "west"; // north, east, or west **Note no south exits allowed**
  this.orientation = "2x1"; // 1x1, 1x2, or 2x1
  this.half = "top"; // undefined, left, right, top, or bottom
  this.spawnObjects = (r, c) => { 
    // Room position is calculated based off of relative row and column plus some other offsets
    var roomPos = vec(SETTINGS.BASE_OFFSET_X - unit * 10 + c * 120, SETTINGS.BASE_OFFSET_Y + unit * 9 + r * -120);
  };
}
// ROOM 13
function t18() {
  this.entrance = "east"; // south, east, or west *Note no north entrances allowed**
  this.exit = "east"; // north, east, or west **Note no south exits allowed**
  this.orientation = "2x1"; // 1x1, 1x2, or 2x1
  this.half = "bottom"; // undefined, left, right, top, or bottom
  this.spawnObjects = (r, c) => {
    // Room position is calculated based off of relative row and column plus some other offsets
    var roomPos = vec(SETTINGS.BASE_OFFSET_X - unit * 10 + c * 120, SETTINGS.BASE_OFFSET_Y + unit * 9 + r * -120);
   };
}
function t19() {
  this.entrance = "east"; // south, east, or west *Note no north entrances allowed**
  this.exit = "east"; // north, east, or west **Note no south exits allowed**
  this.orientation = "2x1"; // 1x1, 1x2, or 2x1
  this.half = "top"; // undefined, left, right, top, or bottom
  this.spawnObjects = (r, c) => {
    // Room position is calculated based off of relative row and column plus some other offsets
    var roomPos = vec(SETTINGS.BASE_OFFSET_X - unit * 10 + c * 120, SETTINGS.BASE_OFFSET_Y + unit * 9 + r * -120);
   };
}