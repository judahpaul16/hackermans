import Phaser from 'phaser';
import Player from './Player';

export default class Player3 extends Player {
    public number: number = 3;
    public name: string = 'Anonymusk';
    public width: number = 83;
    public height: number = 186;
    public offsetX: number = -2;
    public offsetY: number = -38.4;
    public currentAnimation?: string;
    public maxHealth: number = 100;
    public currentHealth: number = 100;
    public runSpeed: number = 225;
    public jumpSpeed: number = 500;
    public magazine: number = 20;
    public magazineSize: number = 20;
    public isDead: boolean = false;
    public isReloading: boolean = false;
    public reloadText?: Phaser.GameObjects.Text;
    public type: string = 'ranged';
    private shootSound: Phaser.Sound.BaseSound | null = null;
    public textureKey: string = 'player3';
    public hbFrameKey: string = 'health-bar-frame-3';
    public avatarKey: string = 'avatarP3';
    public standKey: string = 'standingP3';
    public walkKey: string = 'walkingP3';
    public runKey: string = 'runningP3';
    public jumpKey: string = 'jumpingP3';
    public hurtKey: string = 'hurtP3';
    public attackKey: string = 'shootP3';
    public runShootKey: string = 'runShootP3';
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
        super.handleAnimationStart(animation, frame);
    }

    protected handleAnimationComplete(animation: Phaser.Animations.Animation, frame: Phaser.Animations.AnimationFrame) {
        if (animation.key === this.dyingKey) {
            this.isDead = true;
        }

        if (animation.key === this.attackKey) {
            if (this.y > 670) this.y -= 10;
        }

        if (this.currentAnimation === animation.key) {
            this.currentAnimation = undefined;
        }
    }

    public jump() {
        if (this && this.body!.touching.down) {
            this.setVelocityY(-this.jumpSpeed);
            this.play(this.jumpKey, true);
        }
    }

    public attack() {
        if (this.isReloading) {
            this.reloadText?.setVisible(true);
            return;
        }
        if (this) {
            // play animation if not already playing
            if (this.body!.velocity.x !== 0) this.play(this.runShootKey, true);
            else this.play(this.attackKey, true);
            // Create projectile
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
        if (this.scene && this.scene.game && this.scene.game.registry && !this.isReloading) {
            // Create a projectile at player's position
            let projectileGroup = this.scene.game.registry.get('friendlyProjectileGroup') as Phaser.Physics.Arcade.Group;
            let y = (this.body!.velocity.x != 0) ? this.y : this.y - 42;
            let projectile = projectileGroup.create(this.x, y, 'projectile-1').setScale(1.5);
            projectile.flipX = this.flipX;
            projectile.body.setAllowGravity(false);
            projectile.setVelocityX(this.flipX ? -1500 : 1500); // Set velocity based on player's direction
            this.magazine--;
        } else if (this.isReloading) {
            this.reloadText?.setVisible(true);
        }
    }

    public checkReload() {
        if (this.magazine <= 0) {
            this.isReloading = true;
            // start 10 second timer
            // when timer is up, set magazine to magazineSize
            this.scene.time.addEvent({
                delay: 10000,
                callback: () => {
                    this.magazine = this.magazineSize;
                    this.isReloading = false;
                },
                callbackScope: this,
                loop: false
            });
        } else {
            this.isReloading = false;
            this.reloadText?.setVisible(false);
        }
    }
}
