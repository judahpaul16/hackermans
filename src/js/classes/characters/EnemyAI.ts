import Phaser from 'phaser';
import Player, {PlayerState} from './Player';
import Player2 from './Player2';
import Player3 from './Player3';
import NPC from './NPC';

export default class EnemyAI extends Player {
    public name: string = 'Enemy AI';
    public scale = 1.8;
    public maxHealth: number = 100;
    public currentHealth: number = 100;
    public magazine: number = 6;
    public magazineSize: number = 6;
    public isReloading: boolean = false;
    public manualReload: boolean = false;
    public attackHint?: Phaser.GameObjects.Image | null = null;
    public shotgunPumpSound?: Phaser.Sound.BaseSound | null = null;
    public reloadText?: Phaser.GameObjects.Text;
    public type: string = 'ranged';
    public textureKey: string = 'enemyAI';
    public avatarKey: string = 'avatarEAI';
    public hbFrameKey: string = 'health-bar-frame-enemy';
    public standKey: string = 'standingEAI';
    public walkKey: string = 'walkingEAI';
    public runKey: string = 'runningEAI';
    public jumpKey: string = 'jumpingEAI';
    public dyingKey: string = 'dyingEAI';
    public hurtKey: string = 'hurtEAI';
    public meleeKey: string = 'meleeEAI';
    public shootKey: string = 'shootEAI';

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, type: string) {
        super(scene, x, y, texture);
        this.type = type;

        // Ensure the scene is not undefined before adding the sprite
        if (scene) {
            scene.add.existing(this);
            if (scene.physics && scene.physics.world) {
                scene.physics.world.enable(this);
                this.setDepth(3);

                // Create attack hint that floats above the enemy then disappears after 2 seconds
                this.attackHint = scene.add.image(this.x + 5, this.y - 15, 'attack-hint');
                this.attackHint.setDepth(10).setVisible(false);
            }
        }
    }

    public toggleAttackHint() {
        if (this.attackHint) {
            if (this.attackHint.visible === false) {
                this.attackHint.setVisible(true);
                // Hide the attackHint after 2 seconds
                setTimeout(() => {
                    this.attackHint!.setVisible(false);
                }, 2000);
            } else {
                return;
            }
        }
    }

    public attack() {
        let nearestDistance: number = Infinity;
        let nearestPlayer: Player | Player2 | Player3 | NPC | undefined;
        let players = [...this.scene.game.registry.get('players'), ...this.scene.game.registry.get('npcs')];
        for (let player of players) {
            const tempDistance = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
            if (tempDistance < nearestDistance) {
                nearestDistance = tempDistance;
                nearestPlayer = player;
            }
        }
        if (nearestPlayer && !nearestPlayer.isDead) {
            if (this.type == 'ranged' && nearestDistance > 50 && nearestDistance <= 600) {
                this.play(this.shootKey, true).on('animationupdate', () => {
                    let frame = this.anims.currentFrame;
                    if (frame) {
                        if (frame.index === 3 && this.attackSound === null) { // Emit projectile on frame 3
                            this.emitProjectile();
                            this.attackSound = this.scene.sound.add(this.shootKey);
                            this.attackSound.play({ volume: 0.5, loop: false });
                        }
                    }
                }).on('animationcomplete', () => {
                    this.attackSound = null;
                    this.currentState = PlayerState.HUNTING; // runs hunt() again on update();
                });
            } else if (nearestDistance <= 50) {
                this.play(this.meleeKey, true).on('animationcomplete', () => {
                    this.currentState = PlayerState.HUNTING; // runs hunt() again on update();
                });
            } else {
                let angle = Phaser.Math.Angle.Between(this.x, this.y, nearestPlayer.x, nearestPlayer.y);
                this.setVelocityX(Math.cos(angle) * 100);
                if (this.type == 'flying') this.setVelocityY(Math.sin(angle) * 100);
            }
        }
    }
    
    public hunt() {
        if (this.currentState !== PlayerState.HUNTING) return;
        else {
            this.toggleAttackHint();
            // Find the nearest player
            let nearestDistance: number = Infinity;
            let nearestPlayer: Player | Player2 | Player3 | NPC | undefined;
            let players = [...this.scene.game.registry.get('players'), ...this.scene.game.registry.get('npcs')];
            for (let player of players) {
                const tempDistance = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
                if (tempDistance < nearestDistance) {
                    nearestDistance = tempDistance;
                    nearestPlayer = player;
                }
            }
            if (nearestPlayer) {
                // If player is within range (e.g., 600 pixels), attack
                if (nearestDistance <= 600) {
                    // turn toward player
                    this.flipX = nearestPlayer.x < this.x;
                    this.attack();
                } else {
                    let angle = Phaser.Math.Angle.Between(this.x, this.y, nearestPlayer.x, nearestPlayer.y);
                    this.setVelocityX(Math.cos(angle) * 100);
                    if (this.type == 'flying') this.setVelocityY(Math.sin(angle) * 100);
                }
                if (nearestDistance > 3000) this.currentState = PlayerState.PACING;
            }
        }
    }    

    public emitProjectile() {
        if (this.scene && this.scene.game && this.scene.game.registry && !this.isReloading) {
            // Create a projectile at player's position
            setTimeout(() => {
                if (!this.attackSound) this.attackSound = this.scene.sound.add(this.shootKey);
                if (!this.attackSound.isPlaying) this.attackSound.play({ volume: 0.5, loop: false });
                let projectileGroup = this.scene.game.registry.get('enemyProjectileGroup') as Phaser.Physics.Arcade.Group;
                let projectile = projectileGroup.create(this.x, this.y - 15, 'projectile-1').setScale(1.5);
                projectile.flipX = this.flipX;
                projectile.body.setAllowGravity(false);
                projectile.setVelocityX(this.flipX ? -750 : 750); // Set velocity based on player's direction
                this.magazine--;
            }, 150);
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
}
