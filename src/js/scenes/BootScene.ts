import Phaser from 'phaser';

// UI Assets
import logoImg from '../../assets/sprites/ui/logo.png';
import logoJSON from '../../assets/sprites/ui/logo.json';
import coinImg from '../../assets/sprites/ui/coin.png';
import coinJSON from '../../assets/sprites/ui/coin.json';
import controlsImg from '../../assets/sprites/ui/controls.png';
import avatarImg from '../../assets/sprites/ui/avatar.png';
import p2AvatarImg from '../../assets/sprites/ui/player_2_avatar.png';
import p3AvatarImg from '../../assets/sprites/ui/player_3_avatar.png';
import npcAvatarImg from '../../assets/sprites/ui/npc_avatar.png';
import enemyAIAvatarImg from '../../assets/sprites/ui/enemyai_avatar.png';
import healthBarFrameImg from '../../assets/sprites/ui/health_bar_bg.png';
import healthBarFrame2Img from '../../assets/sprites/ui/health_bar_bg_2.png';
import healthBarFrame3Img from '../../assets/sprites/ui/health_bar_bg_3.png';
import healthBarFrameNPCImg from '../../assets/sprites/ui/health_bar_bg_npc.png';
import healthBarFrameEnemyImg from '../../assets/sprites/ui/health_bar_bg_enemy.png';
import playerIndicatorImg from '../../assets/sprites/ui/player_indicator.png';
import attackHintImg from '../../assets/sprites/ui/attack_hint.png';

// Platforms
import platformImg from '../../assets/sprites/platforms/rock.png';
import streetImg from '../../assets/sprites/platforms/street.png';
import street2Img from '../../assets/sprites/platforms/street-2.png';

// Characters
import playerImg from '../../assets/sprites/characters/players/player_1/player.png';
import playerJSON from '../../assets/sprites/characters/players/player_1/player.json';
import player2Img from '../../assets/sprites/characters/players/player_2/player.png';
import player2JSON from '../../assets/sprites/characters/players/player_2/player.json';
import player3Img from '../../assets/sprites/characters/players/player_3/player.png';
import player3JSON from '../../assets/sprites/characters/players/player_3/player.json';
import npcImg from '../../assets/sprites/characters/npcs/npc_1/npc.png';
import npcJSON from '../../assets/sprites/characters/npcs/npc_1/npc.json';
import enemyAIImg from '../../assets/sprites/characters/enemies/enemy_ai/enemy.png';
import enemyAIJSON from '../../assets/sprites/characters/enemies/enemy_ai/enemy.json';

// Entities
import droneImg from '../../assets/sprites/entities/drone/drone.png';
import droneJSON from '../../assets/sprites/entities/drone/drone.json';
import cloudImg from '../../assets/sprites/entities/cloud/cloud.png';
import cloudJSON from '../../assets/sprites/entities/cloud/cloud.json';
import chatBubbleImg from '../../assets/sprites/entities/chat_bubble/chat_bubble.png';
import chatBubbleJSON from '../../assets/sprites/entities/chat_bubble/chat_bubble.json';
import props from '../../assets/sprites/entities/props/props.png';
import propsJSON from '../../assets/sprites/entities/props/props.json';

// Effects
import projectile1Img from '../../assets/sprites/effects/projectiles/1/projectile-1.png';
import projectile1JSON from '../../assets/sprites/effects/projectiles/1/projectile-1.json';
import hitSprite1Img from '../../assets/sprites/effects/hits/hits-1/hits-1.png';
import hitSprite1JSON from '../../assets/sprites/effects/hits/hits-1/hits-1.json';

// Backgrounds
import mainMenuBG from '../../assets/videos/mainMenuBG.mp4';
import underground from '../../assets/sprites/backgrounds/underground.png';
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

