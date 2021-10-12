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

// Called once upon initialization
function start() {
  roomLayout = [];
  currentRoom = generateRoom();
}

// Called every frame, 60 fps
function update() {
  if (!ticks) { start(); }


}

// Generates and returns a room in the layout
function generateRoom() {

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

/* Single Rooms:
 * TYPE: the numerical value that represents how the room will physically be drawn
 * Row, Col: the row and column coordinates in the roomLayout 2D array for the room
 */
function room(type, row, col) {
  this.type = type;
  this.pos = vec(row,col);
}

/* Combo Rooms:
 * TYPE: the numerical value that represents how the room will physically be drawn, type + 1
 *       represents second half of a combo room since each half will be drawn individually
 * Row A, Col A: the row and column coordinates in the roomLayout 2D array for the first half
 * Row B, Col B: the row and column coordinates in the roomLayout 2D array for the second half
 */
function comboRoom(type, rowA, colA, rowB, colB) {
  this.roomA = new room(type, rowA, colA);
  this.roomB = new room(type + 1, rowB, colB);
}
