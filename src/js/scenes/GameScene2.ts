import Phaser from 'phaser';
import Player from '../classes/entities/Player';
import NPC from '../classes/entities/NPC';
import Enemy from '../classes/entities/Enemy';
import * as dat from 'dat.gui';

export default class GameScene2 extends Phaser.Scene {
    private dg?: dat.GUI;
    private backgroundImages?: {[key: string]: Phaser.GameObjects.TileSprite} = {};
    private clouds: Phaser.GameObjects.Sprite[] = [];
    private player?: Player;
    private enemy?: Enemy;
    private chatBubble?: Phaser.GameObjects.Sprite;
    private platforms?: Phaser.Physics.Arcade.StaticGroup;
    private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
    private debugKey?: Phaser.Input.Keyboard.Key;
    private resetKey?: Phaser.Input.Keyboard.Key;
    private interactKey?: Phaser.Input.Keyboard.Key;
    private moveLeftKey?: Phaser.Input.Keyboard.Key;
    private moveRightKey?: Phaser.Input.Keyboard.Key;
    private jumpKey?: Phaser.Input.Keyboard.Key;
    width: number = 6500;
    height: number = 650;
    // scale factors
    sfactor1: number = 1.25;
    sfactor2: number = 1.1;
    sfactor3: number = 0.9;
    sfactor4: number = 0.9;

    constructor() {
        super({ key: 'GameScene2' });
    }

    private initializeDebugGUI() {
        const dg = new dat.GUI();
        dg.domElement.style.display = 'none';
        this.registry.set('debugGUI', dg);
        this.dg = dg;        
    }
    
    create() {
        // Scene Setup
        this.physics.world.setBounds(0, 0, this.width, 800);

        // Background images setup
        this.backgroundImages = {
            farBuildings: this.createBackground('far-buildings', this.width, this.height*this.sfactor1),
            backBuildings: this.createBackground('back-buildings', this.width, this.height*this.sfactor2),
            middle: this.createBackground('middle', this.width, this.height*this.sfactor3),
            foreground: this.createBackground('foreground', this.width, this.height*this.sfactor4),
        };        

        // Camera setup
        this.cameras.main.setBounds(0, 0, this.width, 800);
        
        // Cloud Setup
        this.createClouds(10);
        
        // Platform setup
        this.platforms = this.physics.add.staticGroup();
        this.addPlatform(150, 790, 1000);

        // Player setup
        this.player = new Player(this, 100, 650, 'player');
        this.player.body!.setSize(40, 60);
        this.player.setScale(2);
        this.player.body!.setOffset(0, 6);
        this.physics.add.collider(this.player, this.platforms);
        this.cameras.main.startFollow(this.player!, true, 0.5, 0.5);

        // Input setup
        this.cursors = this.input.keyboard!.createCursorKeys();
        this.debugKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        this.resetKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        this.interactKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.F);
        this.moveLeftKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.moveRightKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.jumpKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        
        // Debugging
        this.initializeDebugGUI();
        if (this.dg) {
            const cameraFolder = this.dg?.addFolder('Camera');
            if (cameraFolder) {
                // cameraFolder?.add(this.cameras.main, 'scrollX', 0, 10000);
                // cameraFolder?.add(this.cameras.main, 'scrollY', 0, 10000);
                cameraFolder?.add(this.cameras.main, 'zoom', 0.5, 5);
            }

            const worldFolder = this.dg.addFolder('World');
            const scaleFolder = worldFolder.addFolder('Background Scale');
            scaleFolder.add(this, 'width', 0, 10000).onChange((value) => {
                this.updateWorldBounds();
            });
            scaleFolder.add(this, 'height', 0, 750).onChange((value) => {
                this.updateWorldBounds();
            });
            scaleFolder.add(this, 'sfactor1', 0, 2).onChange((value) => {
                this.updateWorldBounds();
            });
            scaleFolder.add(this, 'sfactor2', 0, 2).onChange((value) => {
                this.updateWorldBounds();
            });
            scaleFolder.add(this, 'sfactor3', 0, 2).onChange((value) => {
                this.updateWorldBounds();
            });
            scaleFolder.add(this, 'sfactor4', 0, 2).onChange((value) => {
                this.updateWorldBounds();
            });
        }
    }

    update() {
        // Game loop logic
        // Parallax scrolling
        let camX = this.cameras.main.scrollX;
        this.backgroundImages!.farBuildings.tilePositionX = camX * 0.1;
        this.backgroundImages!.backBuildings.tilePositionX = camX * 0.2;
        this.backgroundImages!.middle.tilePositionX = camX * 0.3;
        this.backgroundImages!.foreground.tilePositionX = camX * 0.5;

        
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

        // Move the player, check for collisions, etc.
        this.playerMovement();

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
        
        // if player moves beyond the left edge of the world, start the previous scene
        if (this.player!.x < 0) {
            this.scene.start('GameScene1');
            this.game.registry.set('previousScene', this.scene.key);
        }

        // if player moves beyond the right edge of the world, start the next scene
        if (this.player!.x > this.width) {
            this.scene.start('GameScene2');
            this.game.registry.set('previousScene', this.scene.key);
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
        
        for (let i = 0; i < 10; i++) {
          let randomX: number;
          let randomY: number;
          let attempts = 0;
        
          // Repeat until we find coordinates not too close to previous ones
          do {
            randomX = Math.random() * this.width;
            randomY = Math.random() * 200; // Restricting Y to 0 - 200
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

    private updateWorldBounds() {
        this.backgroundImages!.farBuildings.destroy();
        this.backgroundImages!.backBuildings.destroy();
        this.backgroundImages!.middle.destroy();
        this.backgroundImages!.foreground.destroy();
        this.backgroundImages!.farBuildings = this.createBackground('far-buildings', this.width, this.height*this.sfactor1);
        this.backgroundImages!.backBuildings = this.createBackground('back-buildings', this.width, this.height*this.sfactor2);
        this.backgroundImages!.middle = this.createBackground('middle', this.width, this.height*this.sfactor3);
        this.backgroundImages!.foreground = this.createBackground('foreground', this.width, this.height*this.sfactor4);
        this.backgroundImages!.farBuildings.setDepth(-1);
        this.backgroundImages!.backBuildings.setDepth(-1);
        this.backgroundImages!.middle.setDepth(-1);
        this.backgroundImages!.foreground.setDepth(-1);
        this.physics.world.setBounds(0, 0, this.width, 800);
        this.cameras.main.setBounds(0, 0, this.width, 800);
    }
    
    private timerEvent: Phaser.Time.TimerEvent | null = null;

    private handleInteract(scene: Phaser.Scene, player: Player, npc: NPC, interactKey: Phaser.Input.Keyboard.Key) {

        if (Phaser.Input.Keyboard.JustDown(this.interactKey!)) {
            // if the player is close to the NPC or interactable, do something

        }
    }

    private playerMovement() {
        if (!this.player || !this.cursors) return;

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
    
            // Listen for animationcomplete event
            this.player.on('animationcomplete', (animation: Phaser.Animations.Animation) => {
                // If the animation is 'melee', reset gravity
                if (animation.key === 'melee') {
                    this.player!.setVelocityY(-100);
                }
            }, this);
        }
    }
    
    private die() {
        if (this.player) {
            this.player.play('dying', true);
        }
    }

    private addPlatform(x: number, y: number, width: number) {
        for (let i = 0; i < width; i++) {
            this.platforms!.create(x + i * 64, y, 'street');
        }
    }
}
