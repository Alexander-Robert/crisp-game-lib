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

  PLAYER_SPEED: 0.8,

  FALLING_SPEED_MIN: 0.4,
  FALLING_SPEED_MAX: 0.7,
};

const MENU_WIDTH = 30;
const MENU_LINE_HEIGHT = 13; //the top of where the menu images will start spawning
const RIGHT_SCREEN_EDGE = G.WIDTH - MENU_WIDTH; //the playable game width 
const MAX_BURGERS = 8; //the maximum number of burgers allowed on the burger menu.
const INGREDIENT_AMOUNT = 10; //the amount of ingredients there should be on screen
const INGREDIENT_WIDTH = 6;

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

//the current burger that is being built on our tray
let burger = [];

//the list of colors that the ingredients can be
let colorsList = [
  "red",
  "green",
  "yellow",
  "blue",
  "purple",
  "cyan"
];

//array of all the falling ingredients
let ingredients = [];

function update() {
  if (!ticks) { //INITIALIZE SECTION-----------------------------------------
    //create two burgers on the menu at the start of the game
    times(2, () => { addBurgerToOrderMenu(); });
    //create the correct amount of ingredients for gameplay
    times(INGREDIENT_AMOUNT, () => { createIngredient(); });

    //define the player
    player = {
      pos: vec(RIGHT_SCREEN_EDGE * 0.5, G.HEIGHT - 3),
      //uses the constant base speed, but we want to modify it's sign 
      speed: G.PLAYER_SPEED, //so we have the speed property
      side: "right",
    };
  }//END OF INIT SECTION-----------------------------------------------------


  updatePlayer();

  //update the tray's internal hitbox and draw it
  updateTray();


  updateIngredients();

  displayUI();

  //lose condition
  if (burgerList.length > MAX_BURGERS) {
    //TODO: fix the end message
    end(`Too many hungry customers!!!`);
  }
}

