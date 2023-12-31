import Phaser from 'phaser';
import Player from './Player';

export default class NPC extends Player {
    public name: string = 'Anonymiss';
    public scale = 2;
    public maxHealth: number = 100;
    public currentHealth: number = 100;
    public interactHint?: Phaser.GameObjects.Text | null = null;
    public textureKey: string = 'npc';
    public avatarKey: string = 'avatarNPC1';
    public hbFrameKey: string = 'health-bar-frame-npc';
    public standKey: string = 'standingNPC1';
    public walkKey: string = 'walkingNPC1';
    public runKey: string = 'runningNPC1';
    public jumpKey: string = 'jumpingNPC1';
    public dyingKey: string = 'dyingNPC1';
    public hurtKey: string = 'hurtNPC1';
    public meleeKey: string = 'meleeNPC1';
    public shootKey: string = 'shootNPC1';
    public runShootKey: string = 'runShootNPC1';
    public crouchKey: string = 'crouchingNPC1';
    public dialogue: { [key: string]: string } = {
        'anonymissDialogue1': 
                "Mouse?! What are you doing here?\n" +
                "I guess we're getting the band back together.\n" +
                "Hackermans Corporation has been working\n" +
                "with the aliens and they're using their current\n" +
                "line of droids to control the population. The 7/11\n" +
                "attacks were a false flag made to look like an invasion\n" +
                "as justification for private military force.\n" +
                "This is what happens when you let an AI run\n" +
                "a company I guess. We've gotta stop them.",
    };

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string | number) {
        super(scene, x, y, texture, frame);

        // Ensure the scene is not undefined before adding the sprite
        if (scene) {
            scene.add.existing(this);
            if (scene.physics && scene.physics.world) {
                scene.physics.world.enable(this);
                this.setDepth(3);
            }
        }
    }

    public attack() {
        if (this) {
            // if moving in x direction, play runShoot animation
            if (this.body!.velocity.x !== 0) this.play(this.runShootKey, true);
            else this.play(this.attackKey, true);
            if (!this.attackSound) {
                this.attackSound = this.scene.sound.add(this.attackKey);
                this.attackSound.on('complete', () => {
                    // Create projectile
                    this.emitProjectile();
                    this.attackSound = null;
                });
            }
            this.attackSound.play({ volume: 0.5, loop: false });
        }
    }

    public emitProjectile() {
        if (this.scene && this.scene.game && this.scene.game.registry) {
            // Create a projectile at player's position
            let projectileGroup = this.scene.game.registry.get('friendlyProjectileGroup') as Phaser.Physics.Arcade.Group;
            let projectile = projectileGroup.create(this.x, this.y, 'projectile-1').setScale(1.5);
            projectile.flipX = this.flipX;
            projectile.body.setAllowGravity(false);
            projectile.setVelocityX(this.flipX ? -1000 : 1000); // Set velocity based on player's direction
        }
    }
}
