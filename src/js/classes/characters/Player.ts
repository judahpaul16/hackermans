import Phaser from 'phaser';
import Enemy from './Enemy';
import InputManager from '../utils/InputManager';
import e from 'express';

export default class Player extends Phaser.Physics.Arcade.Sprite {
    public number: number = 1;
    public name: string = 'Anonymouse';
    public width!: number;
    public height!: number;
    public offsetX!: number;
    public offsetY!: number;
    public scale!: number;
    public currentAnimation?: string;
    public maxHealth: number = 100;
    public currentHealth: number = 100;
    public walkSpeed: number = 175;
    public runSpeed: number = 350;
    public jumpSpeed: number = 550;
    public isDead: boolean = false;
    public healthBarFill?: Phaser.GameObjects.Graphics;
    public healthBarFrame?: Phaser.GameObjects.Image;
    public avatar?: Phaser.GameObjects.Image;
    public amask?: Phaser.GameObjects.Graphics;
    public healthBar?: Phaser.GameObjects.Container;
    public isFollowing: boolean = true;
    public textureKey: string = 'player';
    public avatarKey: string = 'avatar';
    public hbFrameKey: string = 'health-bar-frame';
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
    public showAnimationInfo: boolean = false;
    public animationInfoText!: Phaser.GameObjects.Text;
    private hitSpritePool: Phaser.GameObjects.Sprite[] = [];
    public isHunting: boolean = false;

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string | number) {
        super(scene, x, y, texture, frame);

        // Ensure the scene is not undefined before adding the sprite
        if (scene) {
            scene.add.existing(this);
            if (scene.physics && scene.physics.world) {
                scene.physics.world.enable(this);
                if (this.scale) this.setScale(this.scale);
                if (this.width && this.height) this.body!.setSize(this.width, this.height);
                if (this.offsetX && this.offsetY) this.body!.setOffset(this.offsetX, this.offsetY);

                if (!this.indicator) {
                    // Create an inidicator that floats above the player then disappears after 2 seconds
                    this.indicator = scene.add.image(this.x, this.y - 75, 'player-indicator');
                    this.indicator.setDepth(10).setVisible(false);              
                }
                this.animationInfoText =
                    scene.add.text(
                        this.x - 100, this.y - 100, '',
                        { fontSize: '16px', color: '#fff' }
                    ).setDepth(10).setVisible(false);
            }
        }
        this.setDepth(4);

        // // Keep the player's inside the scene
        // this.setCollideWorldBounds(true)

        // Setup event listeners for animationstart and animationcomplete
        this.on('animationstart', this.handleAnimationStart, this);
        this.on('animationcomplete', this.handleAnimationComplete, this);
    }
    
    protected handleAnimationStart(
        animation: Phaser.Animations.Animation,
        frame: Phaser.Animations.AnimationFrame
    ) {
        this.currentAnimation = animation.key;
    }

    protected handleAnimationComplete(
        animation: Phaser.Animations.Animation,
        frame: Phaser.Animations.AnimationFrame
    ) {
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

    public updateAnimationInfo() {
        if (this && this.anims && this.showAnimationInfo && this.animationInfoText && this.anims.currentFrame) {
            // Retrieve the frame number of the current animation
            const frameNumber = this.anims.currentFrame ? this.anims.currentFrame.index : 'N/A';
            this.animationInfoText.setText(`Animation: ${this.currentAnimation}\nFrame: ${frameNumber}`);
            this.animationInfoText.setPosition(this.x - 100, this.y - 100);
            this.animationInfoText.setVisible(true);
        } else if (this.animationInfoText) {
            this.animationInfoText.setVisible(false);
        }
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
            this.setVelocityY(-this.jumpSpeed);
            this.play(this.jumpKey, true);
        }
    }

    public attack() {
        if (this)
            this.play(this.attackKey, true)
            this.scene.sound.play(this.attackKey, { volume: 0.5, loop: false });
    }

    public specialAttack() {
        return;
    }

    private computeBufferZone(followingPlayerNumber: number, activePlayerNumber: number): number {
        if (followingPlayerNumber === 2 && activePlayerNumber === 1) {
            return 600;
        } else if (followingPlayerNumber === 3 && activePlayerNumber === 1) {
            return 300;
        } else if (followingPlayerNumber === 1 && activePlayerNumber === 2) {
            return 600;
        } else if (followingPlayerNumber === 3 && activePlayerNumber === 2) {
            return 300;
        } else if (followingPlayerNumber === 1 && activePlayerNumber === 3) {
            return 300;
        }
        return 600;
    }

    public follow(
        playerToBeFollowed: any,
        followSpeed: number = playerToBeFollowed.runSpeed,
        walkSpeed: number = playerToBeFollowed.walkSpeed,) {
        const activePlayer: Player = this.scene.game.registry.get('activePlayer');

        let bufferZone = this.computeBufferZone(this.number, activePlayer.number);

        if (activePlayer === this) {
            this.isHunting = false;
            return;
        }

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
                if (Math.abs(distanceToPlayer) <= bufferZone) {
                    // if move to be exactly at bufferZone, then stop moving
                    if (Math.abs(distanceToPlayer) < 50) {
                        this.play(walkingKey, true);
                        this.setVelocityX(distanceToPlayer < 0 ? walkSpeed : -walkSpeed);
                    }
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
        this.hunt();
    }

    public hunt() {
        if (!this.isHunting) {
            this.isHunting = true;
            // Find the nearest player
            let nearestDistance: number = Infinity;
            let nearestEnemy: Enemy | undefined;
            let enemies = this.scene.game.registry.get('enemies');
            for (let enemy of enemies) {
                const tempDistance = Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y);
                if (tempDistance < nearestDistance) {
                    nearestDistance = tempDistance;
                    nearestEnemy = enemy;
                }
            }
            if (nearestEnemy) {
                // If player is within range (e.g., 600 pixels), attack
                if (nearestDistance <= 1000) {
                    // turn toward enemy
                    this.flipX = nearestEnemy.x < this.x;
                    this.attack();
                } else this.isHunting = false;
            }
        }
    }
}
