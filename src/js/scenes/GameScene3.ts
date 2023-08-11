import Phaser from 'phaser';
import BaseScene from './BaseScene';
import Player from '../classes/characters/Player';
import Player2 from '../classes/characters/Player2';
import Player3 from '../classes/characters/Player3';
import Enemy from '../classes/characters/Enemy';
import NPC from '../classes/characters/NPC';
import * as functions from '../helpers/functions';

export default class GameScene3 extends BaseScene {
    public backgroundKey1: string = 'foreground-2';
    public backgroundKey2: string = 'middle';
    public backgroundKey3: string = 'back-buildings';
    public backgroundKey4: string = 'far-buildings';
    public platformKey: string = 'street-2';
    public levelNumber: number = 3;
    public width: number = 1600;
    public sfactor1: number = 1.3;
    public sfactor2: number = 1;
    public sfactor3: number = 1.4;
    public sfactor4: number = 0.9;
    public p1StartX: number = 75;

    constructor() {
        super({ key: 'GameScene3' });
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
        functions.createClouds(this, 3);
        
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
