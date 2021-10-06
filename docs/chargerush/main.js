// The title of the game to be displayed on the title screen
title = "CHARGE RUSH";

// The description, which is also displayed on the title screen
description = `
Destroy enemies.
`;

// The array of custom sprites
//NOTE: characters are somehow mapped with alphabetical keys with the 1st item (at index 0) 
//      of the character array to be labeled "a", the 2nd item is "b", etc.
//Character descriptions:
//"a" - player
//"b" - enemies
//"c" - enemy bullets
characters = [
  `
  rr
  rr
ccrrcc
ccrrcc
ccrrcc
cc  cc
`, `
rr  rr
rrrrrr
rrpprr
rrrrrr
  rr
  rr
`, `
y  y
yyyyyy
 y  y
yyyyyy
 y  y
`
];

//Game constant we made for easily fine tuning important numbers and clarifying their usage.
const G = {
  WIDTH: 100,
  HEIGHT: 150,

  STAR_SPEED_MIN: 0.5,
  STAR_SPEED_MAX: 1.0,

  PLAYER_FIRE_RATE: 4,
  PLAYER_GUN_OFFSET: 3,

  FBULLET_SPEED: 5,

  ENEMY_MIN_BASE_SPEED: 1.0,
  ENEMY_MAX_BASE_SPEED: 2.0,
  ENEMY_FIRE_RATE: 45,

  EBULLET_SPEED: 2.0,
  EBULLET_ROTATION_SPD: 0.1
};

//Important settings that define key aspects of the game, e.g. viewport, music, etc.
options = {
  viewSize: { x: G.WIDTH, y: G.HEIGHT },
  seed: 2,
  isPlayingBgm: true,
  isReplayEnabled: true,
  theme: "dark",
};

//NOTE: These types of comments are pre-defining properties for specific objects
//      which forces the programmer to see incorrect usage of their defined objects
//      at compile time and will act as an error until correctly used.
//      (This is a typescript feature which is very useful due to it's common runtime error)
/**
* @typedef { object } Star - A decorative floating object in the background
* @property { Vector } pos - The current position of the object
* @property { number } speed - The downwards floating speed of this object
*/
let stars;

/**
* @typedef { object } Player - The object the player controls
* @property { Vector } pos - The current position of the object
* @property { number } firingCooldown - tracks the cooldown for firing
* @property { boolean } isFiringLeft - toggle for the offset of the dual barrel firing from the player
*/
let player;

/**
* @typedef { object } FBullet - Friendly bullets shot from the player
* @property { Vector } pos - The current position of the object
*/
let fBullets;

/**
* @typedef { object } Enemy - the enemy object that tries to shoot you
* @property { Vector } pos - The current position of the object
* @property { number } firingCooldown - tracks the cooldown for firing
*/
let enemies;

/**
 * @typedef { object } EBullet - Enemy bullets shot from the enemies
 * @property { number } angle - the angle of the bullet
 * @property { number } rotation - the rotation of the bullet
 */
let eBullets;

/**
 * @type { number }
 */
let currentEnemySpeed;

/**
 * @type { number }
 */
let waveCount;


