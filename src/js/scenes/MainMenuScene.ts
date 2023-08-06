import Phaser from 'phaser';

export default class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenuScene' });
    }

    create() {
        this.add.text(window.innerWidth / 2, 300, 'Main Menu', { fontSize: '32px', color: '#fff' }).setOrigin(0.5);
        this.add.text(window.innerWidth / 2, 350, 'Press any key to start...', { fontSize: '20px', color: '#fff' }).setOrigin(0.5);

        this.input.on('pointerdown', () => {
            this.scene.start('GameScene');
        });
        this.input.keyboard!.on('keydown', () => {
            this.scene.start('GameScene');
        });
    }
}
