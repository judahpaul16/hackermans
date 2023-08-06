import Phaser from 'phaser';

export default class MainMenuScene extends Phaser.Scene {
    private mainMenuBG!: Phaser.GameObjects.Video;
    private clickCounter: number = 0;
    private insertCoin!: Phaser.GameObjects.Text;
    private mainMenuText!: Phaser.GameObjects.Text;
    private timerEvent: Phaser.Time.TimerEvent | null = null;

    constructor() {
        super({ key: 'MainMenuScene' });
    }

    create() {
        this.createPreBackground();
        this.input.on('pointerdown', this.handleInput, this);
        this.input.keyboard!.on('keydown', this.handleInput, this);
    }

    private handleInput() {
        this.clickCounter++;
        this.insertCoin.destroy();
        if (this.timerEvent) this.timerEvent.destroy(); // Stop the ellipses animation
        if (this.clickCounter === 1) {
            // Set the background and show text
            this.createBackground();
            this.sound.play('mainMusic', { loop: true });
            this.mainMenuText = this.add.text(255, 560, 'Press any key to enter\nthe city...', {
                fontSize: '20px',
                color: '#000',
                fontStyle: 'bold',
                align: 'center'
            }).setOrigin(0.5);
            // Ellipses animation
            let ellipses = '';
            this.timerEvent = this.time.addEvent({
                delay: 500,
                callback: () => {
                    ellipses += '.';
                    if (ellipses.length > 3) ellipses = '';
                    this.mainMenuText.setText('Press any key to enter\nthe city' + ellipses);
                },
                loop: true
            });
        } else if (this.clickCounter === 2) {
            // Start the next scene
            this.scene.start('GameScene1');
            this.game.registry.set('previousScene', this.scene.key);
        }
    }

    private createPreBackground() {
        // Center
        this.insertCoin = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 50, 'Insert Coin', {
            fontSize: '20px',
            color: '#fff',
            align: 'center'
        }).setOrigin(0.5);

        // Ellipses animation
        let ellipses = '';
        this.timerEvent = this.time.addEvent({
            delay: 500,
            callback: () => {
                ellipses += '.';
                if (ellipses.length > 3) ellipses = '';
                this.insertCoin?.setText('Insert Coin' + ellipses);
            },
            loop: true
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
