import Phaser, { Game, Physics } from 'phaser';
import { Bullet } from './basic_bullet';

export class Turret extends Physics.Arcade.Sprite {
  constructor(scene, x, y, range, debug) {
    super(scene, x, y);
    this.debug = debug;
    this.sprite_head = scene.physics.add.sprite(x, y, 'turret_head');
    this.sprite_body = scene.physics.add.sprite(x, y, 'turret_body');
    this.sprite_head.setDepth(1);
    this.sprite_body.setDepth(0);
    const color = new Phaser.Display.Color();
    color.random(50)
    this.graphics = scene.add.graphics({ lineStyle: { width: 2, color: color.color } });
    this.aim_line = new Phaser.Geom.Line(322, 1000, 100, 100);
    //    this.area_of_attack = new Phaser.Geom.Circle(x, y, range);
    this.range = range
    // this.aim_line = scene.add.line(x, y, 0, 0, 140, 0, 0xff33ffff);
    scene.physics.add.existing(this);
    this.bullets = []

    this.current_selected_enemie;
    this.energy = 100
    this.text = this.scene.add.text(this.x + 32, this.y, '', { font: '16px Arial', fill: '#00ff00' });
    this.setData('name', 'Turret');
    this.setData('energy', this.energy);
    this.text.setText([
      this.getData('name'),
      this.getData('energy')
    ])

    this.bullets = [];
    this.bullet_timer = 10;
    this.isDestroyed = false;
  }

  decrease_energy() {
    this.energy -= 1;
    this.setData('energy', this.energy)
    if (this.energy < 1) {
      this._destroy()
    }
  }

  _destroy() {
    this.isDestroyed = true
    this.sprite_head.visible = false;
    this.sprite_body.visible = false;
    this.text.visible = false;
    this.graphics.visible = false;
  }

  update() {

    this.bullet_timer -= 1;
    if (this.bullet_timer < 0 && this.current_selected_enemie != null) {
      console.log("SHOOT")
      this.shoot()
      this.bullet_timer += 10
    }

  }

  shoot() {

    let bullet = new Bullet(this.scene.physics.world, this.scene, this.x, this.y, this.current_selected_enemie, 0);
    // console.log(_b)

    // let bullet = this.scene.physics.add.sprite(this.x, this.y, 'bullet');
    // this.scene.physics.world.enableBody(bullet);
    // this.scene.physics.moveTo(bullet, this.current_selected_enemie.x, this.current_selected_enemie.y, 500);
    this.decrease_energy();
    this.particles = this.scene.add.particles('smoke');

    this.emitter = this.particles.createEmitter({
      speed: 50,
      scale: { start: 0.2, end: 0 },
      blendMode: 'MULTIPLY'
    });

    this.emitter.startFollow(bullet)
    this.text.setText([
      this.getData('name'),
      'energy: ' + this.getData('energy')
    ])

    if (this.scene) {
      let collider = this.scene.physics.add.overlap(bullet, this.current_selected_enemie, function(action) {
        action.body.stop();
        this.scene.physics.world.removeCollider(collider);
        bullet.destroy();

        this.current_selected_enemie.destroy()
      }, null, this);
    }

  }

  look_at_target(targets) {

    if (targets.length === 0) return;
    let target;
    let targets_distance = targets.map(t => {
      // Formula to calculate de distance between 2 points √((x2 – x1)² + (y2 – y1)²)
      return [t, Math.sqrt(Math.pow(t.x - this.x, 2) + Math.pow(t.y - this.y, 2))]
    });

    targets_distance.sort((a, b) => {
      return a[1] - b[1];
    })

    target = targets_distance[0][0];

    //if(Math.abs((target.x + target.y) - (this.sprite_body.x + this.sprite_body.y)) < this.range) {
    let angleToPointer = Phaser.Math.Angle.Between(this.sprite_head.x, this.sprite_head.y, target.x, target.y);

    this.current_selected_enemie = target;
    this.sprite_head.rotation = angleToPointer;
    this.graphics.clear();
    //this.graphics.strokeCircleShape(this.area_of_attack);
    this.aim_line.x1 = this.sprite_body.x;
    this.aim_line.y1 = this.sprite_body.y;
    this.aim_line.x2 = target.x + 16;
    this.aim_line.y2 = target.y + 16;

    if (this.debug)
      this.graphics.strokeLineShape(this.aim_line);
    //}
  }

}
