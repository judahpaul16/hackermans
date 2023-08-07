import Phaser from 'phaser';
import Player from '../classes/entities/Player';
import Player2 from '../classes/entities/Player2';
import Enemy from '../classes/entities/Enemy';
import { addPlatform, createHealthBar, updateHealthBar, destroyHealthBar, follow, initializeDebugGUI, handleInteract } from '../classes/utils/common';
import * as dat from 'dat.gui';

export default class GameScene1 extends Phaser.Scene {
    private dg?: dat.GUI;
    private backgroundImages?: {[key: string]: Phaser.GameObjects.TileSprite} = {};
    private clouds: Phaser.GameObjects.Sprite[] = [];
    private player?: Player;
    private player2?: Player2;
    private enemy?: Enemy;
    private chatBubble?: Phaser.GameObjects.Sprite;
    private dialogueText?: Phaser.GameObjects.Text;
    private interactHint?: Phaser.GameObjects.Text;
    private platforms?: Phaser.Physics.Arcade.StaticGroup;
    private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
    private debugKey?: Phaser.Input.Keyboard.Key;
    private resetKey?: Phaser.Input.Keyboard.Key;
    private interactKey?: Phaser.Input.Keyboard.Key;
    private moveLeftKey?: Phaser.Input.Keyboard.Key;
    private moveRightKey?: Phaser.Input.Keyboard.Key;
    private jumpKey?: Phaser.Input.Keyboard.Key;
    private p2HealthBarCreated: boolean = false;
    private level?: Phaser.GameObjects.Text;
    private timerEvent: Phaser.Time.TimerEvent | null = null;
    width: number = 3000;
    height: number = 650;
    // scale factors
    sfactor1: number = 1.25;
    sfactor2: number = 1.1;
    sfactor3: number = 0.9;
    sfactor4: number = 0.9;

    constructor() {
        super({ key: 'GameScene1' });
    }
    
