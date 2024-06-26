import Phaser from 'phaser';
import BootScene from './scenes/BootScene';
import MainMenuScene from './scenes/MainMenuScene';
import GameScene1 from './scenes/GameScene1';
import GameScene2 from './scenes/GameScene2';
import GameScene3 from './scenes/GameScene3';
import CreditsScene from './scenes/CreditsScene';
import GameOverScene from './scenes/GameOverScene';
import IntroScene from './scenes/IntroScene';

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    scene: [
        BootScene,
        IntroScene,
        MainMenuScene,
        GameScene1,
        GameScene2,
        GameScene3,
        GameOverScene,
        CreditsScene
    ],
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH  // Center the game canvas
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 600 },
            debug: false
        }
    }
};

const game = new Phaser.Game(config);

// Event listener to handle window resizing
window.addEventListener('resize', () => {
    game.scale.resize(window.innerWidth, window.innerHeight);
    game.scale.setGameSize(window.innerWidth, window.innerHeight);
});
