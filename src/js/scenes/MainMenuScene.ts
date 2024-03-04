import Phaser from 'phaser';
import { setupAnimations } from '../helpers/animations';

export default class MainMenuScene extends Phaser.Scene {
    private coin!: Phaser.GameObjects.Sprite;
    private mainMenuBG!: Phaser.GameObjects.Video;
    private clickCounter: number = 0;
    private insertCoin!: Phaser.GameObjects.Text;
    private mainMenuText!: Phaser.GameObjects.Text;
    private timerEvent: Phaser.Time.TimerEvent | null = null;
    private ready: boolean = false;
    private logo!: Phaser.GameObjects.Sprite;

    constructor() {
        super({ key: 'MainMenuScene' });
    }

    create() {
        this.scale.on('resize', (gameSize: Phaser.Structs.Size) => this.resizeCallback(gameSize));

        // Initialize the click counter
        this.clickCounter = 0;

        // Setup Animations
        setupAnimations(this);

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
            this.sound.play('coinSound', { volume: 0.1 });
            // Set the Main Menu Background
            this.createBackground();
            // If not already playing, play the main music
            if (!this.sound.get('mainMusic')) this.sound.play('mainMusic', { loop: true, volume: 0.5 });
            // Set Logo
            this.logo = this.add.sprite(310, window.innerHeight / 2 + 20, 'logo').setAlpha(0);
            // Insert semi-transparent rectangle to darken the background behind logo
            let rect = this.add.rectangle(this.logo.x, this.logo.y + 25, 400, 150, 0x000000).setAlpha(0).setDepth(-1);
            this.time.delayedCall(600, () => {
                this.tweens.add({
                    targets: rect,
                    alpha: { from: 0, to: 0.4 },
                    duration: 500,
                    ease: 'Linear'
                });
            });
            this.time.delayedCall(1000, () => {
                this.tweens.add({
                    targets: this.logo,
                    alpha: { from: 0, to: 1 },
                    duration: 1000,
                    ease: 'Linear'
                });
                this.logo.setScale(0.75);
                this.logo.play('logoAnimation');
            });
            // Set the Main Menu Text
            this.time.delayedCall(2500, () => {
                this.mainMenuText = this.add.text(this.logo.x, this.logo.y + 65, 'Press any key to enter\nthe city...', {
                    fontSize: '20px',
                    color: '#333333',
                    fontStyle: 'bold',
                    align: 'center',
                    strokeThickness: 2
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
                // Fade in and out the text
                this.tweens.add({
                    targets: this.mainMenuText,
                    alpha: { from: 0, to: 0.75 },
                    duration: 1000,
                    ease: 'Linear',
                    yoyo: true,
                    repeat: -1,
                });
                this.ready = true;
            });
        }
        if (!this.ready) return;
        // If the user clicks twice, start the game
        if (this.clickCounter >= 2) {
            // Lower Main Music Volume
            const mainMusic = this.sound.get('mainMusic');
            if (mainMusic instanceof Phaser.Sound.WebAudioSound || mainMusic instanceof Phaser.Sound.HTML5AudioSound)
                mainMusic.setVolume(0.35);
            // Start the next scene
            // this.scale.off('resize');
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
        
        this.resizeCallback(this.scale.gameSize);
    }

    private createBackground() {
        this.mainMenuBG = this.add.video(this.cameras.main.centerX, this.cameras.main.centerY, 'mainMenuBG');
        const scaleX = this.cameras.main.width / window.innerWidth;
        const scaleY = this.cameras.main.height / window.innerHeight;
        
        // Choose the smaller of the two scaling factors to ensure the video fits within the game's bounds
        const scale = Math.max(scaleX, scaleY);
        
        this.mainMenuBG.setScale(scale);
        
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

    private resizeCallback(gameSize: Phaser.Structs.Size) {
        if (this.mainMenuBG) {
            // Scale to fit
            const scaleX = gameSize.width / this.mainMenuBG.width;
            const scaleY = gameSize.height / this.mainMenuBG.height;

            const scale = Math.max(scaleX, scaleY);
            this.mainMenuBG.setScale(scale);
            // Reposition
            this.mainMenuBG.setPosition(gameSize.width / 2, gameSize.height / 2);
            this.logo.setPosition(310, window.innerHeight / 2 + 20);
            // Reposition the logo
            if (this.mainMenuText) this.mainMenuText.setPosition(this.logo.x, this.logo.y + 65);
        }
    
        // Reposition the coin
        if (this.coin) this.coin.setPosition(gameSize.width / 2, gameSize.height / 2 + 20);
        // Reposition the insert coin text
        if (this.insertCoin) this.insertCoin.setPosition(gameSize.width / 2, gameSize.height / 2 - 50);
    }    
}
