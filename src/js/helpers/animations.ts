
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

    // Define animations
    const animations = [
        generateAnimationProps('coinAnimation', 'coin', 'coin', 1, 8, 15, -1, 2),
        generateAnimationProps('logoAnimation', 'logo', 'logo_', 1, 29, 15, -1, 4),
        generateAnimationProps('cloud', 'cloud', 'cloud', 1, 4, 7, -1, 4),
        generateAnimationProps('chat_bubble', 'chat_bubble', 'chat', 0, 3, 7, 0, 2),
        generateAnimationProps('chat_bubble_reverse', 'chat_bubble', 'chat', 3, 0, 7, 0, 2),
        generateAnimationProps('standingP1', 'player', 'standing', 1, 11, 3, -1, 4),
        generateAnimationProps('walkingP1', 'player', 'walk', 1, 7, 10, -1, 4),
        generateAnimationProps('runningP1', 'player', 'run', 1, 8, 10, -1, 4),
        generateAnimationProps('jumpingP1', 'player', 'jump', 1, 8, 7, 0, 4),
        generateAnimationProps('crouchingP1', 'player', 'jump', 2, 2, 7, 0, 4),
        generateAnimationProps('meleeP1', 'player', 'melee', 1, 13, 10, 0, 4),
        generateAnimationProps('dyingP1', 'player', 'death', 1, 4, 4, 0, 4),
        generateAnimationProps('hurtP1', 'player', 'death', 1, 1, 1, 0, 4),
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
        generateAnimationProps('projectile-1', 'projectile-1', 'shot-', 0, 12, 30, -1),
        generateAnimationProps('hitSprite1', 'hitSprite1', 'hits-1-', 1, 5, 10, 0),
        generateAnimationProps('walkingP2', 'player2', 'walk', 1, 8, 10, -1, 4),
        generateAnimationProps('runningP2', 'player2', 'run', 1, 8, 10, -1, 4),
        generateAnimationProps('jumpingP2', 'player2', 'jump', 1, 7, 7, 0, 4),
        generateAnimationProps('shootP2', 'player2', 'shoot', 1, 12, 10, 0, 4),
        generateAnimationProps('meleeP2', 'player2', 'melee', 1, 11, 10, 0, 4),
        generateAnimationProps('crouchingP2', 'player2', 'jump', 1, 1, 4, 0, 4),
        generateAnimationProps('standingP2', 'player2', 'standing', 1, 12, 4, -1, 4),
        generateAnimationProps('dyingP2', 'player2', 'death', 1, 4, 1, 0, 4),
        generateAnimationProps('hurtP2', 'player2', 'death', 1, 1, 1, 0, 4),
        generateAnimationProps('walkingE1', 'enemy', 'walk', 1, 8, 10, -1, 4),
        generateAnimationProps('runningE1', 'enemy', 'run', 1, 8, 10, -1, 4),
        generateAnimationProps('jumpingE1', 'enemy', 'jump', 1, 7, 7, 0, 4),
        generateAnimationProps('shootE1', 'enemy', 'shoot', 1, 12, 10, 0, 4),
        generateAnimationProps('meleeE1', 'enemy', 'melee', 1, 11, 10, 0, 4),
        generateAnimationProps('standingE1', 'enemy', 'standing', 1, 12, 4, -1, 4),
        generateAnimationProps('dyingE1', 'enemy', 'death', 1, 4, 1, 0, 4),
        generateAnimationProps('hurtE1', 'enemy', 'death', 1, 1, 1, 0, 4),
        generateAnimationProps('spin', 'drone', 'spin', 1, 4, 10, -1, 2),
        generateAnimationProps('explode', 'drone', 'explode', 1, 4, 10, 0, 2)
    ];

    // Create animations
    animations.forEach(animation => {
        if (!scene.anims.exists(animation.key)) {
            scene.anims.create(animation);
        }
    });
}
