import Phaser from 'phaser';

export default class Player extends Phaser.Physics.Arcade.Sprite {
    public name: string = 'Anonymouse';
    public currentAnimation?: string;
    public maxHealth: number = 100;
    public currentHealth: number = 100;
    public isDead: boolean = false;
    public healthBarFill!: Phaser.GameObjects.Graphics;
    public healthBarFrame!: Phaser.GameObjects.Image;
    public avatar!: Phaser.GameObjects.Image;
    public amask!: Phaser.GameObjects.Graphics;
    public hudContainer!: Phaser.GameObjects.Container;
    public isActive: boolean = true;

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string | number) {
        super(scene, x, y, texture, frame);

        // Ensure the scene is not undefined before adding the sprite
        if (scene) {
            scene.add.existing(this);
            if (scene.physics && scene.physics.world) {
                scene.physics.world.enable(this);
            }
        }

        // Setup event listeners for animationstart and animationcomplete
        this.on('animationstart', this.handleAnimationStart, this);
        this.on('animationcomplete', this.handleAnimationComplete, this);
    }
    
    private handleAnimationStart(animation: Phaser.Animations.Animation, frame: Phaser.Animations.AnimationFrame) {
        this.currentAnimation = animation.key;
    }

    private handleAnimationComplete(animation: Phaser.Animations.Animation, frame: Phaser.Animations.AnimationFrame) {
        if (animation.key === 'dyingP1') {
            this.isDead = true;
        }
        // Tweak the hitbox for the dying animation
        if (animation.key === 'dyingP1' && frame.index === 4) {
            const newWidth = 78;
            const newHeight = 12;
            this.body!.setSize(newWidth, newHeight);
            this.body!.setOffset(0, 0);
            this.y += 42;
        }

        // If the animation is 'meleeP1', reset gravity
        if (animation.key === 'meleeP1') {
            this.setVelocityY(-100);
        }

        if (this.currentAnimation === animation.key) {
            this.currentAnimation = undefined;
        }
    }
    
    public getCurrentAnimation() {
        return this.currentAnimation;
    }

    public takeDamage(amount: number) {
        this.currentHealth -= amount;
        if (this.currentHealth <= 0) {
            this.currentHealth = 0; // Ensure health doesn't go negative
        }
    }

    public heal(amount: number) {
        this.currentHealth += amount;
        if (this.currentHealth >= 100) {
            this.currentHealth = 100; // Ensure health doesn't go past 100
        }
    }

    public jump() {
        if (this && this.body!.touching.down) {
            this.setVelocityY(-450);
            this.play('jumpingP1', true);
        }
    }

    public attack() {
        if (this) {
            this.play('meleeP1', true);
            this.scene.sound.play('meleeP1', { volume: 0.5, loop: false });
        }
    }
}
