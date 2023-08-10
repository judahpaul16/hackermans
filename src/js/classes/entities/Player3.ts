import Phaser from 'phaser';
import Player from './Player';

export default class Player3 extends Player {
    public name: string = 'Anonymoose';
    public currentAnimation?: string;
    public maxHealth: number = 100;
    public currentHealth: number = 100;
    public isDead: boolean = false;
    public healthBarFill!: Phaser.GameObjects.Graphics;
    public healthBarFrame!: Phaser.GameObjects.Image;
    public avatar!: Phaser.GameObjects.Image;
    public amask!: Phaser.GameObjects.Graphics;
    public hudContainer!: Phaser.GameObjects.Container;
    private shootSound: Phaser.Sound.BaseSound | null = null;
    public isActive: boolean = false;
    public standKey: string = 'standingP3';
    public walkKey: string = 'walkingP3';
    public runKey: string = 'runningP3';
    public jumpKey: string = 'jumpingP3';
    public hurtKey: string = 'hurtP3';
    public attackKey: string = 'shootP3';
    public dyingKey: string = 'dyingP3';

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string | number) {
        super(scene, x, y, texture, frame);

        // Ensure the scene is not undefined before adding the sprite
        if (scene) {
            scene.add.existing(this);
            if (scene.physics && scene.physics.world) {
                scene.physics.world.enable(this);
                this.setDepth(5);
            }
        }
    }

    public jump() {
        if (this && this.body!.touching.down) {
            this.setVelocityY(-450);
            this.play(this.jumpKey, true);
        }
    }

    public attack() {
        if (this) {
            // play animation if not already playing
            if (this.currentAnimation !== this.attackKey) this.play(this.attackKey, true);
    
            if (!this.shootSound) {
                this.shootSound = this.scene.sound.add(this.attackKey);
                this.shootSound.on('complete', () => {
                    this.shootSound = null;
                });
            }
    
            if (!this.shootSound.isPlaying) {
                this.shootSound.play({ volume: 0.5, loop: false });
            }
        }
    }    
}
