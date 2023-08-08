import Phaser from 'phaser';

export default class GameOverScene extends Phaser.Scene {
private replayText!: Phaser.GameObjects.Text;
  constructor() {
    super({ key: 'GameOverScene' });
  }

  create() {
    const gameOverText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, 'GAME OVER', {
      font: '40px',
      color: '#ff0000',
      align: 'center'
    });
    gameOverText.setOrigin(0.5, 0.5).setAlpha(0); // Center the text

    this.tweens.add({
      targets: gameOverText,
      alpha: 1,
      duration: 1000,
      ease: 'Sine.easeIn',
      repeat: 0
    });

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
      this.scene.start('BootScene'); // Transition to BootScene on key press
    });

    this.input.on('pointerdown', () => {
      this.scene.start('BootScene'); // Transition to BootScene on click
    });
  }
}
