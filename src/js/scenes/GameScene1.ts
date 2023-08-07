import Phaser from 'phaser';
import Player from '../classes/entities/Player';
import Player2 from '../classes/entities/Player2';
import Enemy from '../classes/entities/Enemy';
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

    private initializeDebugGUI() {
        const dg = new dat.GUI();
        dg.domElement.style.display = 'none';
        this.registry.set('debugGUI', dg);
        this.dg = dg;

        // Add toggle for physics arcade debug to display sprite bounds
        const debugGraphic = this.physics.world.createDebugGraphic();
        debugGraphic.setVisible(false);
        this.dg.add(debugGraphic, 'visible').name('Show Bounds').listen();
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

        // Platform setup
        this.platforms = this.physics.add.staticGroup();
        this.addPlatform(150, 790, 1000);

        // Anims setup
        this.setupAnimations();

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
        this.initializeDebugGUI();
        if (this.dg) {
            const cameraFolder = this.dg?.addFolder('Camera');
            if (cameraFolder) {
                // cameraFolder?.add(this.cameras.main, 'scrollX', 0, 10000);
                // cameraFolder?.add(this.cameras.main, 'scrollY', 0, 10000);
                cameraFolder?.add(this.cameras.main, 'zoom', 0.5, 5);
            }

            const worldFolder = this.dg.addFolder('World');
            worldFolder.add(this.physics.world.gravity, 'y', -1000, 1000, 1).name('Gravity').listen();
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

        this.handleInteract(this, this.player!, this.player2!, this.interactKey!);

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
    
    private updateWorldBounds() {
        this.backgroundImages!.farBuildings.destroy();
        this.backgroundImages!.backBuildings.destroy();
        this.backgroundImages!.middle.destroy();
        this.backgroundImages!.foreground.destroy();
        this.backgroundImages!.farBuildings = this.createBackground('far-buildings', this.width, this.height*this.sfactor1);
        this.backgroundImages!.backBuildings = this.createBackground('back-buildings', this.width, this.height*this.sfactor2);
        this.backgroundImages!.middle = this.createBackground('middle', this.width, this.height*this.sfactor3);
        this.backgroundImages!.foreground = this.createBackground('foreground-empty', this.width, this.height*this.sfactor4);
        this.backgroundImages!.farBuildings.setDepth(-1);
        this.backgroundImages!.backBuildings.setDepth(-1);
        this.backgroundImages!.middle.setDepth(-1);
        this.backgroundImages!.foreground.setDepth(-1);
        this.physics.world.setBounds(0, 0, this.width, 800);
        this.cameras.main.setBounds(0, 0, this.width, 800);
    }
    
    private timerEvent: Phaser.Time.TimerEvent | null = null;

    private handleInteract(scene: Phaser.Scene, player: Player, player2: Player2, interactKey: Phaser.Input.Keyboard.Key) {

        if (Phaser.Input.Keyboard.JustDown(this.interactKey!)) {
            this.interactHint?.setVisible(false);

            // Start playing player2's audio corresponding to dialogue1
            this.sound.stopByKey('p2Dialogue1');
            this.sound.play('p2Dialogue1', { volume: 1 });

            // Cancel previous delayedCall and reset dialogue immediately if 'F' is pressed again
            if (this.chatBubble && this.chatBubble.anims && this.chatBubble.anims.isPlaying) {

                if (this.timerEvent) {
                    this.timerEvent.remove(false);
                    this.timerEvent = null;
                }
                this.chatBubble.anims.play('chat_bubble_reverse', true);
                this.time.delayedCall(500, () => {
                    this.dialogueText?.destroy();
                    this.chatBubble?.destroy();
                });
                return;
            }

            if(this.chatBubble) {
                this.dialogueText?.destroy();
                this.chatBubble.destroy();
            }

            const newChatBubble = this.add.sprite(this.player2!.x - 123, this.player2!.y - 130, 'chat_bubble').setScale(0.34);
            newChatBubble.flipX = true;
            newChatBubble.play('chat_bubble', true);

            // Add this to set up the typewriter effect
            const dialogue = "Things haven't been the same since the 7/11 attacks.\nBut, if you follow my lead, you might just\nmake it out of here alive.";
            let textContent = "";
            const textSpeed = 55; // Speed of typewriter effect in milliseconds
            this.dialogueText = this.add.text(
                newChatBubble.x - (newChatBubble.width * 0.1 / 2) - 235,
                newChatBubble.y - (newChatBubble.height * 0.1 / 2) - 15,
                "",
                { font: "16px", color: "#000", align: "center"}
            );

            let charIndex = 0;

            this.time.addEvent({
                delay: textSpeed,
                callback: () => {
                    textContent += dialogue[charIndex];
                    this.dialogueText?.setText(textContent);
                    charIndex++;
                },
                repeat: dialogue.length - 1
            });

            // Save the TimerEvent returned by delayedCall
            this.timerEvent = this.time.delayedCall(9000, () => {
                if (!newChatBubble.anims) return;
                newChatBubble.anims.play('chat_bubble_reverse', true);
                this.dialogueText?.destroy();
                this.time.delayedCall(500, () => {
                    this.interactHint?.setVisible(true);
                    newChatBubble.destroy();
                });
            });

            this.chatBubble = newChatBubble;
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
            'player', { prefix: 'death', start: 1, end: 4, zeroPad: 4 }), frameRate: 4, repeat: 0 });
        this.anims.create({ key: 'cloud', frames: this.anims.generateFrameNames(
            'cloud', { prefix: 'cloud', start: 1, end: 4, zeroPad: 4 }), frameRate: 7, repeat: -1 });
        let chatBubbleFrames = this.anims.generateFrameNames('chat_bubble', { prefix: 'chat', start: 1, end: 4, zeroPad: 2 })
        this.anims.create({ key: 'chat_bubble', frames: chatBubbleFrames, frameRate: 7, repeat: 0 });
        this.anims.create({ key: 'chat_bubble_reverse', frames: chatBubbleFrames.reverse(), frameRate: 7, repeat: 0 });
        this.anims.create({ key: 'standingP2', frames: this.anims.generateFrameNames(
            'player2', { prefix: 'standing', start: 1, end: 22, zeroPad: 4 }), frameRate: 3, repeat: -1 });
        this.anims.create({ key: 'walkingP2', frames: this.anims.generateFrameNames(
            'player2', { prefix: 'walk', start: 1, end: 8, zeroPad: 4 }), frameRate: 10, repeat: -1 });
        this.anims.create({ key: 'runningP2', frames: this.anims.generateFrameNames(
            'player2', { prefix: 'run', start: 1, end: 8, zeroPad: 4 }), frameRate: 10, repeat: -1 });
        this.anims.create({ key: 'jumpingP2', frames: this.anims.generateFrameNames(
            'player2', { prefix: 'jump', start: 1, end: 8, zeroPad: 4 }), frameRate: 7, repeat: 0 });
    }

    public addPlatform(x: number, y: number, width: number) {
        for (let i = 0; i < width; i++) {
            this.platforms!.create(x + i * 64, y, 'street');
        }
    }
}

