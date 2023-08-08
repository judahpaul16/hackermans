import Phaser from 'phaser';
import Player from '../classes/entities/Player';
import Player2 from '../classes/entities/Player2';
import Enemy from '../classes/entities/Enemy';
import InputManager from '../classes/utils/InputManager';
import * as common from '../helpers/common';

export default class BaseScene extends Phaser.Scene {
    protected inputManager!: InputManager;
    protected player?: Player;
    protected player2?: Player2;
    protected enemy?: Enemy;
    protected chatBubble?: Phaser.GameObjects.Sprite;
    protected dialogueText?: Phaser.GameObjects.Text;
    protected interactHint?: Phaser.GameObjects.Text;
    protected p2HealthBarCreated: boolean = false;
    protected level?: Phaser.GameObjects.Text;
    protected width: number = 3000;
    protected height: number = 650;
    // scale factors
    protected sfactor1: number = 1.25;
    protected sfactor2: number = 1.1;
    protected sfactor3: number = 0.9;
    protected sfactor4: number = 0.9;
    protected backgroundImages?: { [key: string]: Phaser.GameObjects.TileSprite } = {};
    protected clouds: Phaser.GameObjects.Sprite[] = [];
    protected platforms?: Phaser.Physics.Arcade.StaticGroup;

    create() {
        this.inputManager = InputManager.getInstance(this);
        this.inputManager.resetKey.on('down', () => {
            // Reset player position if 'R' key is pressed
            this.resetPlayer();
        });

        this.inputManager.debugKey.on('down', () => {
            // Show Debug Menu if ESC key is pressed
            const dg = this.registry.get('debugGUI');
            if (dg) {
                dg.domElement.style.display = dg.domElement.style.display === 'none' ? '' : 'none';
            }
        });
        // Update Input to apply to this scene
        InputManager.getInstance().updateInput(this);
        
        // Add interact hint
        this.interactHint = this.add.text(this.player2!.x - 42, this.player2!.y - 82, "Press 'F'", {
            fontSize: 20,
            color: '#ffffff',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 4,
        });
        // add tweens to make the interact hint float up and down
        this.tweens.add({
            targets: this.interactHint,
            y: this.player2!.y - 50, // Float up and down
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        this.tweens.add({
            targets: this.interactHint,
            fontSize: '24px', // Grow and shrink
            duration: 500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // any other common setup...
    }

    protected resetPlayer() {
        // This method can be implemented in the derived classes
        throw new Error("resetPlayer method must be implemented in derived classes");
    }

    // other common methods...

    update() {
        // Update Player1
        this.updatePlayer();

        // Make chat bubble follow Player2
        if (this.player2) {
            if (this.chatBubble && this.dialogueText) {
                this.chatBubble.setPosition(this.player2.x - 123, this.player2.y - 130);
                this.dialogueText.setPosition(this.chatBubble!.x - (this.chatBubble!.width * 0.1 / 2) - 165, this.chatBubble!.y - (this.chatBubble!.height * 0.1 / 2) - 15);
            }
        }

        if (this.player && this.player2) {
            common.handleInteract(this, this.player, this.player2, this.inputManager.interactKey!);
        }

        // any other common update logic...

    }

    updatePlayer() {
        if (!this.player) return;
        if (this.player.isDead) return;

        let isMovingLeft = this.inputManager.cursors.left!.isDown || this.inputManager.moveLeftKey.isDown;
        let isMovingRight = this.inputManager.cursors.right!.isDown || this.inputManager.moveRightKey!.isDown;
        let isRunning = this.inputManager.cursors.shift!.isDown;
        let isJumping = this.inputManager.cursors.up!.isDown || this.inputManager.jumpKey!.isDown;
        let isAttacking = this.inputManager.cursors.space!.isDown;

        if (this.player.currentHealth <= 0 && !this.player.isDead) {
            this.physics.world.gravity.y = 0;
            this.player.play('dying', true);
            return;
        }

        if (this.player.getCurrentAnimation() === 'melee' || this.player.getCurrentAnimation() === 'jumping') return;

        if (isMovingRight) {
            if (isRunning) {
                this.player.setVelocityX(300);
                this.player.play('running', true);
            } else if (isJumping) {
                this.jump();
            } else {
                this.player.setVelocityX(175);
                this.player.play('walking', true);
            }
            this.player.flipX = false;
            if (isAttacking) {
                this.attack();
            }
        } else if (isMovingLeft) {
            if (isRunning) {
                this.player.setVelocityX(-300);
                this.player.play('running', true);
            } else if (isJumping) {
                this.jump();
            } else {
                this.player.setVelocityX(-175);
                this.player.play('walking', true);
            }
            this.player.flipX = true;
            if (isAttacking) {
                this.attack();
            }
        } else if (isJumping) {
            this.jump();
        } else {
            this.player.setVelocityX(0);
            this.player.play('standingPlayer', true);
            if (isAttacking) {
                this.attack();
            }
        }
    }

    jump() {
        if (this.player && this.player.body!.touching.down) {
            this.player.setVelocityY(-450);
            this.player.play('jumping', true);
        }
    }

    attack() {
        if (this.player) {
            this.player.play('melee', true);
            this.sound.play('melee', { volume: 0.5, loop: false });
        }
    }
}