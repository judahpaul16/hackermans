import Phaser from 'phaser';
import Player from './Player';

export default class Player2 extends Player {
    public name: string = 'Anonymuz';
    public currentAnimation?: string;
    public maxHealth: number = 100;
    public currentHealth: number = 100;
    public isDead: boolean = false;
    public healthBarFill!: Phaser.GameObjects.Graphics;
    public healthBarFrame!: Phaser.GameObjects.Image;
    public avatar!: Phaser.GameObjects.Image;
    public amask!: Phaser.GameObjects.Graphics;
    public hudContainer!: Phaser.GameObjects.Container;
    private isShootP2Playing: boolean = false;
    private shootP2Sound: Phaser.Sound.BaseSound | null = null;

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string | number) {
        super(scene, x, y, texture, frame);

        // Ensure the scene is not undefined before adding the sprite
        if (scene) {
            scene.add.existing(this);
            if (scene.physics && scene.physics.world) {
                scene.physics.world.enable(this);
            }
        }
    }

    public jump() {
        if (this && this.body!.touching.down) {
            this.setVelocityY(-450);
            this.play('jumpingP2', true);
        }
    }

    public attack() {
        if (this) {
            // if shoot p2 sound not playing
            if (this.currentAnimation !== 'shootP2') this.play('shootP2', true);
    
            if (!this.shootP2Sound) {
                this.shootP2Sound = this.scene.sound.add('shootP2');
                this.shootP2Sound.on('complete', () => {
                    this.shootP2Sound = null;
                });
            }
    
            if (!this.shootP2Sound.isPlaying) {
                this.shootP2Sound.play({ volume: 0.5, loop: false });
            }
        }
    }    
}
