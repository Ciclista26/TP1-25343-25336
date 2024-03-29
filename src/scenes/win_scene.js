import Phaser from "phaser";
import { Turret } from "../turret";
import { Player } from "../player";
import { Enemie } from "../enemie";


export class WinGame extends Phaser.Scene {
    constructor() {
        super({ key: "wingame"})
    }

    create() {

        let hoverSprite = this.add.sprite(100, 100, "player").setScale(1).setDepth(2);
        hoverSprite.setVisible(false);
        let gameoverBg = this.add.rectangle(
            800,
            450,
            1600,
            900,
            '#4e8545',
            0.7
        ).setVisible(false);
        gameoverBg.setVisible(true);

        this.add.text(this.game.renderer.width / 2, this.game.renderer.height / 2 - 220, 'Congratulations\nYou win!', { font: '100px Arial', fill: '#fff', align: 'center' }).setOrigin(0.5).setDepth(2);

        let tryagainGame = this.add.text(this.game.renderer.width / 2, this.game.renderer.height / 2, '< Restart the game >', { font: '30px Arial', fill: '#fff' }).setOrigin(0.5).setDepth(2);
        tryagainGame.setInteractive();

        tryagainGame.on("pointerdown", () => {
            this.scene.stop("MainScene")
            this.scene.stop(this)
            this.scene.start("MainScene");
        });

        tryagainGame.on("pointerover", () => {
            hoverSprite.setVisible(true);
            hoverSprite.play("walk");
            hoverSprite.x = tryagainGame.x - tryagainGame.width;
            hoverSprite.y = tryagainGame.y - 8;
        })
        tryagainGame.on("pointerout", () => {
            hoverSprite.setVisible(false);
        })

        let choiseLabel = this.add.text(this.game.renderer.width / 2, this.game.renderer.height / 2 + 100, '< Click to return to the menu>', { font: '30px Arial', fill: '#fff' }).setOrigin(0.5).setDepth(2);
        choiseLabel.setInteractive();

        choiseLabel.on("pointerdown", () => {
            this.scene.launch("MainMenuScene")
            this.scene.stop("MainScene")
            this.scene.stop(this)
        });

        choiseLabel.on("pointerover", () => {
            hoverSprite.setVisible(true);
            hoverSprite.play("walk");
            hoverSprite.x = choiseLabel.x - choiseLabel.width;
            hoverSprite.y = choiseLabel.y - 8;
        })
        choiseLabel.on("pointerout", () => {
            hoverSprite.setVisible(false);
        })

    }

    get_ui_elements() {
        console.log(this.game_over_group)
        return this.game_over_group.getChildren()
    }

    update() {

    }
}
