
export function setupAnimations(scene: any) {
    const generateAnimationProps = (
        key: string,
        texture: string,
        prefix: string,
        start: number,
        end: number,
        frameRate: number,
        repeat: number,
        zeroPad: number = 0
    ) => {
        return {
            key,
            frames: scene.anims.generateFrameNames(texture, { prefix, start, end, zeroPad }),
            frameRate,
            repeat
        };
    };
    const generateSingleFrameProps = (
        key: string,
        texture: string,
        frameName: string,
        frameRate: number = 1,
        repeat: number = 0
    ) => {
        return {
            key,
            frames: [{ key: texture, frame: frameName }],
            frameRate,
            repeat
        };
    };    

    // Define animations
    const animations = [
        // UI
        generateAnimationProps('coinAnimation', 'coin', 'coin', 1, 8, 15, -1, 2),
        generateAnimationProps('logoAnimation', 'logo', 'logo_', 1, 29, 15, -1, 4),
        generateAnimationProps('cloud', 'cloud', 'cloud', 1, 4, 7, -1, 4),
        generateAnimationProps('chat_bubble', 'chat_bubble', 'chat', 0, 3, 7, 0, 2),
        generateAnimationProps('chat_bubble_reverse', 'chat_bubble', 'chat', 3, 0, 7, 0, 2),
        // Effects
        generateAnimationProps('projectile-1', 'projectile-1', 'shot-', 0, 12, 30, -1),
        generateAnimationProps('hitSprite1', 'hitSprite1', 'hits-1-', 1, 5, 10, 0),
        // Player 1
        generateAnimationProps('standingP1', 'player', 'standing', 1, 11, 3, -1, 4),
        generateAnimationProps('walkingP1', 'player', 'walk', 1, 7, 10, -1, 4),
        generateAnimationProps('runningP1', 'player', 'run', 1, 8, 10, -1, 4),
        generateAnimationProps('jumpingP1', 'player', 'jump', 1, 8, 7, 0, 4),
        generateAnimationProps('crouchingP1', 'player', 'jump', 2, 2, 7, 0, 4),
        generateAnimationProps('meleeP1', 'player', 'melee', 1, 13, 10, 0, 4),
        generateAnimationProps('dyingP1', 'player', 'death', 1, 4, 4, 0, 4),
        generateAnimationProps('hurtP1', 'player', 'death', 1, 1, 1, 0, 4),
        // Player 2
        generateAnimationProps('walkingP2', 'player2', 'walk', 1, 8, 10, -1, 4),
        generateAnimationProps('runningP2', 'player2', 'run', 1, 8, 10, -1, 4),
        generateAnimationProps('jumpingP2', 'player2', 'jump', 1, 7, 7, 0, 4),
        generateAnimationProps('shootP2', 'player2', 'shoot', 1, 12, 10, 0, 4),
        generateAnimationProps('meleeP2', 'player2', 'melee', 1, 11, 10, 0, 4),
        generateAnimationProps('crouchingP2', 'player2', 'jump', 1, 1, 4, 0, 4),
        generateAnimationProps('standingP2', 'player2', 'standing', 1, 12, 4, -1, 4),
        generateAnimationProps('dyingP2', 'player2', 'death', 1, 4, 1, 0, 4),
        generateAnimationProps('hurtP2', 'player2', 'death', 1, 1, 1, 0, 4),
        // Player 3
        generateAnimationProps('standingP3', 'player3', 'standing', 0, 22, 2.5, -1, 4),
        generateAnimationProps('walkingP3', 'player3', 'walk', 0, 6, 10, -1, 4),
        generateAnimationProps('runningP3', 'player3', 'run', 0, 7, 10, -1, 4),
        generateAnimationProps('jumpingP3', 'player3', 'jump', 0, 6, 7, 0, 4),
        generateAnimationProps('meleeP3', 'player3', 'melee', 0, 3, 10, 0, 4),
        generateAnimationProps('runShootP3', 'player3', 'runShoot', 0, 3, 10, 0, 4),
        generateAnimationProps('shootP3', 'player3', 'shoot', 0, 3, 30, 0, 4),
        generateAnimationProps('dyingP3', 'player3', 'death', 0, 4, 4, 0, 4),
        generateAnimationProps('hurtP3', 'player3', 'run', 0, 0, 1, 0, 4),
        generateAnimationProps('crouchingP3', 'player3', 'jump', 0, 0, 4, 0, 4),
        // NPC 1
        generateAnimationProps('walkingNPC1', 'npc', 'walk-', 1, 16, 10, -1),
        generateAnimationProps('runningNPC1', 'npc', 'run-', 1, 8, 10, -1),
        generateAnimationProps('jumpingNPC1', 'npc', 'jump-', 1, 4, 7, 0),
        generateAnimationProps('shootNPC1', 'npc', 'shoot-', 1, 1, 10, 0),
        generateAnimationProps('standingNPC1', 'npc', 'idle-', 1, 4, 6, -1),
        generateAnimationProps('runShootNPC1', 'npc', 'run-shoot-', 1, 8, 10, -1),
        generateAnimationProps('backJumpNPC1', 'npc', 'back-jump-', 1, 7, 7, 0),
        generateAnimationProps('climbNPC1', 'npc', 'climb-', 1, 6, 7, -1),
        generateAnimationProps('hurtNPC1', 'npc', 'hurt-', 1, 1, 1, 0),
        generateAnimationProps('dyingNPC1', 'npc', 'jump-', 3, 3, 1, 0),
        generateAnimationProps('crouchingNPC1', 'npc', 'crouch-', 1, 1, 1, 0),
        // Enemy AI
        generateAnimationProps('walkingEAI', 'enemyAI', 'walk', 1, 8, 10, -1, 4),
        generateAnimationProps('runningEAI', 'enemyAI', 'run', 1, 8, 10, -1, 4),
        generateAnimationProps('jumpingEAI', 'enemyAI', 'jump', 1, 7, 7, 0, 4),
        generateAnimationProps('shootEAI', 'enemyAI', 'shoot', 1, 12, 10, 0, 4),
        generateAnimationProps('meleeEAI', 'enemyAI', 'melee', 1, 11, 10, 0, 4),
        generateAnimationProps('standingEAI', 'enemyAI', 'standing', 1, 12, 4, -1, 4),
        generateAnimationProps('dyingEAI', 'enemyAI', 'death', 1, 4, 1, 0, 4),
        generateAnimationProps('hurtEAI', 'enemyAI', 'death', 1, 1, 1, 0, 4),
        generateAnimationProps('spin', 'drone', 'spin', 1, 4, 10, -1, 2),
        generateAnimationProps('explode', 'drone', 'explode', 1, 4, 10, 0, 2),
        // Misc. Props (Objects, Environment, etc.)
        generateSingleFrameProps('floor-tileset', 'props', 'floor-tileset'),
        generateSingleFrameProps('antenna', 'props', 'antenna'),
        generateSingleFrameProps('hanging-monitors', 'props', 'hanging-monitors'),
        generateSingleFrameProps('terminal-1', 'props', 'terminal-1'),
        generateSingleFrameProps('terminal-2', 'props', 'terminal-2'),
        generateSingleFrameProps('container', 'props', 'container'),
        generateSingleFrameProps('container-gray', 'props', 'container-gray'),
        generateSingleFrameProps('container-yellow', 'props', 'container-yellow'),
        generateSingleFrameProps('container-small-gray', 'props', 'container-small-gray'),
        generateSingleFrameProps('container-small-yellow', 'props', 'container-small-yellow'),
        generateSingleFrameProps('box-1', 'props', 'box-1'),
        generateSingleFrameProps('box-2', 'props', 'box-2'),
        generateSingleFrameProps('box-3', 'props', 'box-3'),
        generateSingleFrameProps('chest-opened', 'props', 'chest-opened'),
        generateSingleFrameProps('chest-closed', 'props', 'chest-closed'),
        generateSingleFrameProps('banners', 'props', 'banners'),
        generateSingleFrameProps('banner-open', 'props', 'banner-open'),
        generateSingleFrameProps('banner-floor', 'props', 'banner-floor'),
        generateSingleFrameProps('banner-arrow', 'props', 'banner-arrow'),
        generateSingleFrameProps('pod', 'props', 'pod'),
        generateSingleFrameProps('hotel-sign', 'props', 'hotel-sign'),
        generateAnimationProps('banner-scroll', 'props', 'banner-scroll-', 1, 4, 1, 0),
        generateAnimationProps('banner-side', 'props', 'banner-side-', 1, 4, 1, 0),
        generateAnimationProps('banner-neon', 'props', 'banner-neon-', 1, 4, 1, 0),
        generateAnimationProps('banner-coke', 'props', 'banner-coke-', 1, 3, 1, 0),
        generateAnimationProps('banner-sushi', 'props', 'banner-sushi-', 1, 3, 1, 0),
        generateAnimationProps('banner-big', 'props', 'banner-big-', 1, 4, 1, 0),
        generateAnimationProps('monitor-face', 'props', 'monitor-face-', 1, 4, 1, 0),
        generateAnimationProps('ball', 'props', 'ball-', 1, 4, 2, 0),
        generateAnimationProps('small-ball', 'props', 'small-ball-', 1, 2, 2, 0),
    ];

    // Create animations
    animations.forEach(animation => {
        if (!scene.anims.exists(animation.key)) {
            scene.anims.create(animation);
        }
    });
}
