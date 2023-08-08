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
    protected isInteracting: boolean = false;
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
    protected dg?: dat.GUI;
    protected pauseMenu?: Phaser.GameObjects.Container;
    protected pauseBackground?: Phaser.GameObjects.Rectangle;
    protected pauseButton?: Phaser.GameObjects.Text;
    protected volumeBar?: Phaser.GameObjects.Graphics;
    protected volumeHandle?: Phaser.GameObjects.Graphics;
    protected volumeValue: number = 0.5;

    create() {
        // Pause Menu setup
        // Create Pause Menu Overlay
        this.pauseMenu = this.add.container(0, 0);
        this.pauseBackground = this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.5);
        this.pauseBackground.setScrollFactor(0);
        this.pauseBackground.setOrigin(0, 0);        
        this.pauseButton = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, 'Continue', { color: '#ffffff', fontSize: '32px' }).setOrigin(0.5);
        this.createVolumeSlider();
        this.pauseMenu.setDepth(1000);

        // Add to pause menu container
        this.pauseMenu.add([this.pauseBackground, this.pauseButton, this.volumeBar!, this.volumeHandle!]);

        // Initially hide the pause menu
        this.pauseMenu.setVisible(false);

        // Input for clicking the pause button
        this.pauseButton.setInteractive().on('pointerdown', () => {
            this.togglePauseMenu();
        });

        // Camera setup
        this.cameras.main.setBounds(0, 0, this.width, 800);

        this.inputManager = InputManager.getInstance(this);
        // Update Input to apply to current scene
        InputManager.getInstance().updateInput(this);

        this.inputManager.resetKey.on('down', () => {
            // Reset player position if 'R' key is pressed
            this.resetPlayer();
        });

        this.inputManager.debugKey.on('down', () => {
            // Show Debug Menu if ESC key is pressed
            this.dg = this.registry.get('debugGUI');
            if (this.dg) {
                this.dg.domElement.style.display = this.dg.domElement.style.display === 'none' ? '' : 'none';
            }
        });

        // Add pause key listener
        this.inputManager.pauseKey.on('down', () => {
            this.togglePauseMenu();
        });
        
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

        // Debugging
        common.initializeDebugGUI(this);

        // any other common setup...
    }

    update() {
        // Parallax scrolling
        let camX = this.cameras.main.scrollX;
        this.backgroundImages!.farBuildings.tilePositionX = camX * 0.1;
        this.backgroundImages!.backBuildings.tilePositionX = camX * 0.2;
        this.backgroundImages!.middle.tilePositionX = camX * 0.3;
        this.backgroundImages!.foreground.tilePositionX = camX * 0.5;

        // Update Player1
        this.updatePlayer();
        
        if (this.inputManager.resetKey.isDown) {
            this.resetPlayer();
        }

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

        // if animation key is 'running', set the offset to 12
        if (this.player2!.anims.currentAnim!.key == 'runningP2' || this.player2!.anims.currentAnim!.key == 'walkingP2') {
            this.player2!.setOffset(0, -12);
        } else {
            this.player2!.setOffset(0, -8);
        }
        
        // if player falls off the world, reset their position
        if (this.player!.y > this.height + 70) {
            this.player!.y = 650;
        }

        // if player2 falls off the world, reset their position
        if (this.player2!.y > this.height + 70) {
            this.player2!.y = 650;
        }
        
        // if this.level not in camera top right corner, move it there
        if (this.level!.x != this.cameras.main.width - 90 || this.level!.y != 30) {
            this.level!.setPosition(this.cameras.main.width - 90, 30);
        }

        // if pauseMenu width not equal to camera width, set it to camera width
        if (this.pauseBackground!.width != this.cameras.main.width) {
            this.pauseBackground!.width = this.cameras.main.width;
        }

        // Update health bars only if created
        if (this.player) common.updateHealthBar(this, this.player);
        if (this.p2HealthBarCreated && this.player2) common.updateHealthBar(this, this.player2);

        // if you die, it's game over
        if (this.player!.currentHealth <= 0) {
            // wait for the animation to finish with a delay then fade to black and go to game over scene
            let blackMask = this.add.rectangle(
                this.cameras.main.width / 2, // center x
                this.cameras.main.height / 2, // center y
                this.cameras.main.width,
                this.cameras.main.height,
                0x000000, 1
            ).setAlpha(0).setScrollFactor(0);
            
            this.time.delayedCall(3500, () => {
                this.tweens.add({
                    targets: blackMask,
                    alpha: 1,
                    duration: 2000,
                    ease: 'Linear',
                    onComplete: () => {
                        this.scene.start('GameOverScene');
                    }
                });
            }, [], this);            
        }

        // any other common update logic...

    }

    updatePlayer() {
        if (!this.player) return;
        if (this.player.isDead) return;
        if (this.inputManager.isInputDisabled()) return;

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
    
    protected resetPlayer() {
        // This method can be implemented in the derived classes
        throw new Error("resetPlayer method must be implemented in derived classes");
    }

    protected togglePauseMenu() {
        const isPaused = this.pauseMenu!.visible;
        this.pauseMenu!.setVisible(!isPaused);
        this.physics.world.isPaused = !isPaused;
    
        if (isPaused) {
            this.inputManager.enableInput();
        } else {
            this.inputManager.disableInput();
        }
    }

    protected createVolumeSlider() {
        const volumeBarWidth = 300;
        const volumeBarHeight = 10;
        const volumeHandleSize = 20;
        const x = this.cameras.main.width / 2;
        const y = this.cameras.main.height / 2 + 150;
    
        // Add a label for the volume slider
        const label = this.add.text(x - volumeBarWidth / 2, y - 40, 'Master Volume', { color: '#ffffff' });
        this.pauseMenu!.add(label); // Add label to pause menu if applicable
    
        this.volumeBar = this.add.graphics({ lineStyle: { width: 2, color: 0xffffff }, fillStyle: { color: 0x444444 } });
        this.volumeBar.fillRect(x - volumeBarWidth / 2, y - volumeBarHeight / 2, volumeBarWidth, volumeBarHeight);
    
        this.volumeHandle = this.add.graphics({ fillStyle: { color: 0xffffff } });
        this.volumeHandle.fillRect(x - volumeBarWidth / 2 + this.volumeValue * (volumeBarWidth - volumeHandleSize), y - volumeHandleSize / 2, volumeHandleSize, volumeHandleSize);
    
        // Make the handle interactive
        this.volumeHandle.setInteractive(new Phaser.Geom.Rectangle(x - volumeBarWidth / 2, y - volumeHandleSize / 2, volumeBarWidth, volumeHandleSize), Phaser.Geom.Rectangle.Contains);
    
        // Drag the handle to adjust the volume
        this.input.setDraggable(this.volumeHandle);
    
        this.volumeHandle.on('drag', (pointer: Phaser.Input.Pointer) => {
            let newX = Phaser.Math.Clamp(pointer.x, x - volumeBarWidth / 2, x + volumeBarWidth / 2 - volumeHandleSize);
            this.volumeValue = (newX - (x - volumeBarWidth / 2)) / (volumeBarWidth - volumeHandleSize);
            this.volumeHandle!.clear().fillRect(newX, y - volumeHandleSize / 2, volumeHandleSize, volumeHandleSize);
            this.sound.volume = this.volumeValue;
        });
    }
    
    // other common methods...

}
