import Phaser from 'phaser';
import BaseScene from './BaseScene';
import Player from '../classes/entities/Player';
import Player2 from '../classes/entities/Player2';
import Enemy from '../classes/entities/Enemy';
import * as common from '../helpers/common';

export default class GameScene3 extends BaseScene {
    public backgroundKey1: string = 'foreground-2';
    public backgroundKey2: string = 'middle';
    public backgroundKey3: string = 'back-buildings';
    public backgroundKey4: string = 'skyline-a';
    public levelNumber: number = 3;
    public width: number = 1600;
    public sfactor1: number = 1.3;
    public sfactor2: number = 0;
    public sfactor3: number = 0.4;
    public sfactor4: number = 0.9;

    protected resetPlayer() {
        if (this.player) {
          this.player.setPosition(200, 650);
        }
    }

    constructor() {
        super({ key: 'GameScene3' });
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
        common.createClouds(this, 3);
        
        // Street setup
        this.platforms = this.physics.add.staticGroup();
        common.addPlatform(this, 150, 790, 1000, 'street-2');

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
        
        // Super
        super.create();
    }

    update() {
        // Scene loop logic

        // Update clouds
        common.updateClouds(this);

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

        // if player moves beyond the left edge of the world, start the previous scene
        if (this.player!.x < 0) {
            this.dg!.destroy();
            this.scene.start('GameScene2');
            this.game.registry.set('previousScene', this.scene.key);
        }

        // // if player moves beyond the right edge of the world, start the next scene
        // if (this.player!.x > this.width) {
        //      this.dg!.destroy();
        //     this.scene.start('GameScene3');
        //     this.game.registry.set('previousScene', this.scene.key);
        // }

        // Super
        super.update();
    }
}
