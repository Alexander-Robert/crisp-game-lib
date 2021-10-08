//TITLE IDEAS: Burger Builder, Dinner Dash, Diner Dash, Food Scramble, 
title = "Burger Builder";

description = `
     click - 
 flip direction
      hold - 
 throw away food
`;

characters = [
  `
llllll
ll l l
ll l l
llllll
 l  l
 l  l
 `,
  `
llllll
ll l l
ll l l
llllll
ll  ll
 `,  `
llllll
l l ll
l l ll
llllll
 l  l
 l  l
  `,
   `
llllll
l l ll
l l ll
llllll
ll  ll
  `
];

//Game constant for fine tuning important numbers and clarifying their usage.
const G = {
  WIDTH: 100,
  HEIGHT: 100,

  PLAYER_SPEED: 1,
};

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

/**
* @typedef { object } Ingredients - A falling object comprised of various colors
* @property { Vector } pos - The current position of the object
* @property { String } speed - The downwards floating speed of this object
*/
let ingredients;

function update() {
  if (!ticks) {
    player = {
      pos: vec(G.WIDTH * 0.5, G.HEIGHT - 3),
      //uses the constant base speed, but we want to modify it's sign 
      speed: G.PLAYER_SPEED, //so we have the speed property
      side: "right",
    };
  }


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
  if (player.pos.x >= G.WIDTH || player.pos.x <= 0) 
  {
    //TODO: Sell the burger 
    changeDirection();
  }
  player.pos.clamp(0, G.WIDTH, 0, G.HEIGHT); //TODO: safety line of code? Is this needed?
  color("purple");
  if (player.side == "right")
    char(addWithCharCode("a", floor(ticks / 15) % 2), player.pos);
  else if(player.side == "left")
    char(addWithCharCode("c", floor(ticks / 15) % 2), player.pos);
  //char("a", player.pos);
  
}

function changeDirection() {
  player.side = (player.side == "left") ? "right" : "left";
  console.log(player.side);
  player.speed *= -1;
}