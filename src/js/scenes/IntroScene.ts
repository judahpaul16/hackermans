import Phaser from 'phaser';
import WebFontFile from '../classes/utils/WebFontFile';

export default class IntroScene extends Phaser.Scene {
    private typewriterText!: Phaser.GameObjects.Text;
    private message: string = '$> Wake up, Anon...\n\n$> Nothing is what it seems...\n\n$> Follow the white rabbit...\n\n|';
    private currentIndex: number = 0;
    private typingFinished: boolean = false;
    
    constructor() {
        super({ key: 'IntroScene' });
    }

    preload(): void {
        // Load fonts
        this.load.addFile(new WebFontFile(this.load, 'Press Start 2P'));
    }

    create(): void {
        this.typewriterText = this.add.text(30, 30, '', { fontSize: '18px', fontFamily: '"Press Start 2P"', color: '#0f0' });

        this.time.addEvent({
            delay: 100,
            callback: this.updateText,
            callbackScope: this,
            loop: true
        });

        this.input.keyboard!.once('keydown', this.startGame, this);
        this.input.once('pointerdown', this.startGame, this);
    }

    private updateText(): void {
        if (this.currentIndex < this.message.length) {
            this.typewriterText.text += this.message.charAt(this.currentIndex);
            this.currentIndex++;
        } else if (!this.typingFinished) {
            this.typingFinished = true;
            this.time.delayedCall(2000, this.startGame, [], this);
        }
    }

    private startGame(): void {
        this.scene.start('MainMenuScene');
    }
}