// The game loop function
function update() {
  // The init function running at startup
  if (!ticks) {
    // A CrispGameLib function
    // First argument (number): number of times to run the second argument
    // Second argument (function): a function that returns an object. This
    // object is then added to an array. This array will eventually be
    // returned as output of the times() function.
    stars = times(20, () => {
      // Random number generator function
      // rnd( min, max )
      const posX = rnd(0, G.WIDTH);
      const posY = rnd(0, G.HEIGHT);
      // An object of type Star with appropriate properties
      return {
        // Creates a Vector
        pos: vec(posX, posY),
        // More RNG
        speed: rnd(G.STAR_SPEED_MIN, G.STAR_SPEED_MAX)
      };
    });

    player = {
      pos: vec(G.WIDTH * 0.5, G.HEIGHT * 0.5),
      firingCooldown: G.PLAYER_FIRE_RATE,
      isFiringLeft: true,
    };

    fBullets = [];
    enemies = [];
    eBullets = [];

    waveCount = 0;
  }

  // Spawning enemies
  if (enemies.length === 0) {
    currentEnemySpeed =
      rnd(G.ENEMY_MIN_BASE_SPEED, G.ENEMY_MAX_BASE_SPEED) * difficulty;
    for (let i = 0; i < 9; i++) {
      const posX = rnd(0, G.WIDTH);
      const posY = -rnd(i * G.HEIGHT * 0.1);
      enemies.push({ 
        pos: vec(posX, posY),
        firingCooldown: G.ENEMY_FIRE_RATE  
      });
    }
    waveCount++; //Increase the tracking variable by one
  }

  // Update for Star
  stars.forEach((s) => {
    // Move the star downwards
    s.pos.y += s.speed;
    // Bring the star back to top once it's past the bottom of the screen
    s.pos.wrap(0, G.WIDTH, 0, G.HEIGHT);

    // Choose a color to draw
    color("light_black");
    // Draw the star as a square of size 1
    box(s.pos, 1);
  });

  //Updating and drawing the player
  player.pos = vec(input.pos.x, input.pos.y);
  player.pos.clamp(0, G.WIDTH, 0, G.HEIGHT);
  // Cooling down for the next shot
  player.firingCooldown--;
  // Time to fire the next shot
  if (player.firingCooldown <= 0) {
    // Get the side from which the bullet is fired
    const offset = (player.isFiringLeft)
      ? -G.PLAYER_GUN_OFFSET
      : G.PLAYER_GUN_OFFSET;
    // Create the bullet
    fBullets.push({
      pos: vec(player.pos.x + offset, player.pos.y)
    });
    // Reset the firing cooldown
    player.firingCooldown = G.PLAYER_FIRE_RATE;
    // Switch the side of the firing gun by flipping the boolean value
    player.isFiringLeft = !player.isFiringLeft;

    color("yellow");
    // Generate particles
    particle(
      player.pos.x + offset, // x coordinate
      player.pos.y, // y coordinate
      4, // The number of particles
      1, // The speed of the particles
      -PI / 2, // The emitting angle
      PI / 4  // The emitting width
    );
  }
  color("black");
  char("a", player.pos);

  // Updating and drawing bullets
  fBullets.forEach((fb) => {
    // Move the bullets upwards
    fb.pos.y -= G.FBULLET_SPEED;

    // Drawing
    color("yellow");
    box(fb.pos, 2);
  });

  remove(fBullets, (fb) => {
    return fb.pos.y < 0;
  });
  //text(fBullets.length.toString(), 3, 10);

  //removing enemies
  remove(enemies, (e) => {
    e.pos.y += currentEnemySpeed;
    e.firingCooldown--;
    if (e.firingCooldown <= 0) {
      eBullets.push({
        pos: vec(e.pos.x, e.pos.y),
        angle: e.pos.angleTo(player.pos),
        rotation: rnd()
      });
      e.firingCooldown = G.ENEMY_FIRE_RATE;
      play("select");
    }

    color("black");
    // Interaction from enemies to fBullets
    // Shorthand to check for collision against another specific type
    // Also draw the sprite
    const isCollidingWithFBullets = char("b", e.pos).isColliding.rect.yellow;
    const isCollidingWithPlayer = char("b", e.pos).isColliding.char.a;
    if (isCollidingWithPlayer) {
      end();
      play("powerUp");
  }
    // Check whether to make a small particle explosin at the position
    if (isCollidingWithFBullets) {
      color("yellow");
      particle(e.pos);
      play("explosion");
      addScore(10 * waveCount, e.pos);
    }

    // Also another condition to remove the object
    return (isCollidingWithFBullets || e.pos.y > G.HEIGHT);
  });

  remove(fBullets, (fb) => {
    // Interaction from fBullets to enemies, after enemies have been drawn
    color("yellow");
    const isCollidingWithEnemies = box(fb.pos, 2).isColliding.char.b;
    return (isCollidingWithEnemies || fb.pos.y < 0);
  });

  remove(eBullets, (eb) => {
    // Old-fashioned trigonometry to find out the velocity on each axis
    eb.pos.x += G.EBULLET_SPEED * Math.cos(eb.angle);
    eb.pos.y += G.EBULLET_SPEED * Math.sin(eb.angle);
    // The bullet also rotates around itself
    eb.rotation += G.EBULLET_ROTATION_SPD;

    color("red");
    const isCollidingWithPlayer
      = char("c", eb.pos, { rotation: eb.rotation }).isColliding.char.a;

    if (isCollidingWithPlayer) {
      // End the game
      end();
      // Sarcasm; also, unintedned audio that sounds good in actual gameplay
      play("powerUp");
    }

    const isCollidingWithFBullets
      = char("c", eb.pos, { rotation: eb.rotation }).isColliding.rect.yellow;
    if (isCollidingWithFBullets) addScore(1, eb.pos);
    // If eBullet is not onscreen, remove it
    return (!eb.pos.isInRect(0, 0, G.WIDTH, G.HEIGHT));
  });
}