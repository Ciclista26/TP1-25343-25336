import Phaser from "phaser";
import { Turret } from "../turret";
import { Player } from "../player";
import { Enemie } from "../enemie";
import { BaseTurret } from "../base_turret";

const MODES = {
  Classic: 0,
  RunNGun: 1
}

const TILE_SIZE = 64;
const MODE = MODES.RunNGun
let ENEMIE_SPAWN_TIMER = 50;
const MAX_SCROLL = 3
const MIN_SCROLL = 0.5


export class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: "MainScene" });
  }

  preload() {
    this.load.image('turret_head', 'assets/turret_head.png');
    this.load.image('turret_body', 'assets/turret_body.png');
    this.load.image('player', 'assets/player.png')
    this.load.image('tile_grass', 'assets/grass.png')
    this.load.image('castle', 'assets/castle.png')
    this.load.image('bullet', 'assets/bullet.png')
    this.load.image('smoke', 'assets/smoke.png');
    this.load.image('enemie', 'assets/Slime.png');
    this.load.image('turret_fire', 'assets/fire_turret_head.png');
    this.load.image('fire', 'assets/fire.png');
    this.load.image('canon', 'assets/canon.png')
    this.load.image('crossair', 'assets/crossair.png')
  }

  create() {
    this.map = this.make.tilemap({ tileWidth: 64, tileHeight: 64, width: 64, height: 64 });
    this.tiles = this.map.addTilesetImage('tile_grass');
    this.layer = this.map.createBlankLayer('layer', this.tiles);
    this.layer.randomize(0, 0, 32, 32, [0, 0]); // Wall above the water
    this.turrets = this.physics.add.group()
    this.player = new Player(this, 150, 150);
    this.camera = this.cameras.main;
    this.castle = this.physics.add.sprite(800, 400, "castle");
    this.input.setPollAlways();
    this.window = this.sys.game.canvas;

    this.cursor = this.game.input.activePointer
    this.graphics = this.add.graphics();
    this.cursor_x = this.cursor.x;
    this.cursor_y = this.cursor.y;
    this.enemie_creation_timer = 0;
    this.enemies_group = this.add.group()

    if (MODE == MODES.Classic) {
      this.input.on('pointerdown', (pointer) => {
        let t = new BaseTurret(this.physics.world, this, pointer.x, pointer.y, 300, true, Math.round(Math.random()));
        this.turrets.add(t);
      })
    } else {
     this.input.manager.canvas.style.cursor = "none";
      this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
        if ((this.camera.zoom + deltaY * 0.001 >= MIN_SCROLL) && (this.camera.zoom + deltaY * 0.001 <= MAX_SCROLL)) {
          this.camera.zoom += deltaY * 0.001
        }
      })
      this.camera.startFollow(this.player);
      this.camera.zoom = 1.5
    }
    this.crossair = this.add.sprite(0, 0, "crossair")
    if (MODE != MODES.RunNGun) this.crossair.setVisible(false)
    this.bullets = this.add.group()
    this.scene_info = this.add.text(50, this.window.height - 50, '', { font: '20px Courier', fill: '#00ff00' })
  }

  update() {
    this.data.set('enemies', this.enemies_group.getLength());
    this.scene_info.setText([
      'Spawn Rate:' + ENEMIE_SPAWN_TIMER,
      'Nº Enemies: ' + this.data.get('enemies')
    ])
    if (MODE === MODES.RunNGun) {
      this.input.activePointer.updateWorldPoint(this.cameras.main);

      this.player.update();
      let t = this.player.spawn_turret();
      this.crossair.x = this.input.activePointer.worldX
      this.crossair.y = this.input.activePointer.worldY
      if (t) {
        this.camera.shake(100, 0.001)
        this.turrets.add(t)
      }
    } else {
      this.graphics.clear();
      this.graphics.fillStyle(0x00ff00, 0.5);
      this.cursor_x = Math.floor(this.cursor.x, this.cursor.x - TILE_SIZE);
      this.cursor_y = Math.floor(this.cursor.y, this.cursor.y - TILE_SIZE);
      this.graphics.fillCircle(this.cursor_x, this.cursor_y, TILE_SIZE / 2, TILE_SIZE / 2);
    }

    //the towers update is not doing anything at this point



    this.turrets.children.each((turret) => {
      if (turret.isDestroyed) {
        this.turrets.killAndHide(turret)
        this.turrets.remove(turret, true, true)
      } else {
        turret.look_at_target(this.enemies_group.children.getArray());
        turret.update();
      }
    })

    this.enemie_creation_timer++
    if (this.enemie_creation_timer > Math.random() * ENEMIE_SPAWN_TIMER * 2) {
      ENEMIE_SPAWN_TIMER -= Math.min(ENEMIE_SPAWN_TIMER, 0.05);
      this.enemies_amount++
      let position = {};

      switch (Math.ceil(Math.random() * 4)) {
        case 1:
          position['x'] = -TILE_SIZE
          position['y'] = Math.ceil(Math.random() * this.camera.height)
          break;
        case 2:
          position['x'] = TILE_SIZE
          position['y'] = Math.ceil(Math.random() * this.camera.height)
          break;
        case 3:
          position['y'] = -TILE_SIZE
          position['x'] = Math.ceil(Math.random() * this.window.width)
          break;
        default:
          position['y'] = TILE_SIZE
          position['x'] = Math.ceil(Math.random() * this.window.width)
          break;
      }

      const enemie = new Enemie(this, position['x'], position['y'], 100, 100, this.castle);
      this.physics.moveToObject(enemie, this.castle, 50);
      this.enemie_creation_timer -= ENEMIE_SPAWN_TIMER * 2;
      this.enemies_group.add(enemie);

      let collider = this.physics.add.overlap(enemie, this.castle, function(action) {
        action.body.stop();
        this.physics.world.removeCollider(collider);
        enemie.destroy();
      }, null, this);
    }
  }
}
