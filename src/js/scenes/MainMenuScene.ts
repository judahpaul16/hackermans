import Phaser from 'phaser';

export default class MainMenuScene extends Phaser.Scene {
    private mainMenuBG!: Phaser.GameObjects.Video;

    constructor() {
        super({ key: 'MainMenuScene' });
    }

    private timerEvent: Phaser.Time.TimerEvent | null = null;

    create() {
        // Set the background
        this.createBackground();

        // Start the music
        this.sound.play('mainMusic', { loop: true });
        
        this.add.text(255, 560, 'Press any key to enter\nthe city...', {
            fontSize: '20px',
            color: '#000',
            fontStyle: 'bold',
            align: 'center'
        }).setOrigin(0.5);

        this.input.on('pointerdown', () => {
            this.scene.start('GameScene1');
            this.game.registry.set('previousScene', this.scene.key);
        });
        this.input.keyboard!.on('keydown', () => {
            this.scene.start('GameScene1');
            this.game.registry.set('previousScene', this.scene.key);
        });
    }

    private createBackground() {
        this.mainMenuBG = this.add.video(this.cameras.main.centerX, this.cameras.main.centerY, 'mainMenuBG');
        
        // Calculate the scaling factors to fit the video to the game's width and height
        const scaleX = this.cameras.main.width / this.mainMenuBG.width;
        const scaleY = this.cameras.main.height / this.mainMenuBG.height;
        
        // Choose the smaller of the two scaling factors to ensure the video fits within the game's bounds
        const scale = Math.min(scaleX, scaleY);
        
        this.mainMenuBG.setScale(scale / 3 + 0.075);
    
        // Set loop, depth, and mute properties
        this.mainMenuBG.setLoop(true);
        this.mainMenuBG.setDepth(-1);
        this.mainMenuBG.setMute(true);
    
        // Play the video
        this.mainMenuBG.play();
    }    
}