// Audio assets
import mainMusicSrc from '../../assets/audio/music/main.mp3';
import anonymouseDialogue1 from '../../assets/audio/dialogue/anonymouse_1.mp3';
import anonymuskDialogue1 from '../../assets/audio/dialogue/anonymusk_1.mp3';
import anonymissDialogue1 from '../../assets/audio/dialogue/anonymiss_1.mp3';
import coinSound from '../../assets/audio/sfx/coin.mp3';
import meleeSoundP1 from '../../assets/audio/sfx/p1_melee.mp3';
import shootSoundP2 from '../../assets/audio/sfx/p2_shoot.mp3';
import shootSoundP3 from '../../assets/audio/sfx/p3_shoot.mp3';
import shotgunPumpSound from '../../assets/audio/sfx/shotgun_pump.mp3';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // UI assets
        this.load.atlas('logo', logoImg, logoJSON);
        this.load.atlas('coin', coinImg, coinJSON);
        this.load.video('mainMenuBG', mainMenuBG);
        this.load.image('controls', controlsImg);
        this.load.image('avatar', avatarImg);
        this.load.image('avatarP2', p2AvatarImg);
        this.load.image('avatarP3', p3AvatarImg);
        this.load.image('avatarNPC1', npcAvatarImg);
        this.load.image('avatarEAI', enemyAIAvatarImg);
        this.load.image('health-bar-frame', healthBarFrameImg);
        this.load.image('health-bar-frame-2', healthBarFrame2Img);
        this.load.image('health-bar-frame-3', healthBarFrame3Img);
        this.load.image('health-bar-frame-npc', healthBarFrameNPCImg);
        this.load.image('health-bar-frame-enemy', healthBarFrameEnemyImg);
        this.load.image('player-indicator', playerIndicatorImg);
        this.load.image('attack-hint', attackHintImg);

        // Platforms
        this.load.image('platform', platformImg);
        this.load.image('street', streetImg);
        this.load.image('street-2', street2Img);

        // Characters & NPCs
        this.load.atlas('player', playerImg, playerJSON);
        this.load.atlas('player2', player2Img, player2JSON);
        this.load.atlas('player3', player3Img, player3JSON);
        this.load.atlas('npc', npcImg, npcJSON);
        this.load.atlas('enemyAI', enemyAIImg, enemyAIJSON);

        // Entities
        this.load.atlas('drone', droneImg, droneJSON);
        this.load.atlas('cloud', cloudImg, cloudJSON);
        this.load.atlas('chat_bubble', chatBubbleImg, chatBubbleJSON);
        this.load.atlas('props', props, propsJSON);

        // Effects
        this.load.atlas('projectile-1', projectile1Img, projectile1JSON);
        this.load.atlas('hitSprite1', hitSprite1Img, hitSprite1JSON);

        // Backgrounds
        this.load.image('underground', underground);
        this.load.image('far-buildings', farBuildings);
        this.load.image('back-buildings', backBuildings);
        this.load.image('middle', middle);
        this.load.image('foreground', foreground);
        this.load.image('foreground-2', foreground2);
        this.load.image('foreground-empty', foregroundEmpty);
        this.load.image('buildings-bg', buildingsBG);
        this.load.image('near-buildings', nearBuildings);
        this.load.image('skyline-a', skyLineA);
        this.load.image('skyline-b', skyLineB);
        this.load.image('industrial-bg', industrialBG);
        this.load.image('industrial-buildings', industrialBuildings);
        this.load.image('industrial-foreground', industrialForeground);
        this.load.image('industrial-far-buildings', industrialFarBuildings);

        // Audio
        this.load.audio('mainMusic', mainMusicSrc);
        this.load.audio('anonymouseDialogue1', anonymouseDialogue1);
        this.load.audio('anonymuskDialogue1', anonymuskDialogue1);
        this.load.audio('anonymissDialogue1', anonymissDialogue1);
        this.load.audio('coinSound', coinSound);
        this.load.audio('meleeP1', meleeSoundP1);
        this.load.audio('shootP2', shootSoundP2);
        this.load.audio('shootP3', shootSoundP3);
        this.load.audio('shotgunPumpSound', shotgunPumpSound);
        this.load.audio('shootEAI', shootSoundP2);
    }

    create() {
        // Initialization after assets are loaded
        this.scene.start('MainMenuScene');
    }
}
