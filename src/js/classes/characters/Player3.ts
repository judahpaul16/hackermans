import Phaser from 'phaser';
import Player, { PlayerState } from './Player';

export default class Player3 extends Player {
    public number: number = 3;
    public name: string = 'Anonymusk';
    public width: number = 83;
    public height: number = 186;
    public offsetX: number = -2;
    public offsetY: number = -13;
    public maxHealth: number = 100;
    public currentHealth: number = 100;
    public runSpeed: number = 225;
    public jumpSpeed: number = 500;
    public magazineSize: number = 20;
    public magazine: number = this.magazineSize;
    public isDead: boolean = false;
    public isReloading: boolean = false;
    public reloadText?: Phaser.GameObjects.Text;
    public manualReload: boolean = false;
    public shotgunPumpSound?: Phaser.Sound.BaseSound | null = null;
    public type: string = 'ranged';
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
    public dialogue: { [key: string]: string } = {
        'anonymuskDialogue1': "Things haven't been the same since the 7/11 attacks.\n" +
                "But, if you follow my lead, you might just\n" +
                "make it out of here alive.",
    }

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

    protected handleAnimationStart(
        animation: Phaser.Animations.Animation,
        frame: Phaser.Animations.AnimationFrame
    ) {
        super.handleAnimationStart(animation, frame);

        // Tweak the hitbox for the crouching animation
        if (animation.key === this.crouchKey) {
            this.setOffset(this.offsetX, this.offsetY);
        }
    }

    protected handleAnimationComplete(
        animation: Phaser.Animations.Animation,
        frame: Phaser.Animations.AnimationFrame
    ) {
        if (animation.key === this.crouchKey) {
            this.setOffset(this.offsetX, this.offsetY);
        }

        if (animation.key === this.attackKey)
            if (this.y > 670) this.y -= 10;
        
        super.handleAnimationComplete(animation, frame);
    }

    public attack() {
        if (this.isReloading) {
            this.reloadText?.setVisible(true);
            return;
        }
        if (this) {
            if (this.body!.velocity.x !== 0) this.play(this.runShootKey, true);
            else this.play(this.attackKey, true);
        }
    }

    public specialAttack() {
        return;
    }

    public emitProjectile() {
        if (this.scene && this.scene.game && this.scene.game.registry && !this.isReloading) {
            if (!this.attackSound) this.attackSound = this.scene.sound.add(this.attackKey);
            if (!this.attackSound.isPlaying) this.attackSound.play({ volume: 0.5, loop: true });
            // Create a projectile at player's position
            let projectileGroup = this.scene.game.registry.get('friendlyProjectileGroup') as Phaser.Physics.Arcade.Group;
            let y = (this.body!.velocity.x != 0) ? this.y : this.y - 40;
            let projectile = projectileGroup.create(this.x, y, 'projectile-1').setScale(0.5);
            projectile.flipX = this.flipX;
            projectile.body.setAllowGravity(false);
            projectile.setVelocityX(this.flipX ? -1500 : 1500); // Set velocity based on player's direction
            this.magazine--;
            if (this.magazine <= 0) this.checkReload();
        } else if (this.isReloading) {
            this.attackSound?.stop();
            this.reloadText?.setVisible(true);
        }
    }

    public checkReload() {
        if (this.magazine <= 0 || this.manualReload) {
            if (!this.isReloading) {
                this.isReloading = true;
                if (this.reloadText) this.reloadText.setVisible(true);
                
                setTimeout(() => {
                    if (!this.shotgunPumpSound)
                        this.shotgunPumpSound = this.scene.sound.add('shotgunPumpSound');
                    if (!this.shotgunPumpSound.isPlaying)
                        this.shotgunPumpSound.play({ volume: 0.5, loop: false });
                }, 450);
    
                // start 10 second timer
                this.scene.time.addEvent({
                    delay: 10000,
                    callback: () => {
                        this.magazine = this.magazineSize;
                        this.isReloading = false;
                        this.manualReload = false;
                    },
                    callbackScope: this,
                    loop: false
                });
            }
        } else {
            this.isReloading = false;
            if (this.reloadText) this.reloadText.setVisible(false);
        }
    }

    public reload() {
        this.manualReload = true;
        this.checkReload();
    }
}
