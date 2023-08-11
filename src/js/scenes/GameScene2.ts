import Phaser from 'phaser';
import BaseScene from './BaseScene';
import Player from '../classes/characters/Player';
import Player2 from '../classes/characters/Player2';
import Player3 from '../classes/characters/Player3';
import Enemy from '../classes/characters/Enemy';
import * as functions from '../helpers/functions';

export default class GameScene2 extends BaseScene {
    public backgroundKey1: string = 'foreground';
    public backgroundKey2: string = 'middle';
    public backgroundKey3: string = 'back-buildings';
    public backgroundKey4: string = 'far-buildings';
    public levelNumber: number = 2;
    public p1StartX: number = 75;

    constructor() {
        super({ key: 'GameScene2' });
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
