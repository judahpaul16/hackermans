import Phaser from 'phaser';
import BaseScene from './BaseScene';
import NPC from '../classes/characters/NPC';
import Drone from '../classes/entities/Drone';
import * as functions from '../helpers/functions';

export default class GameScene1 extends BaseScene {
    public backgroundKey1: string = 'foreground-empty';
    public backgroundKey2: string = 'middle';
    public backgroundKey3: string = 'back-buildings';
    public backgroundKey4: string = 'far-buildings';
    public levelNumber: number = 1;
    public width: number = 6000;
    public p1StartX: number = 200;
    public p2StartX: number = 1600;
    public p3StartX: number = 1500;
    public introDialogueStart: boolean = false;

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
        
        // Drone setup
        // random positions xs and ys within the bounds of the scene no y greater than 600
        for (let i = 0; i < 10; i++) {
            let x = Phaser.Math.Between(0, this.width);
            let y = Phaser.Math.Between(0, 600);
            this.drones.push(new Drone(this, x, y, 'drone').setFlipX(true).play('spin', true));
        }

        // NPC setup
        this.npcs = [
            new NPC(this, 5750, 600, 'npc').setFlipX(true).play('standingNPC1', true),
        ];

        // Super
        super.create();

        // Dialogue
        this.time.delayedCall(1000, () => {
            if (this.player && this.player3) {
                let key1 = `${this.player.name.toLowerCase()}Dialogue${this.levelNumber}`;
                let key2 = `${this.player3.name.toLowerCase()}Dialogue${this.levelNumber}`;
                let queue = [
                    { character: this.player, dialogue: this.player.dialogue[key1], key: key1 },
                    { character: this.player3, dialogue: this.player3.dialogue[key2], key: key2 }
                ];
                functions.triggerDialogueQueue(this, queue);
            }
        });
    }

    update() {
        // Scene loop logic

        // Update clouds
        functions.updateClouds(this);

        // Super
        super.update();
    }
}