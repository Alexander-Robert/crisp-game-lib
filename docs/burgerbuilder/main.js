//TITLE IDEAS: Burger Builder, Dinner Dash, Diner Dash, Food Scramble, 
title = "Burger Builder";

description = `
     click - 
 flip direction
      hold - 
 throw away food
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
`, `
l    l
llllll
`
];

//Game constant for fine tuning important numbers and clarifying their usage.
const G = {
  WIDTH: 130,
  HEIGHT: 100,

  PLAYER_SPEED: 1,

  FALLING_SPEED_MIN: 0.5,
  FALLING_SPEED_MAX: 1.0,
};
const MENU_WIDTH = 30;
const MENU_LINE_HEIGHT = 13; //the top of where the menu images will start spawning
const RIGHT_SCREEN_EDGE = G.WIDTH - MENU_WIDTH; //the playable game width 

//Important settings that define key aspects of the game, e.g. viewport, music, etc.
options = {
  viewSize: { x: G.WIDTH, y: G.HEIGHT },
  //isPlayingBgm: true,
  isShowingTime: true,
  //seed: 2,
  //isReplayEnabled: true,
  //theme: "dark",
};

/**
* @typedef { object } Player - The object the player controls
* @property { Vector } pos - The current position of the object
* @property { number } speed - The player speed
* @property { number } side - the direction the character is facing
*/
let player;
//the plate the player uses to catch falling ingredients
//since it's anchored to the player, it only needs to use the player's properties
let tray;

//a list of arrays where each array is the color of the ingredient
//ex. ["yellow", "green", "red", "yellow"] constitues the ingredients for what will look like a burger
let burgerList = [];

/**
* @typedef { object } Ingredients - A falling object comprised of various colors
* @property { Vector } pos - The current position of the object
* @property { String } speed - The downwards floating speed of this object
* @property { number } width - the width of the ingredient //TODO: see if we remove this if we create custom art
*/
let ingredients;

function update() {
  if (!ticks) {
    //temp code defining burgers to interpret in the burgerList
    burgerList = [
      ["yellow", "green", "red", "yellow"],
      ["cyan", "purple", "blue", "red", "cyan"],
      ["red", "green", "blue", "red"]
    ];
    //temp code for falling ingredients
    ingredients = times(20, () => {
      // Random number generator function
      // rnd( min, max )
      const posX = rnd(0, RIGHT_SCREEN_EDGE);
      // An object of type Star with appropriate properties
      return {
        // Creates a Vector
        pos: vec(posX, 0),
        // More RNG
        speed: rnd(G.STAR_SPEED_MIN, G.STAR_SPEED_MAX)
      };
    });

    player = {
      pos: vec(RIGHT_SCREEN_EDGE * 0.5, G.HEIGHT - 3),
      //uses the constant base speed, but we want to modify it's sign 
      speed: G.PLAYER_SPEED, //so we have the speed property
      side: "right",
    };
  }//END OF INIT SECTION-----------------------------------------------------

  // Update for ingredients
  ingredients.forEach((ingredient) => {
    // Move the star downwards
    ingredient.pos.y += ingredient.speed;
    // Bring the star back to top once it's past the bottom of the screen
    ingredient.pos.wrap(0, G.WIDTH, 0, G.HEIGHT);

    // Choose a color to draw
    color("light_black");
    // Draw the star as a square of size 1
    box(ingredient.pos, 1);
  });

  //have the player constantly move horizontally
  player.pos.x += player.speed;

  //check tap input
  if (input.isJustPressed) {
    changeDirection();
  }

  //TODO: check holding input (with a console log)
  //TODO: flip character image when flipped (add facingRight boolean and rewrite speed logic around it)
  //TODO: cycle through character animation frames
  //TODO: spawn different color rectanles (AKA ingredients)

  //check if player touches edge of screen
  if (player.pos.x >= RIGHT_SCREEN_EDGE || player.pos.x <= 0) {
    //TODO: Sell the burger 
    changeDirection();
  }
  player.pos.clamp(0, RIGHT_SCREEN_EDGE, 0, G.HEIGHT); //TODO: safety line of code? Is this needed?
  color("purple");
  //draw the player based on the direction they are facing
  //addWithCharCode seems to allow us to rotate the character letter 
  //between "a"&"b" or "c"&"d" respectively at a consistent framerate
  //AKA CrispGameLib's janky form of animation!!!!
  if (player.side == "right")
    char(addWithCharCode("a", floor(ticks / 15) % 2), player.pos);
  else if (player.side == "left")
    char(addWithCharCode("c", floor(ticks / 15) % 2), player.pos);

  //draw tray given player's properties
  color("red");
  tray = char("e", player.pos.x + (player.side == "left" ? -3 : 3), player.pos.y - 4);

  //Draw the menu UI
  //black menu background
  color("black");
  rect(RIGHT_SCREEN_EDGE, 0, MENU_WIDTH, G.HEIGHT);
  //white line below text
  color("white");
  rect(RIGHT_SCREEN_EDGE + 1, MENU_LINE_HEIGHT, MENU_WIDTH - 2, 1);
  //order menu text for UI
  text(`
  order 
  menu`, RIGHT_SCREEN_EDGE - 9, -3, { color: "white" });
  
  //displays burgers in the menu UI and shifts burgers down when burgers are adding to the list
  displayBurgerUI();
}

function displayBurgerUI() {
  //defining some constants that assist in aligning the burgers correctly
  const ingredientUI_X = RIGHT_SCREEN_EDGE + 10;
  const ingredientUI_Y = MENU_LINE_HEIGHT + 4;
  const ingredientUI_LENGTH = 10;

  let burgerUI_OFFSET_HEIGHT = 0;
  for(let i = 0; i < burgerList.length; i++) {
    if (i != 0)
      burgerUI_OFFSET_HEIGHT += 4 + burgerList[i - 1].length;
    //looping through each burger
    for(let j = 0; j < burgerList[i].length; j++) {
      //looping through each ingredient
      color(burgerList[i][j]);
      if(j < burgerList[i].length / 2)
      rect(ingredientUI_X - j, 
        ingredientUI_Y + j + burgerUI_OFFSET_HEIGHT, 
        ingredientUI_LENGTH + (j*2), 1);
      //once we're halfway through displaying the burger, start shortening it again
        else
      rect(ingredientUI_X - (burgerList[i].length - j), 
        ingredientUI_Y + j + burgerUI_OFFSET_HEIGHT, 
        ingredientUI_LENGTH + ((burgerList[i].length - j)*2), 1);
    }
  }
  // color("yellow");
  // rect(ingredientUI_X, ingredientUI_Y, ingredientUI_LENGTH, 1);
  // color("green");
  // rect(ingredientUI_X - 1, ingredientUI_Y + 1, ingredientUI_LENGTH + 2, 1);
  // color("red");
  // rect(ingredientUI_X - 2, ingredientUI_Y + 2, ingredientUI_LENGTH + 4, 1);
  // color("yellow");
  // rect(ingredientUI_X, ingredientUI_Y + 3, ingredientUI_LENGTH, 1);
}

function changeDirection() {
  player.side = (player.side == "left") ? "right" : "left";
  player.speed *= -1;
}