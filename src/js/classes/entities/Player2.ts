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
    public crouchKey: string = 'crouchingP2';

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string | number) {
        super(scene, x, y, texture, frame);
        this.setDepth(5);

        // Ensure the scene is not undefined before adding the sprite
        if (scene) {
            scene.add.existing(this);
            if (scene.physics && scene.physics.world) {
                scene.physics.world.enable(this);
            }
        }
    }

    protected handleAnimationStart(animation: Phaser.Animations.Animation, frame: Phaser.Animations.AnimationFrame) {
        // Tweak the hitbox for the running and walking animation
        if (animation.key === this.runKey || animation.key === this.walkKey) {
            this.setVelocityY(0);
        }
        super.handleAnimationStart(animation, frame);
        console.log('Animation started:', animation.key);
    }

    protected handleAnimationComplete(animation: Phaser.Animations.Animation, frame: Phaser.Animations.AnimationFrame) {
        if (animation.key === this.dyingKey) {
            this.isDead = true;
        }

        if (this.currentAnimation === animation.key) {
            this.currentAnimation = undefined;
        }
        console.log('Animation completed:', animation.key);
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
                this.play(this.runShootKey, true);
            } else {
                this.play(this.attackKey, true);
            }
            if (!this.shootSound) {
                this.shootSound = this.scene.sound.add(this.attackKey);
                this.shootSound.on('complete', () => {
                    // Create projectile
                    this.emitProjectile();
                    this.shootSound = null;
                });
            }
    
            if (!this.shootSound.isPlaying) {
                this.shootSound.play({ volume: 0.5, loop: false });
            }
        }
    }

    private emitProjectile() {
        // Create a projectile at player's position
        let projectile = this.projectileGroup.create(this.x, this.y, 'projectile-1').setGravityY(0).setVelocityY(0);
        projectile.setVelocityX(this.flipX ? -2250 : 2250); // Set velocity based on player's direction

        // Optionally, set additional properties, collision handling, etc.
    }
}
