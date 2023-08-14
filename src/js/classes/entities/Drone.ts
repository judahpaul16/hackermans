import Phaser from 'phaser';
import Player from '../characters/Player';
import Player2 from '../characters/Player2';
import Player3 from '../characters/Player3';
import NPC from '../characters/NPC';

export default class Drone extends Phaser.GameObjects.Sprite {
    public currentAnimation?: string;
    public textureKey: string = 'drone';

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
        super(scene, x, y, texture);

        // Ensure the scene is not undefined before adding the sprite
        if (scene) {
            scene.add.existing(this);
            if (scene.physics && scene.physics.world) {
                scene.physics.world.enable(this);
                // set gravity to 0
                let body = (this.body as Phaser.Physics.Arcade.Body)
                body.setGravityY(0);
                body.setAllowGravity(false);
            }
        }

        // Setup event listeners for animationstart and animationcomplete
        this.on('animationstart', this.handleAnimationStart, this);
        this.on('animationcomplete', this.handleAnimationComplete, this);
    }
    
    protected handleAnimationStart(animation: Phaser.Animations.Animation, frame: Phaser.Animations.AnimationFrame) {
        this.currentAnimation = animation.key;
    }

    protected handleAnimationComplete(animation: Phaser.Animations.Animation, frame: Phaser.Animations.AnimationFrame) {
        if (this.currentAnimation === animation.key) {
            this.currentAnimation = undefined;
        }
    }
    
    public getCurrentAnimation() {
        return this.currentAnimation;
    }
}