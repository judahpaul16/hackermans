import Phaser from 'phaser';
import Player from '../classes/entities/Player';
import NPC from '../classes/entities/NPC';
import Enemy from '../classes/entities/Enemy';
import * as dat from 'dat.gui';

export default class GameScene extends Phaser.Scene {
    private dg?: dat.GUI;
    private backgroundImages?: {[key: string]: Phaser.GameObjects.TileSprite} = {};
    private clouds: Phaser.GameObjects.Sprite[] = [];
    private player?: Player;
    private guideNPC?: NPC;
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
    width: number = 6000;
    height: number = 650;

    constructor() {
        super({ key: 'GameScene' });
    }

    createBackground(key: string, width: number, height: number): Phaser.GameObjects.TileSprite {
        const imageHeight = this.textures.get(key).getSourceImage().height;
        const ratio = height / imageHeight;
        const sprite = this.add.tileSprite(0, this.physics.world.bounds.height - height, width, height, key)
            .setOrigin(0)
            .setTileScale(1, ratio);
        return sprite;
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
            farBuildings: this.createBackground('far-buildings', this.width, this.height*1.25),
            backBuildings: this.createBackground('back-buildings', this.width, this.height*1.2),
            middle: this.createBackground('middle', this.width, this.height*1.05),
            foreground: this.createBackground('foreground-empty', this.width, this.height*0.9),
        };        

        // Camera setup
        this.cameras.main.setBounds(0, 0, this.width, 800);
        
        // Cloud Setup
        let prevX = 200; // starting position
        for (let i = 0; i < 5; i++) {
            // ensure x position is at least 250 units from the previous cloud
            let randomX = prevX + 250 + Math.random() * 250;
            prevX = randomX;

            // restrict y position to be within [0, 200]
            let randomY = Math.random() * 200;

            let cloud = this.add.sprite(randomX, randomY, 'cloud');
            cloud.setScale(0.1);
            this.clouds!.push(cloud);
        }

        // Platform setup
        this.platforms = this.physics.add.staticGroup();
        this.addPlatform(150, 790, 1000);

        // Anims setup
        this.setupAnimations();

        // Player setup
        this.player = new Player(this, 200, 500, 'player');
        this.player.body!.setSize(40, 60);
        this.player.setScale(2);
        this.player.body!.setOffset(0, 6);
        this.physics.add.collider(this.player, this.platforms);
        this.cameras.main.startFollow(this.player!, true, 0.5, 0.5);

        this.guideNPC = new NPC(this, 1450, 500, 'guideNPC');
        this.guideNPC.body!.setSize(40, 60);
        this.guideNPC.setScale(2);
        this.guideNPC.body!.setOffset(0, 6);
        this.physics.add.collider(this.guideNPC, this.platforms);

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
            worldFolder.add(this, 'width', 0, 10000).onChange((value) => {
                this.updateWorldBounds();
            });
            worldFolder.add(this, 'height', 0, 750).onChange((value) => {
                this.updateWorldBounds();
            });
            const cloudFolder = worldFolder.addFolder('Clouds');
            cloudFolder?.add(this.clouds, 'length', 0, 10);
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

        for (let cloud of this.clouds!) {
            cloud.play('cloud', true);
            //if index is even, move right, else move left
            if (this.clouds!.indexOf(cloud) % 2 === 0) {
                cloud.x += 1;
            } else {
                cloud.x -= 1;
            }
            //if cloud goes off screen, reset to other side
            if (cloud.x > this.cameras.main.width + 100) {
                cloud.x = -100;
            }
        }

        // Move the player, check for collisions, etc.
        this.playerMovement();

        // Reset player position if 'R' key is pressed
        if (Phaser.Input.Keyboard.JustDown(this.resetKey!)) {
            this.player?.setPosition(200, 500);
        }

        // Show Debug Menu if ESC key is pressed
        if (Phaser.Input.Keyboard.JustDown(this.debugKey!)) {
            const dg = this.registry.get('debugGUI');
            if (dg) {
                dg.domElement.style.display = dg.domElement.style.display === 'none' ? '' : 'none';
            }
        }