export function createHealthBar(scene: Phaser.Scene, player: Player | Player2) {
    // Determine if the character is an Player2
    const isP2 = player instanceof Player2;

    // Adjust the x-position of the health bar for P2
    const xOffset = isP2 ? 360 : 0;

    // Adding the avatar image at the top left corner with xOffset
    let someAvatar = isP2 ? 'p2Avatar' : 'avatar';
    player.avatar = scene.add.image(100 + xOffset, 100, someAvatar);

    // Creating a circular mask using a Graphics object
    player.amask = scene.make.graphics({});
    player.amask.fillCircle(100 + xOffset, 100, 30); // X, Y, radius with xOffset

    // Applying the mask to the avatar
    player.avatar.setMask(player.amask.createGeometryMask());
    player.amask.setScrollFactor(0);

    // Scale the avatar
    const avatarScale = 0.6;
    player.avatar.setScale(avatarScale);

    // Get the scaled height of the avatar
    const avatarHeight = player.avatar.height * avatarScale;

    // Background of the health bar (position it relative to avatar, with the possible offset for P2)
    player.healthBarFrame = scene.add.image(player.avatar.x - 36, player.avatar.y - 35, 'health-bar-frame').setOrigin(0);

    // Scale the healthBarFrame to match the avatar's height
    const healthBarFrameScale = avatarHeight / player!.healthBarFrame.height;
    player!.healthBarFrame.setScale(healthBarFrameScale);

    // Foreground/fill of the health bar (same position as background)
    // Create a Graphics object
    player!.healthBarFill = scene.add.graphics({ fillStyle: { color: 0x00ff00 } });

    // Determine the width based on the current health percentage
    let fillWidth = (player!.currentHealth / player!.maxHealth) * 265;

    // Draw a rectangle representing the fill
    player!.healthBarFill.fillRect(player!.healthBarFrame.x + 20, player!.healthBarFrame.y + 20, fillWidth, 30);

    player!.healthBarFill = updateHealthBar(scene, player);
            
    // Set the depth of the avatar to ensure it's rendered in front of the frame
    player.avatar.setDepth(5);
    // Set the depth of the health bar to ensure it's rendered in behind the frame
    player!.healthBarFrame.setDepth(4);
    player!.healthBarFill.setDepth(3);

    // Add the player's name above the avatar
    const name = scene.add.text(player.avatar.x + 36, player.avatar.y - 33, player.name, { fontSize: 15, color: '#ffffff' });

    // Check if the HUD elements are defined before creating the container
    if (player!.avatar && player!.healthBarFrame && player!.healthBarFill) {
        player!.hudContainer = scene.add.container(0, 0, [player!.healthBarFill, player!.healthBarFrame, name, player!.avatar]);
        player!.hudContainer.setDepth(2);
    }
}

