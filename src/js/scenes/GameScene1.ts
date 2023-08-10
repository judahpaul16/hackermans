import Phaser from 'phaser';
import BaseScene from './BaseScene';
import Player from '../classes/entities/Player';
import Player2 from '../classes/entities/Player2';
import Player3 from '../classes/entities/Player3';
import Enemy from '../classes/entities/Enemy';
import * as common from '../helpers/common';

export default class GameScene1 extends BaseScene {
    public backgroundKey1: string = 'foreground-empty';
    public backgroundKey2: string = 'middle';
    public backgroundKey3: string = 'back-buildings';
    public backgroundKey4: string = 'far-buildings';
    public levelNumber: number = 1;

    protected resetPlayer() {
        if (this.player) {
          this.player.setPosition(200, 650);
        }
    }

    constructor() {
        super({ key: 'GameScene1' });
    }
    
    create() {
        // Scene Setup
        this.physics.world.setBounds(0, 0, this.width, 800);

        // Background images setup
        this.backgroundImages = {
            farBuildings: common.createBackground(this, this.backgroundKey4, this.width, this.height*this.sfactor1),
            backBuildings: common.createBackground(this, this.backgroundKey3, this.width, this.height*this.sfactor2),
            middle: common.createBackground(this, this.backgroundKey2, this.width, this.height*this.sfactor3),
            foreground: common.createBackground(this, this.backgroundKey1, this.width, this.height*this.sfactor4),
        };

        // Cloud Setup
        common.createClouds(this, 10);

        // Street setup
        this.platforms = this.physics.add.staticGroup();
        common.addPlatform(this, 150, 790, 1000, 'street');

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
        
        // Attach camera to player
        this.player!.attachCamera();

        // Player 2 setup
        // if previous scene is GameScene2, start player2 at the end of the scene
        if (previousSceneName === 'GameScene2') {
            this.player2 = new Player2(this, this.width - 50, 650, 'player2');
            this.player.flipX = true;
        } else {
            this.player2 = new Player2(this, 525, 650, 'player2');
        }
        this.player2.body!.setSize(40, 60);
        this.player2.setScale(2);
        this.player2.body!.setOffset(0, 6);
        this.physics.add.collider(this.player2, this.platforms);

        this.player2!.play('standingP2', true);
        this.player2!.flipX = true;

        // Player 3 setup
        // if previous scene is GameScene2, start player2 at the end of the scene
        if (previousSceneName === 'GameScene2') {
            this.player3 = new Player3(this, this.width - 50, 650, 'player3');
            this.player.flipX = true;
        } else {
            this.player3 = new Player3(this, 1325, 650, 'player3');
        }
        this.player3.body!.setSize(40, 60);
        this.player3.setScale(2);
        this.player3.body!.setOffset(0, 6);
        this.physics.add.collider(this.player3, this.platforms);

        this.player3!.play('standingP3', true);
        this.player3!.flipX = true;

        // HUD setup
        common.createHealthBar(this, this.player);

        // Calculate distance between player and Player2
        const distance1_2 = Phaser.Math.Distance.Between(
            this.player!.x, this.player!.y,
            this.player2!.x, this.player2!.y
        );
        this.p2HealthBarCreated = false;
        if (distance1_2 <= 20 && !this.p2HealthBarCreated) {
            // Create Player2 health bar
            common.createHealthBar(this, this.player2!);
            this.p2HealthBarCreated = true;
        } else if (distance1_2 > 20 && this.p2HealthBarCreated) {
            // Destroy Player2 health bar
            common.destroyHealthBar(this.player2!);
            this.p2HealthBarCreated = false;
        }

        // Calculate distance between player and Player3
        const distance1_3 = Phaser.Math.Distance.Between(
            this.player!.x, this.player!.y,
            this.player3!.x, this.player3!.y
        );
        this.p3HealthBarCreated = false;
        if (distance1_3 <= 20 && !this.p3HealthBarCreated) {
            // Create Player3 health bar
            common.createHealthBar(this, this.player3!);
            this.p3HealthBarCreated = true;
        } else if (distance1_3 > 20 && this.p3HealthBarCreated) {
            // Destroy Player3 health bar
            common.destroyHealthBar(this.player3!);
            this.p3HealthBarCreated = false;
        }


        // Super
        super.create();
    }

    update() {
        // Scene loop logic

        // Update clouds
        common.updateClouds(this);

        // Update Player2 and Health Bars
        // Calculate distance between player and Player2
        const distance1_2 = Phaser.Math.Distance.Between(
            this.player!.x, this.player!.y,
            this.player2!.x, this.player2!.y
        );

        common.follow(this, this.player2!, this.player!, this.interactHint!)

        if (distance1_2 <= 300 && !this.p2HealthBarCreated) {
            // Create Player2 health bar
            common.createHealthBar(this, this.player2!);
            this.p2HealthBarCreated = true;
        } else if (distance1_2 > 300 && this.p2HealthBarCreated) {
            // Destroy Player2 health bar
            common.destroyHealthBar(this.player2!);
            this.p2HealthBarCreated = false;
        }

        // Update Player3 and Health Bars
        // Calculate distance between player and Player3
        const distance1_3 = Phaser.Math.Distance.Between(
            this.player!.x, this.player!.y,
            this.player3!.x, this.player3!.y
        );

        common.follow(this, this.player3!, this.player!, this.interactHint!)

        if (distance1_3 <= 300 && !this.p3HealthBarCreated) {
            // Create Player3 health bar
            common.createHealthBar(this, this.player3!);
            this.p3HealthBarCreated = true;
        } else if (distance1_3 > 300 && this.p3HealthBarCreated) {
            // Destroy Player3 health bar
            common.destroyHealthBar(this.player3!);
            this.p3HealthBarCreated = false;
        }

        // Update health bars only if created
        if (this.player) common.updateHealthBar(this, this.player);
        if (this.p2HealthBarCreated && this.player2) common.updateHealthBar(this, this.player2);
        if (this.p3HealthBarCreated && this.player3) common.updateHealthBar(this, this.player3);

        // if player moves beyond the right edge of the world, start the next scene
        if (this.player!.x > this.width) {
            this.dg!.destroy();
            this.scene.start('GameScene2');
            this.game.registry.set('previousScene', this.scene.key);
        }

        // Super
        super.update();
    }
}