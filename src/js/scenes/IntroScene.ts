import Phaser from 'phaser';

export default class IntroScene extends Phaser.Scene {
    private typewriterText!: Phaser.GameObjects.Text;
    private message: string = '$> Wake up, Moose...\n\n$> The Matrix has you...\n\n$> Not everything is what it seems...\n\n$> Follow the white rabbit...\n\n|';
    private currentIndex: number = 0;
    private typingFinished: boolean = false;
    
    constructor() {
        super({ key: 'IntroScene' });
    }

    create(): void {
        this.typewriterText = this.add.text(30, 30, '', { font: '18px monospace', color: '#0f0' });

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
        this.scene.start('GameScene1');
    }
}
