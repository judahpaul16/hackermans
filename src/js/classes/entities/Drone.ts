import Phaser from 'phaser';

export default class Drone extends Phaser.GameObjects.Sprite {
    public currentAnimation?: string;
    public showAnimationInfo: boolean = false;
    public animationInfoText?: Phaser.GameObjects.Text;
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
                this.animationInfoText = scene.add.text(this.x - 100, this.y - 100, '', { fontSize: '16px', color: '#fff' }).setVisible(false);
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

    public updateAnimationInfo() {
        if (this && this.anims && this.showAnimationInfo && this.animationInfoText && this.anims.currentFrame) {
            // Retrieve the frame number of the current animation
            const frameNumber = this.anims.currentFrame ? this.anims.currentFrame.index : 'N/A';
            this.animationInfoText.setText(`Animation: ${this.currentAnimation}\nFrame: ${frameNumber}`);
            this.animationInfoText.setPosition(this.x - 100, this.y - 100);
            this.animationInfoText.setVisible(true);
        } else if (this.animationInfoText) {
            this.animationInfoText.setVisible(false);
        }
    }
    
}