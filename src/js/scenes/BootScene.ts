import Phaser from 'phaser';

import logoImg from '../../assets/sprites/ui/logo.png';
import logoJSON from '../../assets/sprites/ui/logo.json';

import coinImg from '../../assets/sprites/ui/coin.png';
import coinJSON from '../../assets/sprites/ui/coin.json';

import mainMenuBG from '../../assets/videos/mainMenuBG.mp4';

import platformImg from '../../assets/sprites/platforms/rock.png';
import streetImg from '../../assets/sprites/platforms/street.png';
import street2Img from '../../assets/sprites/platforms/street-2.png';

import playerImg from '../../assets/sprites/players/player_1/player.png';
import playerJSON from '../../assets/sprites/players/player_1/player.json';
import player2Img from '../../assets/sprites/players/player_2/player.png';
import player2JSON from '../../assets/sprites/players/player_2/player.json';

import controlsImg from '../../assets/sprites/ui/controls.png';

import avatarImg from '../../assets/sprites/ui/avatar.png';
import p2AvatarImg from '../../assets/sprites/ui/player_2_avatar.png';
import healthBarFrameImg from '../../assets/sprites/ui/health_bar_bg.png';
import healthBarFrameAltImg from '../../assets/sprites/ui/health_bar_bg_alt.png';
import healthBarFrameEnemyImg from '../../assets/sprites/ui/health_bar_bg_enemy.png';


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

import buildingsBG from '../../assets/sprites/backgrounds/buildings-bg.png';
import nearBuildings from '../../assets/sprites/backgrounds/near-buildings-bg.png';
import skyLineA from '../../assets/sprites/backgrounds/skyline-a.png';
import skyLineB from '../../assets/sprites/backgrounds/skyline-b.png';

import industrialBG from '../../assets/sprites/backgrounds/industrial-bg.png';
import industrialBuildings from '../../assets/sprites/backgrounds/industrial-buildings.png';
import industrialForeground from '../../assets/sprites/backgrounds/industrial-foreground.png';
import industrialFarBuildings from '../../assets/sprites/backgrounds/industrial-far-buildings.png';

import mainMusicSrc from '../../assets/audio/music/main.mp3';

import p2Dialogue1 from '../../assets/audio/dialogue/player2_1.mp3';

import meleeSoundP1 from '../../assets/audio/sfx/p1_melee.mp3';
import shootSoundP2 from '../../assets/audio/sfx/p2_shoot.mp3';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // Load assets using the imported asset paths
        this.load.atlas('logo', logoImg, logoJSON);
        this.load.atlas('coin', coinImg, coinJSON);
        this.load.video('mainMenuBG', mainMenuBG);
        this.load.image('platform', platformImg);
        this.load.image('street', streetImg);
        this.load.image('street-2', street2Img);
        this.load.atlas('cloud', cloudImg, cloudJSON);
        this.load.atlas('player', playerImg, playerJSON);
        this.load.image('controls', controlsImg);
        this.load.image('avatar', avatarImg);
        this.load.image('p2Avatar', p2AvatarImg);
        this.load.image('health-bar-frame', healthBarFrameImg);
        this.load.image('health-bar-frame-alt', healthBarFrameAltImg);
        this.load.image('health-bar-frame-enemy', healthBarFrameEnemyImg);
        this.load.atlas('player2', player2Img, player2JSON);
        this.load.atlas('chat_bubble', chatBubbleImg, chatBubbleJSON);
        this.load.audio('mainMusic', mainMusicSrc);
        this.load.audio('p2Dialogue1', p2Dialogue1);
        this.load.audio('meleeP1', meleeSoundP1);
        this.load.audio('shootP2', shootSoundP2);
        this.load.image('far-buildings', farBuildings);
        this.load.image('back-buildings', backBuildings);
        this.load.image('middle', middle);
        this.load.image('foreground', foreground);
        this.load.image('foreground-2', foreground2);
        this.load.image('foreground-empty', foregroundEmpty);
        this.load.image('industrial-bg', industrialBG);
        this.load.image('industrial-buildings', industrialBuildings);
        this.load.image('industrial-foreground', industrialForeground);
        this.load.image('industrial-far-buildings', industrialFarBuildings);
        this.load.image('buildings-bg', buildingsBG);
        this.load.image('near-buildings', nearBuildings);
        this.load.image('skyline-a', skyLineA);
        this.load.image('skyline-b', skyLineB);
    }

    create() {
        // Initialization or configuration after assets are loaded.

        // Start the next scene
        this.scene.start('MainMenuScene');
    }
}
