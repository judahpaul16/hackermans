import Phaser from 'phaser';
import Player from './Player';
import Player2 from './Player2';
import Player3 from './Player3';
import NPC from './NPC';

export default class Enemy extends Player {
    public name: string = 'Bad Guy';
    public currentAnimation?: string;
    public scale = 1.8;
    public maxHealth: number = 100;
    public currentHealth: number = 100;
    public attackHint?: Phaser.GameObjects.Image | null = null;
    public type: string = 'basic';
    public textureKey: string = 'enemy';
    public avatarKey: string = 'avatarE1';
    public hbFrameKey: string = 'health-bar-frame-enemy';
    public standKey: string = 'standingE1';
    public walkKey: string = 'walkingE1';
    public runKey: string = 'runningE1';
    public jumpKey: string = 'jumpingE1';
    public dyingKey: string = 'dyingE1';
    public hurtKey: string = 'hurtE1';
    public meleeKey: string = 'meleeE1';
    public shootKey: string = 'shootE1';
    private shootSound: Phaser.Sound.BaseSound | null = null;

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
                        if (frame.index === 3 && this.shootSound === null) { // Emit projectile on frame 3
                            this.emitProjectile();
                            this.shootSound = this.scene.sound.add(this.shootKey);
                            this.shootSound.play({ volume: 0.5, loop: false });
                        }
                    }
                }).on('animationcomplete', () => {
                    this.shootSound = null;
                    this.isHunting = false; // runs hunt() again on update();
                });
            } else if (nearestDistance <= 50) {
                this.play(this.meleeKey, true).on('animationcomplete', () => {
                    this.isHunting = false; // runs hunt() again on update();
                });
            } else {
                let angle = Phaser.Math.Angle.Between(this.x, this.y, nearestPlayer.x, nearestPlayer.y);
                this.setVelocityX(Math.cos(angle) * 100);
                if (this.type == 'flying') this.setVelocityY(Math.sin(angle) * 100);
            }
        }
    }
    
    public hunt() {
        if (!this.isHunting) {
            this.isHunting = true;
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
                if (nearestDistance > 3000) this.isHunting = false;
            }
        }
    }    

    private emitProjectile() {
        if (this.scene && this.scene.game && this.scene.game.registry   ) {
            // Create a projectile at player's position
            let projectileGroup = this.scene.game.registry.get('enemyProjectileGroup') as Phaser.Physics.Arcade.Group;
            let y = (this.body!.velocity.x != 0) ? this.y : this.y - 42;
            let projectile = projectileGroup.create(this.x, y, 'projectile-1').setGravityY(0).setVelocityY(0).setScale(1.5);
            projectile.flipX = this.flipX;
            projectile.setVelocityX(this.flipX ? -1500 : 1500); // Set velocity based on player's direction
        }
    }
}