        this.handleInteract(this, this.player!, this.guideNPC!, this.interactKey!);
        
    }

    private updateWorldBounds() {
        this.backgroundImages!.farBuildings.destroy();
        this.backgroundImages!.backBuildings.destroy();
        this.backgroundImages!.middle.destroy();
        this.backgroundImages!.foreground.destroy();
        this.backgroundImages!.farBuildings = this.createBackground('far-buildings', this.width, this.height*1.25);
        this.backgroundImages!.backBuildings = this.createBackground('back-buildings', this.width, this.height*1.2);
        this.backgroundImages!.middle = this.createBackground('middle', this.width, this.height*1.05);
        this.backgroundImages!.foreground = this.createBackground('foreground-empty', this.width, this.height*0.9);
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

            // Cancel previous delayedCall and destroy chatBubble immediately if 'F' is pressed again
            if (this.chatBubble && this.chatBubble.anims && this.chatBubble.anims.isPlaying) {
                if (this.timerEvent) {
                    this.timerEvent.remove(false);
                    this.timerEvent = null;
                }
                this.chatBubble.anims.play('chat_bubble_reverse', true);
                this.time.delayedCall(500, () => {
                    this.chatBubble?.destroy();
                });
                return;
            }

            if(this.chatBubble) {
                this.chatBubble.destroy();
            }

            const newChatBubble = this.add.sprite(this.guideNPC!.x - 123, this.guideNPC!.y - 130, 'chat_bubble').setScale(0.34);
            newChatBubble.flipX = true;
            newChatBubble.play('chat_bubble', true);

            // Save the TimerEvent returned by delayedCall
            this.timerEvent = this.time.delayedCall(5000, () => {
                if (!newChatBubble.anims) return;
                newChatBubble.anims.play('chat_bubble_reverse', true);
                this.time.delayedCall(500, () => {
                    newChatBubble.destroy();
                });
            });

            this.chatBubble = newChatBubble;
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

        this.guideNPC!.play('standingNPC', true);
        this.guideNPC!.flipX = true;
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

    private setupAnimations() {
        this.anims.create({ key: 'standingPlayer', frames: this.anims.generateFrameNames(
            'player', { prefix: 'standing', start: 1, end: 11, zeroPad: 4 }), frameRate: 3, repeat: -1 });
        this.anims.create({ key: 'walking', frames: this.anims.generateFrameNames(
            'player', { prefix: 'walk', start: 1, end: 7, zeroPad: 4 }), frameRate: 10, repeat: -1 });
        this.anims.create({ key: 'running', frames: this.anims.generateFrameNames(
            'player', { prefix: 'run', start: 1, end: 8, zeroPad: 4 }), frameRate: 10, repeat: -1 });
        this.anims.create({ key: 'jumping', frames: this.anims.generateFrameNames(
            'player', { prefix: 'jump', start: 1, end: 8, zeroPad: 4 }), frameRate: 7, repeat: 0 });
        this.anims.create({ key: 'melee', frames: this.anims.generateFrameNames(
            'player', { prefix: 'melee', start: 1, end: 13, zeroPad: 4 }), frameRate: 10, repeat: 0 });
        this.anims.create({ key: 'dying', frames: this.anims.generateFrameNames(
            'player', { prefix: 'death', start: 1, end: 4, zeroPad: 4 }), frameRate: 3, repeat: 0 });
        this.anims.create({ key: 'cloud', frames: this.anims.generateFrameNames(
            'cloud', { prefix: 'cloud', start: 1, end: 4, zeroPad: 4 }), frameRate: 7, repeat: -1 });
        let chatBubbleFrames = this.anims.generateFrameNames('chat_bubble', { prefix: 'chat', start: 1, end: 4, zeroPad: 2 })
        this.anims.create({ key: 'chat_bubble', frames: chatBubbleFrames, frameRate: 7, repeat: 0 });
        this.anims.create({ key: 'chat_bubble_reverse', frames: chatBubbleFrames.reverse(), frameRate: 7, repeat: 0 });
        this.anims.create({ key: 'standingNPC', frames: this.anims.generateFrameNames(
            'guideNPC', { prefix: 'standing', start: 1, end: 22, zeroPad: 4 }), frameRate: 3, repeat: -1 });
    }

    private addPlatform(x: number, y: number, width: number) {
        for (let i = 0; i < width; i++) {
            this.platforms!.create(x + i * 64, y, 'street');
        }
    }
}
