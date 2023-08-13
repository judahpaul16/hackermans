import Phaser from 'phaser';
import Player from './Player';

export default class Player2 extends Player {
    public number: number = 2;
    public name: string = 'Anonymuse';
    public currentAnimation?: string;
    public maxHealth: number = 100;
    public currentHealth: number = 100;
    public runSpeed: number = 400;
    public isDead: boolean = false;
    private shootSound: Phaser.Sound.BaseSound | null = null;
    public standKey: string = 'standingP2';
    public walkKey: string = 'walkingP2';
    public runKey: string = 'runningP2';
    public runShootKey: string = 'runShootP2';
    public jumpKey: string = 'jumpingP2';
    public hurtKey: string = 'hurtP2';
    public attackKey: string = 'shootP2';
    public dyingKey: string = 'dyingP2';
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
    }

    protected handleAnimationComplete(animation: Phaser.Animations.Animation, frame: Phaser.Animations.AnimationFrame) {
        if (animation.key === this.dyingKey) {
            this.isDead = true;
        }

        if (this.currentAnimation === animation.key) {
            this.currentAnimation = undefined;
        }
    }

    public jump() {
        if (this && this.body!.touching.down) {
            this.setVelocityY(-550);
            this.play(this.jumpKey, true);
        }
    }

    public attack() {
        if (this) {
            // if moving in x direction, play runShoot animation
            if (this.body!.velocity.x !== 0) this.play(this.runShootKey, true);
            else this.play(this.attackKey, true);
            if (!this.shootSound) {
                this.shootSound = this.scene.sound.add(this.attackKey);
                this.shootSound.on('complete', () => {
                    // Create projectile
                    this.emitProjectile();
                    this.shootSound = null;
                });
            }
            if (!this.shootSound.isPlaying) this.shootSound.play({ volume: 0.5, loop: false });
        }
    }

    public specialAttack() {
        return;
    }

    private emitProjectile() {
        if (this.scene && this.scene.game && this.scene.game.registry   ) {
            // Create a projectile at player's position
            let projectileGroup = this.scene.game.registry.get('friendlyProjectileGroup') as Phaser.Physics.Arcade.Group;
            let projectile = projectileGroup.create(this.x, this.y, 'projectile-1').setGravityY(0).setVelocityY(0).setScale(1.5);
            projectile.flipX = this.flipX;
            projectile.setVelocityX(this.flipX ? -2250 : 2250); // Set velocity based on player's direction
        }
    }
}