    create() {
        // Scene Setup
        this.physics.world.setBounds(0, 0, this.width, 800);

        // Background images setup
        this.backgroundImages = {
            farBuildings: this.createBackground('far-buildings', this.width, this.height*this.sfactor1),
            backBuildings: this.createBackground('back-buildings', this.width, this.height*this.sfactor2),
            middle: this.createBackground('middle', this.width, this.height*this.sfactor3),
            foreground: this.createBackground('foreground-empty', this.width, this.height*this.sfactor4),
        };

        // Camera setup
        this.cameras.main.setBounds(0, 0, this.width, 800);
        
        // Add Lv. 1 to the top right corner of the camera
        this.level = this.add.text(this.cameras.main.width - 90, 30, 'Lv. 1', {
            fontSize: 20,
            color: '#ffffff',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 3
        });
        this.level.setScrollFactor(0);

        // Cloud Setup
        this.createClouds(10);

        // Street setup
        this.platforms = this.physics.add.staticGroup();
        addPlatform(this, 150, 790, 1000, 'street');

        // Player setup
        // if previous scene is GameScene2, start player at the end of the scene
        const previousSceneName = this.game.registry.get('previousScene');

        if (previousSceneName === 'GameScene2') {
            this.player = new Player(this, this.width - 50, 650, 'player');
            this.player.flipX = true;
        } else {
            this.player = new Player(this, 200, 650, 'player');
        }

        this.player.body!.setSize(40, 60);
        this.player.setScale(2);
        this.player.body!.setOffset(0, 6);
        this.physics.add.collider(this.player, this.platforms);
        this.cameras.main.startFollow(this.player!, true, 0.5, 0.5);

        // Player2 setup
        // if previous scene is GameScene2, start player2 at the end of the scene
        if (previousSceneName === 'GameScene2') {
            this.player2 = new Player2(this, this.width - 50, 650, 'player2');
            this.player.flipX = true;
        } else {
            this.player2 = new Player2(this, 1325, 650, 'player2');
        }
        this.player2.body!.setSize(40, 60);
        this.player2.setScale(2);
        this.player2.body!.setOffset(0, 6);
        this.physics.add.collider(this.player2, this.platforms);

        this.player2!.play('standingP2', true);
        this.player2!.flipX = true;

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

        // Input setup
        this.cursors = this.input.keyboard!.createCursorKeys();
        this.debugKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        this.resetKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        this.interactKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.F);
        this.moveLeftKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.moveRightKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.jumpKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W);

        // HUD setup
        createHealthBar(this, this.player);

        // Calculate distance between player and Player2
        const distance = Phaser.Math.Distance.Between(
            this.player!.x, this.player!.y,
            this.player2!.x, this.player2!.y
        );
        this.p2HealthBarCreated = false;
        if (distance <= 20 && !this.p2HealthBarCreated) {
            // Create Player2 health bar
            createHealthBar(this, this.player2!);
            this.p2HealthBarCreated = true;
        } else if (distance > 20 && this.p2HealthBarCreated) {
            // Destroy Player2 health bar
            destroyHealthBar(this.player2!);
            this.p2HealthBarCreated = false;
        }

        // Debugging
        initializeDebugGUI(this);
    }

    update() {
        // Game loop logic

        // Parallax scrolling
        let camX = this.cameras.main.scrollX;
        this.backgroundImages!.farBuildings.tilePositionX = camX * 0.1;
        this.backgroundImages!.backBuildings.tilePositionX = camX * 0.2;
        this.backgroundImages!.middle.tilePositionX = camX * 0.3;
        this.backgroundImages!.foreground.tilePositionX = camX * 0.5;

        // Update clouds
        this.updateClouds();

        // Move the player, check for collisions, etc.
        this.updatePlayer();

        // Update Player2 and Health Bars
        // Calculate distance between player and Player2
        const distance = Phaser.Math.Distance.Between(
            this.player!.x, this.player!.y,
            this.player2!.x, this.player2!.y
        );

        follow(this, this.player2!, this.player!, this.interactHint!)

        if (distance <= 300 && !this.p2HealthBarCreated) {
            // Create Player2 health bar
            createHealthBar(this, this.player2!);
            this.p2HealthBarCreated = true;
        } else if (distance > 300 && this.p2HealthBarCreated) {
            // Destroy Player2 health bar
            destroyHealthBar(this.player2!);
            this.p2HealthBarCreated = false;
        }

        // Update health bars only if created
        if (this.player) updateHealthBar(this, this.player);
        if (this.p2HealthBarCreated && this.player2) updateHealthBar(this, this.player2);

        // Reset player position if 'R' key is pressed
        if (Phaser.Input.Keyboard.JustDown(this.resetKey!)) {
            this.player?.setPosition(200, 650);
        }

        // Show Debug Menu if ESC key is pressed
        if (Phaser.Input.Keyboard.JustDown(this.debugKey!)) {
            const dg = this.registry.get('debugGUI');
            if (dg) {
                dg.domElement.style.display = dg.domElement.style.display === 'none' ? '' : 'none';
            }
        }

        handleInteract(this, this.player!, this.player2!, this.interactKey!);

        // Make chat bubble follow Player2
        if (this.player2) {
            this.chatBubble?.setPosition(this.player2.x - 123, this.player2.y - 130);
            this.dialogueText?.setPosition(this.chatBubble!.x - (this.chatBubble!.width * 0.1 / 2) - 165, this.chatBubble!.y - (this.chatBubble!.height * 0.1 / 2) - 15,);
        }

        // if player moves beyond the right edge of the world, start the next scene
        if (this.player!.x > this.width) {
            this.scene.start('GameScene2');
            this.game.registry.set('previousScene', this.scene.key);
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
    }

    createBackground(key: string, width: number, height: number): Phaser.GameObjects.TileSprite {
        const imageHeight = this.textures.get(key).getSourceImage().height;
        const ratio = height / imageHeight;
        const sprite = this.add.tileSprite(0, this.physics.world.bounds.height - height, width, height, key)
            .setOrigin(0)
            .setTileScale(1, ratio);
        return sprite;
    }
    
    private createClouds(numClouds: number) {
        type CloudPosition = { x: number; y: number };
        let previousPositions: CloudPosition[] = [];
        
        for (let i = 0; i < 12; i++) {
          let randomX: number;
          let randomY: number;
          let attempts = 0;
        
          // Repeat until we find coordinates not too close to previous ones
          do {
            randomX = Math.random() * this.width;
            randomY = Math.random() * 200 + 15; // Restricting Y to 15 - 200
            attempts++;
          } while (
            attempts < 1000 &&
            previousPositions.some(
              pos => Math.sqrt(Math.pow(pos.x - randomX, 2) + Math.pow(pos.y - randomY, 2)) < 200
            )
          );
        
          if (attempts < 1000) {
            let cloud = this.add.sprite(randomX, randomY, 'cloud');
            cloud.setScale(0.1);
            this.clouds!.push(cloud);
            previousPositions.push({ x: randomX, y: randomY });
          }
        }
    }

    private updateClouds() {
        if (this.clouds) {
            for (let cloud of this.clouds!) {
                if (cloud.anims) {
                    cloud.play('cloud', true);
                    //if index is even, move right, else move left
                    if (this.clouds!.indexOf(cloud) % 2 === 0) {
                        cloud.x += 1;
                    } else {
                        cloud.x -= 1;
                    }
                    //if cloud goes off screen, reset to other side
                    if (cloud.x > this.width + 100) {
                        cloud.x = -100;
                    }
                }
            }
        }
    }

    private updatePlayer() {
        if (!this.player || !this.cursors) return;
        if (this.player.isDead) return;

        // Check if the player is dead
        if (this.player.currentHealth <= 0 && !this.player.isDead) {
            this.physics.world.gravity.y = 0;
            this.player.play('dying', true);
            return; // Exit the update function if the player is dead
        }

        // Don't process inputs if the player is attacking or jumping
        if (this.player?.getCurrentAnimation() === 'melee') return;
        if (this.player?.getCurrentAnimation() === 'jumping') return;

        let isMovingLeft = this.cursors.left!.isDown || this.moveLeftKey!.isDown;
        let isMovingRight = this.cursors.right!.isDown || this.moveRightKey!.isDown;
        let isRunning = this.cursors.shift!.isDown;
        let isJumping = this.cursors.up!.isDown || this.jumpKey!.isDown;
        let isAttacking = this.cursors.space!.isDown;

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

    private jump() {
        if (this.player && this.player.body!.touching.down) {
            this.player.setVelocityY(-450);
            this.player.play('jumping', true);
        }
    }

    private attack() {
        if (this.player) {            
            this.player.play('melee', true);
            this.sound.play('melee', { volume: 0.5, loop: false });
    
            // Listen for animationcomplete event
            this.player.on('animationcomplete', (animation: Phaser.Animations.Animation) => {
                // If the animation is 'melee', reset gravity
                if (animation.key === 'melee') {
                    this.player!.setVelocityY(-100);
                }
            }, this);
        }
    }
}