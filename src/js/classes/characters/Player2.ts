import Phaser from 'phaser';
import Player from './Player';

export default class Player2 extends Player {
    public number: number = 2;
    public name: string = 'Anonymoose';
    public maxHealth: number = 100;
    public currentHealth: number = 100;
    public runSpeed: number = 275;
    public jumpSpeed: number = 500;
    public magazine: number = 6;
    public magazineSize: number = 6;
    public isDead: boolean = false;
    public isReloading: boolean = false;
    public reloadText?: Phaser.GameObjects.Text;
    public type: string = 'ranged';
    public textureKey: string = 'player2';
    public avatarKey: string = 'avatarP2';
    public hbFrameKey: string = 'health-bar-frame-2';
    public standKey: string = 'standingP2';
    public crouchKey: string = 'crouchingP2';
    public walkKey: string = 'walkingP2';
    public runKey: string = 'runningP2';
    public jumpKey: string = 'jumpingP2';
    public hurtKey: string = 'hurtP2';
    public attackKey: string = 'shootP2';
    public dyingKey: string = 'dyingP2';

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

    protected handleAnimationStart(
        animation: Phaser.Animations.Animation,
        frame: Phaser.Animations.AnimationFrame
    ) {
        // Tweak the hitbox for the running and walking animation
        if (animation.key === this.runKey || animation.key === this.walkKey) {
            this.setVelocityY(0);
        }
        super.handleAnimationStart(animation, frame);
    }

    protected handleAnimationComplete(
        animation: Phaser.Animations.Animation,
        frame: Phaser.Animations.AnimationFrame
    ) {
        super.handleAnimationComplete(animation, frame);
    }

    public attack() {
        if (this.isReloading) {
            this.reloadText?.setVisible(true);
            return;
        }
        if (this) {
            this.play(this.attackKey, true);
        }
    }

    public specialAttack() {
        return;
    }

    public emitProjectile() {
        if (this.scene && this.scene.game && this.scene.game.registry && !this.isReloading) {
            // Create a projectile at player's position
            let projectileGroup = this.scene.game.registry.get('friendlyProjectileGroup') as Phaser.Physics.Arcade.Group;
            let projectile = projectileGroup.create(this.x, this.y - 15, 'projectile-1').setScale(1.5);
            projectile.flipX = this.flipX;
            projectile.body.setAllowGravity(false);
            projectile.setVelocityX(this.flipX ? -750 : 750); // Set velocity based on player's direction
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
