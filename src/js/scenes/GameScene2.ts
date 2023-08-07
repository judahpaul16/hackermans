import Phaser from 'phaser';
import Player from '../classes/entities/Player';
import Player2 from '../classes/entities/Player2';
import Enemy from '../classes/entities/Enemy';
import * as dat from 'dat.gui';
import * as common from '../utils/common';

export default class GameScene2 extends Phaser.Scene {
    private dg?: dat.GUI;
    private backgroundImages?: {[key: string]: Phaser.GameObjects.TileSprite} = {};
    private clouds: Phaser.GameObjects.Sprite[] = [];
    private player2?: Player2;
    private player?: Player;
    private enemy?: Enemy;
    private interactHint?: Phaser.GameObjects.Text;
    private chatBubble?: Phaser.GameObjects.Sprite;
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
    
    create() {
        // Scene Setup
        this.physics.world.setBounds(0, 0, this.width, 800);

        // Background images setup
        this.backgroundImages = {
            farBuildings: common.createBackground(this, 'far-buildings', this.width, this.height*this.sfactor1),
            backBuildings: common.createBackground(this, 'back-buildings', this.width, this.height*this.sfactor2),
            middle: common.createBackground(this, 'middle', this.width, this.height*this.sfactor3),
            foreground: common.createBackground(this, 'foreground', this.width, this.height*this.sfactor4),
        };        

        // Camera setup
        this.cameras.main.setBounds(0, 0, this.width, 800);
        
        // Add Lv. 2 to the top right corner of the camera
        this.level = this.add.text(this.cameras.main.width - 90, 30, 'Lv. 2', {
            fontSize: 20,
            color: '#ffffff',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 3
        });
        this.level.setScrollFactor(0);
        
        // Cloud Setup
        common.createClouds(this, 10);
        
        // Platform setup
        this.platforms = this.physics.add.staticGroup();
        common.addPlatform(this, 150, 790, 1000, 'street');

        // Player setup
        this.player = new Player(this, 100, 650, 'player');
        this.player.body!.setSize(40, 60);
        this.player.setScale(2);
        this.player.body!.setOffset(0, 6);
        this.physics.add.collider(this.player, this.platforms);
        this.cameras.main.startFollow(this.player!, true, 0.5, 0.5);

        // Player2 setup
        this.player2 = new Player2(this, this.player.x + 25, 650, 'player2');
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
        common.createHealthBar(this, this.player!);

        // Calculate distance between player and Player2
        const distance = Phaser.Math.Distance.Between(
            this.player!.x, this.player!.y,
            this.player2!.x, this.player2!.y
        );
        this.p2HealthBarCreated = false;
        if (distance <= 20 && !this.p2HealthBarCreated) {
            // Create Player2 health bar
            common.createHealthBar(this, this.player2!);
            this.p2HealthBarCreated = true;
        } else if (distance > 20 && this.p2HealthBarCreated) {
            // Destroy Player2 health bar
            common.destroyHealthBar(this.player2!);
            this.p2HealthBarCreated = false;
        }
        
        // Debugging
        common.initializeDebugGUI(this);
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
        common.updateClouds(this);

        // Move the player, check for collisions, etc.
        common.updatePlayer(this, this.player!);
        // Update Player2 and Health Bars
        // Calculate distance between player and Player2
        const distance = Phaser.Math.Distance.Between(
            this.player!.x, this.player!.y,
            this.player2!.x, this.player2!.y
        );

        common.follow(this, this.player2!, this.player!, this.interactHint!)

        if (distance <= 300 && !this.p2HealthBarCreated) {
            // Create Player2 health bar
            common.createHealthBar(this, this.player2!);
            this.p2HealthBarCreated = true;
        } else if (distance > 300 && this.p2HealthBarCreated) {
            // Destroy Player2 health bar
            common.destroyHealthBar(this.player2!);
            this.p2HealthBarCreated = false;
        }

        // Update health bars only if created
        if (this.player) common.updateHealthBar(this, this.player);
        if (this.p2HealthBarCreated && this.player2) common.updateHealthBar(this, this.player2);

        // Reset player position if 'R' key is pressed
        if (Phaser.Input.Keyboard.JustDown(this.resetKey!)) {
            this.player?.setPosition(200, 650);
        }

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

        // if this.level not in camera top right corner, move it there
        if (this.level!.x != this.cameras.main.width - 90 || this.level!.y != 30) {
            this.level!.setPosition(this.cameras.main.width - 90, 30);
        }
        
        // if player moves beyond the left edge of the world, start the previous scene
        if (this.player!.x < 0) {
            this.scene.start('GameScene1');
            this.game.registry.set('previousScene', this.scene.key);
        }

        // // if player moves beyond the right edge of the world, start the next scene
        // if (this.player!.x > this.width) {
        //     this.scene.start('GameScene3');
        //     this.game.registry.set('previousScene', this.scene.key);
        // }
    }
}
