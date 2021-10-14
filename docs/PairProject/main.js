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
  ll 
 llll 
llllll
`,//f: downward facing spike (for static and falling spikes)
`
llllll
 llll 
  ll 
`,//g: button, jump pad, teleport pad, 
`
 llll
bbbbbb
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
llll 
llllll
llll 
ll
`,//l: the arrow head right
`
    ll
  llll 
llllll
  llll 
    ll
`,
];

const SETTINGS = {
  WIDTH: 150,
  HEIGHT: 150,

  LAYOUT_WIDTH: 3,
  NPC_WIDTH: 6,
  NPC_HEIGHT: 6,
  NPC_X_SPEED: 0.7,
  NPC_Y_SPEED_JUMPING: 3,
  NPC_Y_SPEED_FALLING_MIN: 0.4,
  NPC_Y_SPEED_FALLING_MAX: 0.7,
  NPC_Y_ACCELERATION: 0.1,
};

options = {
  viewSize: {x: SETTINGS.WIDTH, y:SETTINGS.HEIGHT},
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

// Called once upon initialization
function start() {
  startRoomTypes = [0]; // Store all variations of the start room in this array
  roomTypes = [new t0(), new t1(), new t2(), new t3(), new t4(), new t5(), new t6(), new t7(), new t8(), new t9(), new t10(), new t11(), new t12(), new t13(), new t14(), new t15(), new t16(), new t17(), new t18(), new t19()];
  roomLayout = [];
  currentRoom = generateRoom();
  for(var i = 0; i < 10; i++) {
    currentRoom = generateRoom();
  }
  console.log(roomLayout);

  //define the NPC properties
  npc = {
    pos: vec(SETTINGS.WIDTH * 0.5, SETTINGS.HEIGHT - 7),
    //uses the constant base speed, but we want to modify it's sign
    Xspeed: SETTINGS.NPC_X_SPEED, //so we have the speed property
    Yspeed: 0,
    Yacceleration: SETTINGS.NPC_Y_ACCELERATION,
    side: "right",
    falling: true,
    jumping: false,
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
  platformList.push(paddle);
  platformList.push(ground);

  //add all objects besides the NPC to the objectList

  //easy to implement
  upwardSpike = {
    pos: { x: 25, y: 40 },
    color: "red",
    width: 6,
    height: 3,
    drawLabel: "e",
    collisionFunction: () => { console.log("NPC hit upwardSpike!") },
    updateFunction: () => { },
  };
  objectList.push(upwardSpike);

  //easy to implement
  downwardSpike = {
    pos: { x: 25, y: 50 },
    color: "red",
    width: 6,
    height: 3,
    drawLabel: "f",
    collisionFunction: () => { console.log("NPC hit downwardSpike!") },
    updateFunction: () => { },
  };
  objectList.push(downwardSpike);

  //semi working
  fallingSpike = {
    pos: { x: 25, y: 5 },
    color: "red",
    width: 6,
    height: 3,
    drawLabel: "f",
    collisionFunction: () => { console.log("NPC hit fallingSpike!") },
    updateFunction: () => { fallingSpike.pos.y += 1; },
  };
  objectList.push(fallingSpike);

  //semi working
  arrow = {
    side: "left", //left or right
    pos: { x: 50, y: 50 },
    color: "red",
    width: 6,
    height: 3,
    drawLabel: "k",
    collisionFunction: () => { console.log("NPC hit arrow!") },
    updateFunction: () => { arrow.pos.x += (arrow.side == "left") ? 1 : -1; },
  };
  arrow.drawLabel = (arrow.side == "left") ? "k" : "l";
  objectList.push(arrow);

  //not implemented yet
  button = {
    pressed: false,
    pos: { x: 50, y: 30 },
    color: "blue",
    width: 6,
    height: 3,
    drawLabel: "g",
    collisionFunction: () => { console.log("NPC pressed button!") },
    updateFunction: () => { },
  };
  objectList.push(button);

  //not implemented yet
  buttonToggle = {
    pressed: false,
    pos: { x: 60, y: 30 },
    color: "green",
    width: 6,
    height: 3,
    drawLabel: "g",
    collisionFunction: () => { console.log("NPC pressed buttonToggle!") },
    updateFunction: () => { },
  };
  objectList.push(buttonToggle);

  //mostly working
  jumpPad = {
    launchHeight: 50,
    pos: { x: 50, y: 50 },
    color: "cyan",
    width: 6,
    height: 3,
    drawLabel: "g",
    collisionFunction: () => {
      console.log("NPC jumped on the jump pad!");
      npc.falling = false;
      npc.jumping = true;
      npc.Yspeed = SETTINGS.NPC_Y_SPEED_JUMPING * -1;
    },
    updateFunction: () => { },
  };
  objectList.push(jumpPad);

  //working
  teleportPad = {
    destination: { x: 80, y: SETTINGS.HEIGHT - 2 - 20 },
    pos: { x: 80, y: 50 },
    color: "yellow",
    width: 6,
    height: 3,
    drawLabel: "g",
    collisionFunction: () => {
      console.log("NPC activated the teleport pad!");
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
    pos: { x: 6, y: 50 },
    color: "cyan",
    width: 6,
    height: 3,
    drawLabel: "i",
    collisionFunction: () => { console.log("NPC collided with stairs left!"); },
    updateFunction: () => { },
  };
  objectList.push(stairsLeft);

  //NOT WORKING
  stairsRight = {
    pos: { x: SETTINGS.WIDTH - 20, y: 50 },
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
    updateFunction: () => { },
  };
  objectList.push(stairsRight);
}

// Called every frame, 60 fps
function update() {
  if (!ticks) { start(); }

  //create ground platform right below the screen
  rect(ground.pos.x, ground.pos.y, ground.width, ground.height);

  updatePaddle(); //updatePaddle before updateNPC bc last drawn item gets displayed on top
  updateObjects();
  updateNPC();
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
  if (npc.pos.x >= SETTINGS.WIDTH || npc.pos.x <= 0) {
    changeDirection();
  }

  npc.pos.clamp(0, SETTINGS.WIDTH, 0, SETTINGS.HEIGHT); //safety line of code? not sure if it helps at all

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
  for (let i = 0; i < objectList.length; i++) {

    objectList[i].updateFunction();

    color(objectList[i].color);
    if (objectList[i].drawLabel.length == 1) { //we're trying to draw a custom char image
      char(objectList[i].drawLabel, objectList[i].pos.x, objectList[i].pos.y);
    }
  }
  checkCollisions();
}

//checks all collisions between the objectList and the NPC
//if collision is found, call the objects collision callback function
function checkCollisions() {
  for (let i = 0; i < objectList.length; i++) {
    let npcX = npc.pos.x - (SETTINGS.NPC_WIDTH / 2); //put the x position in the top left
    let npcY = npc.pos.y - (SETTINGS.NPC_HEIGHT / 2);//put the y position in the top left
    //TODO: abstract the AA BB hitbox collision logic to be it's own function
    //name that function checkCollision and rename this function handleCollisions()
    //have handleCollisions() handle collision for NPC and collisions with other objects in the objectList
    //but do separate for loops for NPC (first) and for object on object collisions (second) for best performance
    //simple AA BB hitbox collision detection
    if (objectList[i].pos.x < npcX + SETTINGS.NPC_WIDTH &&       //left   side
      objectList[i].pos.x + objectList[i].width > npcX && //right  side
      objectList[i].pos.y < npcY + SETTINGS.NPC_HEIGHT &&        //top    side
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

/* Rooms:
 * TYPE: (integer) the numerical value used to identify which room type is associated with it
 * Row, Col: (integers) the row and column coordinates in the roomLayout 2D array for the room
 */
function room(type, row, col) {
  this.type = type;
  this.row = row;
  this.col = col;
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
}
// ROOM 1
function t1() {
  this.entrance = "south"; // south, east, or west *Note no north entrances allowed**
  this.exit = "north"; // north, east, or west **Note no south exits allowed**
  this.orientation = "1x1"; // 1x1, 1x2, or 2x1
  this.half = undefined; // undefined, left, right, top, or bottom
}
// ROOM 2
function t2() {
  this.entrance = "south"; // south, east, or west *Note no north entrances allowed**
  this.exit = "east"; // north, east, or west **Note no south exits allowed**
  this.orientation = "1x1"; // 1x1, 1x2, or 2x1
  this.half = undefined; // undefined, left, right, top, or bottom
}
// ROOM 3
function t3() {
  this.entrance = "south"; // south, east, or west *Note no north entrances allowed**
  this.exit = "west"; // north, east, or west **Note no south exits allowed**
  this.orientation = "1x1"; // 1x1, 1x2, or 2x1
  this.half = undefined; // undefined, left, right, top, or bottom
}
// ROOM 4
function t4() {
  this.entrance = "east"; // south, east, or west *Note no north entrances allowed**
  this.exit = "north"; // north, east, or west **Note no south exits allowed**
  this.orientation = "1x1"; // 1x1, 1x2, or 2x1
  this.half = undefined; // undefined, left, right, top, or bottom
}
// ROOM 5
function t5() {
  this.entrance = "east"; // south, east, or west *Note no north entrances allowed**
  this.exit = "west"; // north, east, or west **Note no south exits allowed**
  this.orientation = "1x1"; // 1x1, 1x2, or 2x1
  this.half = undefined; // undefined, left, right, top, or bottom
}
// ROOM 6
function t6() {
  this.entrance = "west"; // south, east, or west *Note no north entrances allowed**
  this.exit = "north"; // north, east, or west **Note no south exits allowed**
  this.orientation = "1x1"; // 1x1, 1x2, or 2x1
  this.half = undefined; // undefined, left, right, top, or bottom
}
// ROOM 7
function t7() {
  this.entrance = "west"; // south, east, or west *Note no north entrances allowed**
  this.exit = "east"; // north, east, or west **Note no south exits allowed**
  this.orientation = "1x1"; // 1x1, 1x2, or 2x1
  this.half = undefined; // undefined, left, right, top, or bottom
}
// ROOM 8
function t8() {
  this.entrance = "west"; // south, east, or west *Note no north entrances allowed**
  this.exit = "north"; // north, east, or west **Note no south exits allowed**
  this.orientation = "1x2"; // 1x1, 1x2, or 2x1
  this.half = "left"; // undefined, left, right, top, or bottom
}
function t9() {
  this.entrance = "west"; // south, east, or west *Note no north entrances allowed**
  this.exit = "north"; // north, east, or west **Note no south exits allowed**
  this.orientation = "1x2"; // 1x1, 1x2, or 2x1
  this.half = "right"; // undefined, left, right, top, or bottom
}
// ROOM 9
function t10() {
  this.entrance = "east"; // south, east, or west *Note no north entrances allowed**
  this.exit = "north"; // north, east, or west **Note no south exits allowed**
  this.orientation = "1x2"; // 1x1, 1x2, or 2x1
  this.half = "left"; // undefined, left, right, top, or bottom
}
function t11() {
  this.entrance = "east"; // south, east, or west *Note no north entrances allowed**
  this.exit = "north"; // north, east, or west **Note no south exits allowed**
  this.orientation = "1x2"; // 1x1, 1x2, or 2x1
  this.half = "right"; // undefined, left, right, top, or bottom
}
// ROOM 10
function t12() {
  this.entrance = "south"; // south, east, or west *Note no north entrances allowed**
  this.exit = "east"; // north, east, or west **Note no south exits allowed**
  this.orientation = "1x2"; // 1x1, 1x2, or 2x1
  this.half = "left"; // undefined, left, right, top, or bottom
}
function t13() {
  this.entrance = "south"; // south, east, or west *Note no north entrances allowed**
  this.exit = "east"; // north, east, or west **Note no south exits allowed**
  this.orientation = "1x2"; // 1x1, 1x2, or 2x1
  this.half = "right"; // undefined, left, right, top, or bottom
}
// ROOM 11
function t14() {
  this.entrance = "south"; // south, east, or west *Note no north entrances allowed**
  this.exit = "west"; // north, east, or west **Note no south exits allowed**
  this.orientation = "1x2"; // 1x1, 1x2, or 2x1
  this.half = "left"; // undefined, left, right, top, or bottom
}
function t15() {
  this.entrance = "south"; // south, east, or west *Note no north entrances allowed**
  this.exit = "west"; // north, east, or west **Note no south exits allowed**
  this.orientation = "1x2"; // 1x1, 1x2, or 2x1
  this.half = "right"; // undefined, left, right, top, or bottom
}
// ROOM 12
function t16() {
  this.entrance = "west"; // south, east, or west *Note no north entrances allowed**
  this.exit = "west"; // north, east, or west **Note no south exits allowed**
  this.orientation = "2x1"; // 1x1, 1x2, or 2x1
  this.half = "bottom"; // undefined, left, right, top, or bottom
}
function t17() {
  this.entrance = "west"; // south, east, or west *Note no north entrances allowed**
  this.exit = "west"; // north, east, or west **Note no south exits allowed**
  this.orientation = "2x1"; // 1x1, 1x2, or 2x1
  this.half = "top"; // undefined, left, right, top, or bottom
}
// ROOM 13
function t18() {
  this.entrance = "east"; // south, east, or west *Note no north entrances allowed**
  this.exit = "east"; // north, east, or west **Note no south exits allowed**
  this.orientation = "2x1"; // 1x1, 1x2, or 2x1
  this.half = "bottom"; // undefined, left, right, top, or bottom
}
function t19() {
  this.entrance = "east"; // south, east, or west *Note no north entrances allowed**
  this.exit = "east"; // north, east, or west **Note no south exits allowed**
  this.orientation = "2x1"; // 1x1, 1x2, or 2x1
  this.half = "top"; // undefined, left, right, top, or bottom
}