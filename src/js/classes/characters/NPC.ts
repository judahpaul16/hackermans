import Phaser from 'phaser';
import Player from './Player';

export default class NPC extends Player {
    public name: string = 'Anonymusk';
    public currentAnimation?: string;
    public scale = 1.8;
    public maxHealth: number = 100;
    public currentHealth: number = 100;
    public interactHint?: Phaser.GameObjects.Text | null = null;
    public standKey: string = 'standingNPC1';
    public walkKey: string = 'walkingNPC1';
    public runKey: string = 'runningNPC1';
    public jumpKey: string = 'jumpingNPC1';
    public dyingKey: string = 'dyingNPC1';
    public hurtKey: string = 'hurtNPC1';
    public meleeKey: string = 'meleeNPC1';
    public shootKey: string = 'shootNPC1';

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string | number) {
        super(scene, x, y, texture, frame);

        // Ensure the scene is not undefined before adding the sprite
        if (scene) {
            scene.add.existing(this);
            if (scene.physics && scene.physics.world) {
                scene.physics.world.enable(this);
                this.setDepth(3);
            }
        }
    }
}
