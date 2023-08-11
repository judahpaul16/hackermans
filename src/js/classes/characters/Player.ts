import Phaser from 'phaser';
import InputManager from '../utils/InputManager';

export default class Player extends Phaser.Physics.Arcade.Sprite {
    public number: number = 1;
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
    public isFollowing: boolean = true;
    public standKey: string = 'standingP1';
    public walkKey: string = 'walkingP1';
    public runKey: string = 'runningP1';
    public jumpKey: string = 'jumpingP1';
    public attackKey: string = 'meleeP1';
    public dyingKey: string = 'dyingP1';
    public hurtKey: string = 'hurtP1';
    public crouchKey: string = 'crouchingP1';
    public inputManager: InputManager = new InputManager(this.scene);
    public projectileGroup!: Phaser.Physics.Arcade.Group;
    public indicator!: Phaser.GameObjects.Image;
    private hitSpritePool: Phaser.GameObjects.Sprite[] = [];

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string | number) {
        super(scene, x, y, texture, frame);

        // Ensure the scene is not undefined before adding the sprite
        if (scene) {
            scene.add.existing(this);
            if (scene.physics && scene.physics.world) {
                scene.physics.world.enable(this);

                if (!this.indicator) {
                    // Create an inidicator that floats above the player then disappears after 2 seconds
                    this.indicator = scene.add.image(this.x, this.y - 75, 'player-indicator');
                    this.indicator.setDepth(10).setVisible(false);              
                }
            }
        }
        this.setDepth(4);

        // // Keep the player's inside the scene
        // this.setCollideWorldBounds(true)

        // Setup event listeners for animationstart and animationcomplete
        this.on('animationstart', this.handleAnimationStart, this);
        this.on('animationcomplete', this.handleAnimationComplete, this);
    }
    
    protected handleAnimationStart(animation: Phaser.Animations.Animation, frame: Phaser.Animations.AnimationFrame) {
        this.currentAnimation = animation.key;
    }

    protected handleAnimationComplete(animation: Phaser.Animations.Animation, frame: Phaser.Animations.AnimationFrame) {
        if (animation.key === this.dyingKey) {
            this.isDead = true;
        }

        // Tweak the hitbox for the dying animation
        if (animation.key === this.dyingKey && frame.index === 4) {
            const newWidth = 78;
            const newHeight = 12;
            this.body!.setSize(newWidth, newHeight);
            this.body!.setOffset(0, 0);
            if (this.y > 670) this.y -= 10;
        }

        // If the animation is 'meleeP1', reset gravity
        if (animation.key === this.attackKey) {
            this.setVelocityY(-100);
        }

        if (this.currentAnimation === animation.key) {
            this.currentAnimation = undefined;
        }
    }
    
    public getCurrentAnimation() {
        return this.currentAnimation;
    }

    public isActive() {
        return (this.scene.game.registry.get('activePlayer').name === this.name);
    }

    public toggleIndicator() {
        if (this.indicator.visible === false && this.isActive()) {
            this.indicator.setVisible(true);
            // Hide the indicator after 2 seconds
            setTimeout(() => {
                this.indicator!.setVisible(false);
            }, 2000);
        } else {
            this.indicator.setVisible(false);
        }
    }

    public updateIndicatorPosition() {
        if (this.indicator)
            this.indicator.setPosition(this.x, this.y - 100);
    }

    public takeDamage(amount: number) {
        this.currentHealth -= amount;
        this.play(this.hurtKey, true);
    
        // Reuse or create a new hit sprite
        let hitSprite = this.hitSpritePool.find(sprite => !sprite.active);
        if (!hitSprite) {
            hitSprite = this.scene.add.sprite(this.x, this.y, 'hitSprite1').setDepth(10).setAlpha(0);
            hitSprite.on('animationcomplete', () => {
                if (hitSprite) hitSprite.setVisible(false).setActive(false);
            });
            this.hitSpritePool.push(hitSprite);
        }
    
        hitSprite.setPosition(this.x, this.y).setAlpha(1).setVisible(true).setActive(true).play('hitSprite1');
    
        if (this.currentHealth <= 0) {
            this.currentHealth = 0; // Ensure health doesn't go negative
            this.scene.physics.world.gravity.y = 0;
            this.anims.stop();
            this.play(this.dyingKey, true);
        }
    }

    public heal(amount: number) {
        this.currentHealth += amount;
        if (this.currentHealth >= 100)
            this.currentHealth = 100; // Ensure health doesn't go past 100
    }

    public jump() {
        if (this && this.body!.touching.down) {
            this.setVelocityY(-450);
            this.play(this.jumpKey, true);
        }
    }

    public attack() {
        if (this)
            this.play(this.attackKey, true)
            this.scene.sound.play(this.attackKey, { volume: 0.5, loop: false });
    }
    
    public follow(
        playerToBeFollowed: any,
        isP2: boolean,
        followSpeed: number = 300,
        bufferZone: number = (isP2 ? 300 : 150),
        walkSpeed: number = 175) {

        if (this.scene.registry.get('activePlayer') as Player === this) return;

        if (this.body!.touching.down) {
            let distanceToPlayer = this.x - playerToBeFollowed.x;
            let startFollowing = false;
            let standingKey: string = this.standKey;
            let walkingKey: string = this.walkKey;
            let runningKey: string = this.runKey;

            if (distanceToPlayer <= 400 || startFollowing || this.isFollowing) {
                startFollowing = true;
                this.isFollowing = true;
                // If close to the player, stop moving
                if (Math.abs(distanceToPlayer) < bufferZone) {
                    this.play(standingKey, true);
                    this.setVelocityX(0);
                } else {
                    let isCloser = Math.abs(distanceToPlayer) < walkSpeed;
                    let animation = isCloser ? walkingKey : runningKey;
                    let speed = isCloser ? walkSpeed : followSpeed;

                    this.y -= 10;
                    this.setOffset(0, -12);
                    this.play(animation, true);
                    this.setVelocityX(distanceToPlayer < 0 ? speed : -speed);
                    this.flipX = distanceToPlayer > 0;
                }
            }
        }
    }
}
