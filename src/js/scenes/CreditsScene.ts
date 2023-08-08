import Phaser from 'phaser';

export default class CreditsScene extends Phaser.Scene {
  private creditsText!: Phaser.GameObjects.Text;
  private replayText!: Phaser.GameObjects.Text;
  private speed: number = 1;

  constructor() {
    super({ key: 'CreditsScene' });
  }

  create() {
    this.creditsText = this.add.text(
        this.cameras.main.width / 2, this.cameras.main.height, '',
        { font: '18px Arial', color: '#fff', align: 'center'}
    );
    this.creditsText.setOrigin(0.5); // Center the text horizontally
    this.creditsText.setText([
      'Developer - Judah Paul (https://github.com/judahpaul16)',
      'Game Assets - Asimuz (https://ansimuz.itch.io/)',
      'Music - Dummy Artist',
      'Special Thanks - John Doe, Jane Doe',
      // ... more thanks
    ]).setLineSpacing(20); // Add space between lines

    this.replayText = this.add.text(10, 10, "Press any key to play again", {
      fontSize: 18,
      color: '#ffffff',
    });

    // Add a blinking effect to the replay text
    this.tweens.add({
      targets: this.replayText,
      alpha: 0,
      duration: 1000,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    });

    this.input.keyboard!.on('keydown', () => {
      this.scene.start('BootScene');
    });
    
    this.input.on('pointerdown', () => {
      this.scene.start('BootScene');
    });
  }

  update() {
    this.creditsText.y -= this.speed;

    // When the text is out of view, transition to another scene or restart the credits
    if (this.creditsText.y + this.creditsText.height < 0) {
      this.creditsText.y = this.cameras.main.height; // to restart credits
    }
  }
}
