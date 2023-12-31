import Phaser from 'phaser';
import BaseScene from './BaseScene';
import EnemyAI from '../classes/characters/EnemyAI';
import Drone from '../classes/entities/Drone';
import * as functions from '../helpers/functions';

export default class GameScene2 extends BaseScene {
    public backgroundKey1: string = 'foreground';
    public backgroundKey2: string = 'middle';
    public backgroundKey3: string = 'back-buildings';
    public backgroundKey4: string = 'far-buildings';
    public width: number = 20000;
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
        
        // Drone setup
        // random positions xs and ys within the bounds of the scene no y greater than 600
        for (let i = 0; i < 50; i++) {
            let x = Phaser.Math.Between(0, this.width);
            let y = Phaser.Math.Between(0, 600);
            this.drones.push(new Drone(this, x, y, 'drone').setFlipX(true).play('spin', true));
        }

        // EnemyAI setup
        this.enemies = [
            new EnemyAI(this, 2500, 600, 'enemyAI', 'ranged').setFlipX(true).play('standingEAI', true),
            new EnemyAI(this, 3000, 600, 'enemyAI', 'ranged').setFlipX(true).play('standingEAI', true),
            new EnemyAI(this, 3500, 600, 'enemyAI', 'ranged').setFlipX(true).play('standingEAI', true),
            new EnemyAI(this, 4000, 600, 'enemyAI', 'ranged').setFlipX(true).play('standingEAI', true),
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
