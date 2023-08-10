import Phaser from 'phaser';
import Player from './Player';

export default class Player2 extends Player {
    public name: string = 'Anonymuse';
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
    public standKey: string = 'standingP2';
    public walkKey: string = 'walkingP2';
    public runKey: string = 'runningP2';
    public runShootKey: string = 'runShootP2';
    public jumpKey: string = 'jumpingP2';
    public hurtKey: string = 'hurtP2';
    public attackKey: string = 'shootP2';
    public dyingKey: string = 'hurtP2';

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

    protected handleAnimationComplete(animation: Phaser.Animations.Animation, frame: Phaser.Animations.AnimationFrame) {
        if (animation.key === this.dyingKey) {
            this.isDead = true;
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
            // if moving in x direction, play runShoot animation
            if (this.body!.velocity.x !== 0) {
                // play animation if not already playing
                if (this.currentAnimation !== this.runShootKey) this.play(this.runShootKey, false);
            } else {
                // play animation if not already playing
                if (this.currentAnimation !== this.attackKey) this.play(this.attackKey, true);
            }
    
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
