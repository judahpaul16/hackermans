import Phaser from 'phaser';
import mainMenuBG from '../../assets/videos/mainMenuBG.mp4';
import platformImg from '../../assets/sprites/platforms/rock.png';
import streetImg from '../../assets/sprites/platforms/street.png';
import playerImg from '../../assets/sprites/players/player_1/player.png';
import playerJSON from '../../assets/sprites/players/player_1/player.json';
import player2Img from '../../assets/sprites/players/player_2/player.png';
import player2JSON from '../../assets/sprites/players/player_2/player.json';
import cloudImg from '../../assets/sprites/entities/cloud/cloud.png';
import cloudJSON from '../../assets/sprites/entities/cloud/cloud.json';
import chatBubbleImg from '../../assets/sprites/entities/chat_bubble/chat_bubble.png';
import chatBubbleJSON from '../../assets/sprites/entities/chat_bubble/chat_bubble.json';
import farBuildings from '../../assets/sprites/backgrounds/far-buildings.png';
import backBuildings from '../../assets/sprites/backgrounds/back-buildings.png';
import middle from '../../assets/sprites/backgrounds/middle.png';
import foreground from '../../assets/sprites/backgrounds/foreground.png';
import foreground2 from '../../assets/sprites/backgrounds/foreground-2.png';
import foregroundEmpty from '../../assets/sprites/backgrounds/foreground-empty.png';
import cyberpunkStreet from '../../assets/sprites/backgrounds/cyberpunk-street.png';
import mainMusicSrc from '../../assets/audio/music/mainMusic.mp3';
import flashingBlueLight from '../../assets/sprites/entities/lights/flashing-blue-light.png';
import flashingBlueLightJSON from '../../assets/sprites/entities/lights/flashing-blue-light.json';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // Load assets using the imported asset paths
        this.load.video('mainMenuBG', mainMenuBG);
        this.load.image('platform', platformImg);
        this.load.image('street', streetImg);
        this.load.atlas('cloud', cloudImg, cloudJSON);
        this.load.atlas('player', playerImg, playerJSON);
        this.load.atlas('guideNPC', player2Img, player2JSON);
        this.load.atlas('chat_bubble', chatBubbleImg, chatBubbleJSON);
        this.load.image('far-buildings', farBuildings);
        this.load.image('back-buildings', backBuildings);
        this.load.image('middle', middle);
        this.load.image('foreground', foreground);
        this.load.image('foreground-2', foreground2);
        this.load.image('foreground-empty', foregroundEmpty);
        this.load.image('cyberpunk-street', cyberpunkStreet);
        this.load.audio('mainMusic', mainMusicSrc);
        this.load.atlas('flashing-blue-light', flashingBlueLight, flashingBlueLightJSON);
    }

    create() {
        // Initialization or configuration after assets are loaded.

        // Start the next scene
        this.scene.start('MainMenuScene');
    }
}
