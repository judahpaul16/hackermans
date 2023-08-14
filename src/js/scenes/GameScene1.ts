import Phaser from 'phaser';
import BaseScene from './BaseScene';
import Player from '../classes/characters/Player';
import Player2 from '../classes/characters/Player2';
import Player3 from '../classes/characters/Player3';
import Enemy from '../classes/characters/Enemy';
import NPC from '../classes/characters/NPC';
import * as functions from '../helpers/functions';

export default class GameScene1 extends BaseScene {
    public backgroundKey1: string = 'foreground-empty';
    public backgroundKey2: string = 'middle';
    public backgroundKey3: string = 'back-buildings';
    public backgroundKey4: string = 'far-buildings';
    public levelNumber: number = 1;
    public width: number = 3000;
    public p1StartX: number = 200;
    public p2StartX: number = 525;
    public p3StartX: number = 1500;

    constructor() {
        super({ key: 'GameScene1' });
    }
    
    create() {
        // Scene Setup
        this.physics.world.setBounds(0, 0, this.width, 800);

        // Background images setup
        this.backgroundImages = {
            farBuildings: functions.createBackground(this, this.backgroundKey4, this.width, this.height*this.sfactor1),
            backBuildings: functions.createBackground(this, this.backgroundKey3, this.width, this.height*this.sfactor2),
            middle: functions.createBackground(this, this.backgroundKey2, this.width, this.height*this.sfactor3),
            foreground: functions.createBackground(this, this.backgroundKey1, this.width, this.height*this.sfactor4),
        };

        // Cloud Setup
        functions.createClouds(this, 10);

        // NPC setup
        this.npcs = [
            new NPC(this, 2750, 600, 'npc').setFlipX(true).play('standingNPC1', true),
        ];

        // Drone setup
        this.drones = [
            this.add.sprite(1000, 500, 'drone').setFlipX(true).play('spin', true),
            this.add.sprite(1500, 500, 'drone').setFlipX(true).play('spin', true),
            this.add.sprite(2000, 500, 'drone').setFlipX(true).play('spin', true),
        ];

        // Super
        super.create();
    }

    update() {
        // Scene loop logic

        // Update clouds
        functions.updateClouds(this);

        // Super
        super.update();
    }
}