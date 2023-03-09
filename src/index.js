import 'phaser';
import { Turret } from './turret';
import { Player } from './player';
import { MainScene } from './scenes/main_scene';

var config = {
  type: Phaser.AUTO,
  width: 1920/2,
  height: 1080/2,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }
    }
  },
  scene: [MainScene]
};

// -- Begin of variable declaration --
let game = new Phaser.Game(config);
// -- End of variable declaration --
