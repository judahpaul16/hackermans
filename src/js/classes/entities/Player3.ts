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
    public standKey: string = 'standingP3';
    public walkKey: string = 'walkingP3';
    public runKey: string = 'runningP3';
    public jumpKey: string = 'jumpingP3';
    public hurtKey: string = 'hurtP3';
    public attackKey: string = 'shootP3';
    public dyingKey: string = 'dyingP3';
    public crouchKey: string = 'crouchingP3';

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string | number) {
        super(scene, x, y, texture, frame);

        // Ensure the scene is not undefined before adding the sprite
        if (scene) {
            scene.add.existing(this);
            if (scene.physics && scene.physics.world) {
                scene.physics.world.enable(this);
            }
        }
        this.setDepth(3);
    }

    protected handleAnimationStart(animation: Phaser.Animations.Animation, frame: Phaser.Animations.AnimationFrame) {

        const newWidth = 35;
        const newHeight = 78;
        this.body!.setSize(newWidth, newHeight);
        this.body!.setOffset(0, -20);

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
            this.setVelocityY(-450);
            this.play(this.jumpKey, true);
        }
    }

    public attack() {
        if (this) {
            // play animation if not already playing
            this.play(this.attackKey, true);
            // Create projectile
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
        if (this.scene && this.scene.game && this.scene.game.registry   ) {
            // Create a projectile at player's position
            let projectileGroup = this.scene.game.registry.get('projectileGroup') as Phaser.Physics.Arcade.Group;
            let projectile = projectileGroup.create(this.x, this.y, 'projectile-1').setGravityY(0).setVelocityY(0);
            projectile.setVelocityX(this.flipX ? -2250 : 2250); // Set velocity based on player's direction
        }

        // Optionally, set additional properties, collision handling, etc.
    }
}
