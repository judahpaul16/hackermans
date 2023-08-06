import Phaser from 'phaser';
import BootScene from './scenes/BootScene';
import MainMenuScene from './scenes/MainMenuScene';
import GameScene1 from './scenes/GameScene1';
import GameScene2 from './scenes/GameScene2';

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    scene: [BootScene, MainMenuScene, GameScene1, GameScene2],
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH  // Center the game canvas
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false // set to true if you want to see the physics debug info
        }
    }
};

const game = new Phaser.Game(config);

// Event listener to handle window resizing
window.addEventListener('resize', () => {
    game.scale.resize(window.innerWidth, window.innerHeight);
    game.scale.setGameSize(window.innerWidth, window.innerHeight);
});
