import Phaser from 'phaser';
import * as functions from '../helpers/functions';

export default class MainMenuScene extends Phaser.Scene {
    private coin!: Phaser.GameObjects.Sprite;
    private mainMenuBG!: Phaser.GameObjects.Video;
    private clickCounter: number = 0;
    private insertCoin!: Phaser.GameObjects.Text;
    private mainMenuText!: Phaser.GameObjects.Text;
    private timerEvent: Phaser.Time.TimerEvent | null = null;
    private ready: boolean = false;

    constructor() {
        super({ key: 'MainMenuScene' });
    }

    create() {
        this.clickCounter = 0;

        // Setup Animations
        functions.setupAnimations(this);

        // Load the Insert Coin Menu
        this.insertCoinMenu();

        // Handle input
        this.input.on('pointerdown', this.handleInput, this);
        this.input.keyboard!.on('keydown', this.handleInput, this);
    }

    private handleInput() {
        this.clickCounter++;
        this.coin.destroy();
        this.insertCoin.destroy();
        if (this.timerEvent) this.timerEvent.destroy(); // Stop the ellipses animation
        if (this.clickCounter === 1) {
            // Play the coin sound
            this.sound.play('coinSound', { volume: 0.5 });
            // Set the Main Menu Background
            this.createBackground();
            // If not already playing, play the main music
            if (!this.sound.get('mainMusic')) this.sound.play('mainMusic', { loop: true, volume: 0.2 });
            // Set Logo
            const logo = this.add.sprite(280, window.innerHeight / 2 + 30, 'logo').setAlpha(0);
            this.time.delayedCall(1000, () => {
                this.tweens.add({
                    targets: logo,
                    alpha: { from: 0, to: 1 },
                    duration: 1000,
                    ease: 'Linear'
                });
                logo.setScale(0.75);
                logo.play('logoAnimation');
            });
            // Set the Main Menu Text
            this.time.delayedCall(3000, () => {
                this.mainMenuText = this.add.text(logo.x, logo.y + 65, 'Press any key to enter\nthe city...', {
                    fontSize: '20px',
                    color: '#333333',
                    fontStyle: 'bold',
                    align: 'center',
                }).setOrigin(0.5).setAlpha(0);
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
                // Fade in the text
                this.tweens.add({
                    targets: this.mainMenuText,
                    alpha: { from: 0, to: 1 },
                    duration: 1000,
                    ease: 'Linear'
                });
                this.ready = true;
            });
        }
        if (!this.ready) return;
        // If the user clicks twice, start the game
        if (this.clickCounter >= 2) {
            // Start the next scene
            this.scene.start('GameScene1');
            this.game.registry.set('previousScene', this.scene.key);
        }
    }

    private insertCoinMenu() {
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

        // Add coin sprite just below the text
        this.coin = this.add.sprite(this.cameras.main.centerX, this.cameras.main.centerY + 20, 'coin');
        this.coin.setScale(0.3);
        this.coin.play('coinAnimation');
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

        // Fade in the video
        this.tweens.add({
            targets: this.mainMenuBG,
            alpha: { from: 0, to: 1 },
            duration: 2000,
            ease: 'Linear'
        });
    }
}
