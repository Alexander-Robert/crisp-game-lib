//Pair Prototype Project
//Authors: Alexander Robert and Milo Fisher

title = "";

description = `
`;

characters = [];

options = {};

const SETTINGS = {
  LAYOUT_WIDTH: 3,
};

// Global Variables
let roomLayout;
let currentRoom;
let startRoomTypes;
let roomTypes;

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
}

// Called every frame, 60 fps
function update() {
  if (!ticks) { start(); }


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