function updatePlayer() {
  //have the player constantly move horizontally
  player.pos.x += player.speed;

  //check tap input
  if (input.isJustPressed) {
    changeDirection();
    //addBurgerToOrderMenu();
  }

  //TODO: check holding input (with a console log)

  //check if player touches edge of screen
  if (player.pos.x >= RIGHT_SCREEN_EDGE || player.pos.x <= 0) {
    //TODO: Sell the burger 
    sellBurger();
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
}

function changeDirection() {
  player.side = (player.side == "left") ? "right" : "left";
  player.speed *= -1;
}

function updateTray() {
  tray = {
    //the display position for the tray image itself
    displayPos: {
      x: player.pos.x + (player.side == "left" ? -3 : 3),
      y: player.pos.y - 4,
      width: 6,
      height: 2,
    },
    //the current hitbox for ingredients to collide with the tray and current burger
    hitbox: {
      x: player.pos.x + (player.side == "left" ? -3 : 3),
      y: player.pos.y - 4,
      width: 6,
      height: 2,
    }
  };
  if (burger.length > 0) {
    //the y level is at the top of the current burger stack 
    //(remember the top left of the screen is coords 0,0)
    tray.hitbox.y = tray.displayPos.y - (burger.length * 2);
    tray.hitbox.height = burger.length * 2;
    
    //now draw the current burger!
    for(let i = 0; i < burger.length; i++) {
      color(burger[i]);
      rect(vec(tray.displayPos.x - (tray.displayPos.width/2), 
      tray.displayPos.y - ((i+1)*2)), 
      tray.displayPos.width, 
      tray.displayPos.height);
    }
  }
  //draw the tray
  color("red");
  char("e", tray.displayPos.x, tray.displayPos.y);
}

function createIngredient() {
  // Random number generator function
  // rnd( min, max )
  const posX = rnd(0, RIGHT_SCREEN_EDGE - INGREDIENT_WIDTH);
  let randomIndex = rndi(0, colorsList.length - 1);
  let randomColor = colorsList[randomIndex];
  // create an ingredient object with appropriate properties
  let ingredient = {
    // Creates a Vector
    pos: vec(posX, 0),
    speed: rnd(G.FALLING_SPEED_MIN, G.FALLING_SPEED_MAX),
    color: randomColor
  }
  ingredients.push(ingredient);
}

function updateIngredients() {
  // Update for ingredients
  for (let i = 0; i < ingredients.length; i++) {
    // Move the ingredient downwards
    ingredients[i].pos.y += ingredients[i].speed;
    // Bring the ingredient back to top once it's past the bottom of the screen
    ingredients[i].pos.wrap(0, G.WIDTH, 0, G.HEIGHT);

    // Choose a color to draw
    color(ingredients[i].color);
    //color("light_black");
    // Draw the ingredient as a rectangle 
    rect(ingredients[i].pos, INGREDIENT_WIDTH, 2);
  }

  //removing ingredients that collide with the tray/burger
  remove(ingredients, (ingredient) => {
    //check if ingredient hitbox is colliding with the tray's hitbox
    let colliding = false;
    let ingredientWidth = 6;
    let ingredientHeight = 2;    
    if (ingredient.pos.x                  < tray.hitbox.x + tray.hitbox.width &&
      ingredient.pos.x + ingredientWidth  > tray.hitbox.x &&
      ingredient.pos.y                    < tray.hitbox.y + tray.hitbox.height &&
      ingredient.pos.y + ingredientHeight > tray.hitbox.y) {
      colliding = true;
    }
    if (colliding) {
      // console.log("collided with tray!");
      // console.log("ingredient:");
      // console.log(ingredient);
      //add the color content to the burger array of the current burger being built
      burger.push(ingredient.color);
      play("powerUp");
    }
    //NOTE: If you're wondering where the burger is being drawn, look at updateTray()
    // return boolean determines if the current ingredient being evaluated is to be deleted or not.
    return (colliding);
  });

}

function sellBurger() {
  //find the burger in the order menu
  let equal = false;
  let index = -1;
  if (burger.length == 0) return;
  //check if burger is in the burger list
  for (let i = 0; i < burgerList.length; i++) {
    if (burgerList[i].length == burger.length) {
      for (let j = 0; j < burgerList[i].length; j++) {
        if (burger[j] !== burgerList[i][j]) break;
        if (j == burgerList[i].length - 1) equal = true;
      }
    }
    if (equal) {
      index = i;
      break;
    }
  }
  //if we found the burger, sell it!!!!
  if (index > -1) {
    burgerList.splice(index, 1);
  }
  //else, you sold garbage! (remove some score points)
  else {
    //TODO: remove points for bad burger
  }

  //clear the tray of the current burger
  //this works because the burger simply holds the colors of the ingredients
  //so other functions using the burger will auto update their state of it
  burger = [];
}

function addBurgerToOrderMenu() {
  let currentColorsList = [
    "red",
    "green",
    "yellow",
    "blue",
    "purple",
    "cyan"
  ];
  let newBurger = [];
  let numOfIngredients = rndi(3, 6);
  //add a random number of indredients to the burger
  for (let i = 0; i < numOfIngredients; i++) {
    //if this is the last ingredient (AKA the bun) make it the same color as the other bun
    if (i == numOfIngredients - 1) {
      newBurger.push(newBurger[0]);
      break;
    }
    //and give each ingredient a random color
    let randomColor = currentColorsList[rndi(0, currentColorsList.length - 1)];
    let index = currentColorsList.indexOf(randomColor);
    if (index > -1) {
      currentColorsList.splice(index, 1);
    }
    else console.warn("addBurgerToOrderMenu(): could not find color in list");
    newBurger.push(randomColor);
  }
  //add the burger to the end of the list
  burgerList.push(newBurger);
}

function displayUI() {
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
  for (let i = 0; i < burgerList.length; i++) {
    if (i != 0)
      burgerUI_OFFSET_HEIGHT += 4 + burgerList[i - 1].length;
    //looping through each burger
    for (let j = 0; j < burgerList[i].length; j++) {
      //looping through each ingredient
      color(burgerList[i][j]);
      if (j < burgerList[i].length / 2)
        rect(ingredientUI_X - j,
          ingredientUI_Y + j + burgerUI_OFFSET_HEIGHT,
          ingredientUI_LENGTH + (j * 2), 1);
      //once we're halfway through displaying the burger, start shortening it again
      else
        rect(ingredientUI_X - (burgerList[i].length - j),
          ingredientUI_Y + j + burgerUI_OFFSET_HEIGHT,
          ingredientUI_LENGTH + ((burgerList[i].length - j) * 2), 1);
    }
  }
}