export function updateHealthBar(scene: Phaser.Scene, player: Player) {
    // Update the HUD container's position to match the camera's scroll
    if (player!.hudContainer && scene.cameras.main) {
        player!.hudContainer.setPosition(scene.cameras.main.scrollX, scene.cameras.main.scrollY);
    }

    // Update the width of the health bar fill
    let fillWidth = (player!.currentHealth / player!.maxHealth) * 265;
    if (player!.healthBarFill) {
        player!.healthBarFill.clear();
        player!.healthBarFill.fillRect(player!.healthBarFrame.x + 20, player!.healthBarFrame.y + 20, fillWidth, 30);
    }
    return player!.healthBarFill;
}

export function destroyHealthBar(player: Player | Player2 | Enemy) {
    if (player.avatar && player.amask && player.healthBarFrame && player.healthBarFill && player.hudContainer) {
        player.avatar.destroy();
        player.amask.destroy();
        player.healthBarFrame.destroy();
        player.healthBarFill.destroy();
        player.hudContainer.destroy();
    }
}
export function follow(scene: Phaser.Scene, player2: Player2, player: Player, interactHint: Phaser.GameObjects.Text, followSpeed: number = 300, bufferZone: number = 150, walkSpeed: number = 175, jumpStrength: number = 200) {
    if (player2.body!.touching.down) {
        const distanceToPlayer = player2.x - player.x;
        let startFollowing = false;

        if (distanceToPlayer <= 300 || startFollowing) {
            startFollowing = true;
            interactHint.setVisible(false);
            // If Player2 is close to the player, stop moving
            if (Math.abs(distanceToPlayer) < bufferZone) {
                player2.play('standingP2', true);
                player2.setVelocityX(0);
                interactHint.x = player2.x - 40;
                interactHint.setVisible(true)
            } else {
                const isCloser = Math.abs(distanceToPlayer) < walkSpeed;
                const animation = isCloser ? 'walkingP2' : 'runningP2';
                const speed = isCloser ? walkSpeed : followSpeed;

                player2.y -= 10;
                player2.setOffset(0, -12);
                player2.play(animation, true);
                player2.setVelocityX(distanceToPlayer < 0 ? speed : -speed);
                // player2.setVelocityY(-200); // Keep the Player2 from falling through the ground
                player2.flipX = distanceToPlayer > 0;

                // Check if there's an obstacle in the way
                if (obstacleInWay(player2)) {
                    player2.play('jumpingP2', true);
                    player2.setVelocityY(-jumpStrength);
                }
            }
        }
    }
}


// You'll need to define what an obstacle is in your game environment
function obstacleInWay(player2: Player2): boolean {
    // Implement your logic to detect obstacles here.
    // This could include raycasting, collision checks, or other techniques specific to your game.
    return false; // Return true if an obstacle is detected
}