import Phaser from 'phaser';
import Player from '../classes/characters/Player';
import Player2 from '../classes/characters/Player3';
import Player3 from '../classes/characters/Player2';
import NPC from '../classes/characters/NPC';
import Enemy from '../classes/characters/Enemy';
import * as dat from 'dat.gui';

export function createBackground(scene: any, key: string, width: number, height: number): Phaser.GameObjects.TileSprite {
    const imageHeight = scene.textures.get(key).getSourceImage().height;
    const ratio = height / imageHeight;
    const sprite = scene.add.tileSprite(0, scene.physics.world.bounds.height - height, width, height, key)
        .setOrigin(0)
        .setTileScale(ratio, ratio);
    return sprite;
}

export function addPlatform(scene: any, x: number, y: number, width: number, type: string) {
    for (let i = 0; i < width; i++) {
        scene.platforms!.create(x + i * 64, y, type);
    }
}

export function initializeDebugGUI(scene: any) {
    const dg = new dat.GUI();
    dg.domElement.style.display = 'none';
    scene.registry.set('debugGUI', dg);
    scene.dg = dg;

    // Add toggle for physics arcade debug to display sprite bounds
    const debugGraphic = scene.physics.world.createDebugGraphic();
    debugGraphic.setVisible(false);
    scene.dg.add(debugGraphic, 'visible').name('Show Bounds').listen();
    if (scene.dg) {
        const cameraFolder = scene.dg?.addFolder('Camera');
        if (cameraFolder) {
            // cameraFolder?.add(scene.cameras.main, 'scrollX', 0, 10000);
            // cameraFolder?.add(scene.cameras.main, 'scrollY', 0, 10000);
            cameraFolder?.add(scene.cameras.main, 'zoom', 0.5, 5);
        }

        const worldFolder = scene.dg.addFolder('World');
        worldFolder.add(scene.physics.world.gravity, 'y', -1000, 1000, 1).name('Gravity').listen();
        const scaleFolder = worldFolder.addFolder('Background Scale');
        scaleFolder.add(scene, 'width', 0, 10000).onChange((value: number) => {
            updateWorldBounds(scene, value);
        });
        scaleFolder.add(scene, 'height', 0, 750).onChange((value: number) => {
            updateWorldBounds(scene, value);
        });
        scaleFolder.add(scene, 'sfactor1', 0, 2).onChange((value: number) => {
            updateWorldBounds(scene, value);
        });
        scaleFolder.add(scene, 'sfactor2', 0, 2).onChange((value: number) => {
            updateWorldBounds(scene, value);
        });
        scaleFolder.add(scene, 'sfactor3', 0, 2).onChange((value: number) => {
            updateWorldBounds(scene, value);
        });
        scaleFolder.add(scene, 'sfactor4', 0, 2).onChange((value: number) => {
            updateWorldBounds(scene, value);
        });
        
        // Add a debug folder for altering the player's hitbox
        const characterFolder = scene.dg.addFolder('Characters');
        const enemyFolder = characterFolder.addFolder('Enemies');
        const player1Folder = characterFolder.addFolder('Player 1');
        player1Folder.add(scene.player!, 'scale', 0.1, 2).name('Sprite Scale').listen();    
        player1Folder.add(scene.player!.body!, 'width', 0, 200).name('Hitbox Width').listen();
        player1Folder.add(scene.player!.body!, 'height', 0, 200).name('Hitbox Height').listen();
        player1Folder.add(scene.player!.body!.offset, 'x', -200, 200).name('Hitbox X Offset').listen();
        player1Folder.add(scene.player!.body!.offset, 'y', -200, 200).name('Hitbox Y Offset').listen();
        const player2Folder = characterFolder.addFolder('Player 2');
        player2Folder.add(scene.player2!, 'scale', 0.1, 2).name('Sprite Scale').listen();
        player2Folder.add(scene.player2!.body!, 'width', 0, 200).name('Hitbox Width').listen();
        player2Folder.add(scene.player2!.body!, 'height', 0, 200).name('Hitbox Height').listen();
        player2Folder.add(scene.player2!.body!.offset, 'x', -200, 200).name('Hitbox X Offset').listen();
        player2Folder.add(scene.player2!.body!.offset, 'y', -200, 200).name('Hitbox Y Offset').listen();
        const player3Folder = characterFolder.addFolder('Player 3');
        player3Folder.add(scene.player3!, 'scale', 0.1, 2).name('Sprite Scale').listen();
        player3Folder.add(scene.player3!.body!, 'width', 0, 200).name('Hitbox Width').listen();
        player3Folder.add(scene.player3!.body!, 'height', 0, 200).name('Hitbox Height').listen();
        player3Folder.add(scene.player3!.body!.offset, 'x', -200, 200).name('Hitbox X Offset').listen();
        player3Folder.add(scene.player3!.body!.offset, 'y', -200, 200).name('Hitbox Y Offset').listen();
        if (scene.enemies) {
            for (let i = 0; i < scene.enemies!.length; i++) {
                let enemy = scene.enemies![i];
                let enemyFolderN = enemyFolder.addFolder('Enemy ' + i);
                enemyFolderN.add(enemy, 'scale', 0.1, 2).name('Sprite Scale').listen();
                enemyFolderN.add(enemy.body!, 'width', 0, 200).name('Hitbox Width').listen();
                enemyFolderN.add(enemy.body!, 'height', 0, 200).name('Hitbox Height').listen();
                enemyFolderN.add(enemy.body!.offset, 'x', -200, 200).name('Hitbox X Offset').listen();
                enemyFolderN.add(enemy.body!.offset, 'y', -200, 200).name('Hitbox Y Offset').listen();
            }
        }
    }
}

export function updateWorldBounds(scene: any, value: number) {
    scene.backgroundImages!.farBuildings.destroy();
    scene.backgroundImages!.backBuildings.destroy();
    scene.backgroundImages!.middle.destroy();
    scene.backgroundImages!.foreground.destroy();
    scene.backgroundImages!.farBuildings = createBackground(scene, scene.backgroundKey4, scene.width, scene.height*scene.sfactor1);
    scene.backgroundImages!.backBuildings = createBackground(scene, scene.backgroundKey3, scene.width, scene.height*scene.sfactor2);
    scene.backgroundImages!.middle = createBackground(scene, scene.backgroundKey2, scene.width, scene.height*scene.sfactor3);
    scene.backgroundImages!.foreground = createBackground(scene, scene.backgroundKey1, scene.width, scene.height*scene.sfactor4);
    scene.backgroundImages!.farBuildings.setDepth(-1);
    scene.backgroundImages!.backBuildings.setDepth(-1);
    scene.backgroundImages!.middle.setDepth(-1);
    scene.backgroundImages!.foreground.setDepth(-1);
    scene.physics.world.setBounds(0, 0, scene.width, 800);
    scene.cameras.main.setBounds(0, 0, scene.width, 800);
}

export function createClouds(scene: any, numClouds: number) {
    type CloudPosition = { x: number; y: number };
    let previousPositions: CloudPosition[] = [];
    
    for (let i = 0; i < numClouds; i++) {
      let randomX: number;
      let randomY: number;
      let attempts = 0;
    
      // Repeat until we find coordinates not too close to previous ones
      do {
        randomX = Math.random() * scene.width;
        randomY = Math.random() * 200 + 15; // Restricting Y to 15 - 200
        attempts++;
      } while (
        attempts < 1000 &&
        previousPositions.some(
          pos => Math.sqrt(Math.pow(pos.x - randomX, 2) + Math.pow(pos.y - randomY, 2)) < 200
        )
      );
    
      if (attempts < 1000) {
        let cloud = scene.add.sprite(randomX, randomY, 'cloud');
        cloud.setScale(0.1);
        scene.clouds!.push(cloud);
        previousPositions.push({ x: randomX, y: randomY });
      }
    }
}

export function updateClouds(scene: any) {
    if (scene.clouds) {
        for (let cloud of scene.clouds!) {
            if (cloud.anims) {
                cloud.play('cloud', true);
                //if index is even, move right, else move left
                if (scene.clouds!.indexOf(cloud) % 2 === 0) {
                    cloud.x += 1;
                } else {
                    cloud.x -= 1;
                }
                //if cloud goes off screen, reset to other side
                if (cloud.x > scene.width + 100) {
                    cloud.x = -100;
                }
            }
        }
    }
}

export function createHealthBar(scene: Phaser.Scene, player: Player | Player2 | Player3 | NPC | Enemy) {
    // Determine type of character
    const isP2 = player instanceof Player2;
    const isP3 = player instanceof Player3;
    const isNPC = player instanceof NPC;
    const isEnemy = player instanceof Enemy;
    const avatarOffsetX = isNPC || isEnemy ? 255 : 0;
    const fillOffsetX = isNPC || isEnemy ? -15 : 0;

    // Adjust the x-position of the health bar for P3 & Enemy
    let xOffset = isP2 ? 340 : 0;
    if (isEnemy || isNPC) xOffset = 1140;

    // Adjust the y-position of the health bar for P2
    let yOffset = isP3 ? 100 : 0;

    // Adding the avatar image at the top left corner with xOffset
    let someAvatar = isP2 ? 'p2Avatar' : 'avatar';
    if (isP3) someAvatar = 'p3Avatar';
    if (isNPC) someAvatar = 'npcAvatar';
    if (isEnemy) someAvatar = 'enemyAvatar';
    player.avatar = scene.add.image(100 + xOffset + avatarOffsetX, 100 + yOffset, someAvatar);

    // Creating a circular mask using a Graphics object
    player.amask = scene.make.graphics({});
    player.amask.fillCircle(100 + xOffset + avatarOffsetX, 100 + yOffset, 30); // X, Y, radius with xOffset

    // Applying the mask to the avatar
    player.avatar.setMask(player.amask.createGeometryMask());
    player.amask.setScrollFactor(0);

    // Scale the avatar
    const avatarScale = 0.6;
    player.avatar.setScale(avatarScale);

    // Get the scaled height of the avatar
    const avatarHeight = player.avatar.height * avatarScale;

    // Background of the health bar (position it relative to avatar, with the possible offset for P2)
    let frameKey = 'health-bar-frame';
    if (isP2) {
        frameKey = 'health-bar-frame-alt';
    } else if (isP3) {
        frameKey = 'health-bar-frame-alt-2';
    } else if (isNPC) {
        frameKey = 'health-bar-frame-npc';
    } else if (isEnemy) {
        frameKey = 'health-bar-frame-enemy';
    }
    (isNPC || isEnemy) ?
        player.healthBarFrame = scene.add.image(player.avatar.x - avatarOffsetX, player.avatar.y - 35, frameKey).setOrigin(0)
    :
        player.healthBarFrame = scene.add.image(player.avatar.x - 36, player.avatar.y - 35, frameKey).setOrigin(0);
    
    // Scale the healthBarFrame to match the avatar's height
    const healthBarFrameScale = avatarHeight / player!.healthBarFrame.height;
    player!.healthBarFrame.setScale(healthBarFrameScale);

    // Foreground/fill of the health bar (same position as background)
    // Create a Graphics object
    player!.healthBarFill = scene.add.graphics({ fillStyle: { color: 0x00ff00 } });
    player!.healthBarFill.x += fillOffsetX;

    // Determine the width based on the current health percentage
    let fillWidth = (player!.currentHealth / player!.maxHealth) * 265;

    // Draw a rectangle representing the fill
    player!.healthBarFill.fillRect(player!.healthBarFrame.x + 20, player!.healthBarFrame.y + 20, fillWidth, 30);

    player!.healthBarFill = updateHealthBar(scene, player);
            
    // Set the depth of the avatar to ensure it's rendered in front of the frame
    player.avatar.setDepth(5);
    // Set the depth of the health bar to ensure it's rendered in behind the frame
    player!.healthBarFrame.setDepth(4);
    player!.healthBarFill.setDepth(3);

    // Add the player's name above the avatar
    let name = null;
    (isNPC || isEnemy) ?
        name = scene.add.text(player.avatar.x - 130, player.avatar.y - 33, player.name, { fontSize: 15, color: '#ffffff' })
    :
        name = scene.add.text(player.avatar.x + 36, player.avatar.y - 33, player.name, { fontSize: 15, color: '#ffffff' });

    // Check if the HUD elements are defined before creating the container
    if (player!.avatar && player!.healthBarFrame && player!.healthBarFill) {
        player!.hudContainer = scene.add.container(0, 0, [player!.healthBarFill, player!.avatar, player!.healthBarFrame, name]);
        player!.hudContainer.setDepth(2);        
    }
}

export function updateHealthBar(scene: Phaser.Scene, player: Player | Player2 | Player3 | NPC | Enemy) {
    // Update the HUD container's position to match the camera's scroll
    if (player!.hudContainer && scene.cameras.main)
        player!.hudContainer.setPosition(scene.cameras.main.scrollX, scene.cameras.main.scrollY);
    // Update the width of the health bar fill
    let fillWidth = (player!.currentHealth / player!.maxHealth) * 265;
    if (player!.healthBarFill) {
        player!.healthBarFill.clear();
        player!.healthBarFill.fillRect(player!.healthBarFrame.x + 20, player!.healthBarFrame.y + 20, fillWidth, 30);
    }
    return player!.healthBarFill;
}

export function destroyHealthBar(player: Player | Player2 | Player3 | NPC | Enemy) {
    if (player.avatar && player.amask && player.healthBarFrame && player.healthBarFill && player.hudContainer) {
        player.avatar.destroy();
        player.amask.destroy();
        player.healthBarFrame.destroy();
        player.healthBarFill.destroy();
        player.hudContainer.destroy();
    }
}

export function handleInteract(scene: any, player: Player, player2: Player2, interactKey: Phaser.Input.Keyboard.Key) {
    if (scene.isInteracting) return; // Exit if interaction is already in progress

    if (Phaser.Input.Keyboard.JustDown(interactKey)) {
        scene.isInteracting = true; // Set the lock
        
        scene.sound.stopByKey('p3Dialogue1');
        scene.sound.play('p3Dialogue1', { volume: 1 });

        if (scene.chatBubble && scene.chatBubble.anims && scene.chatBubble.anims.isPlaying) {
            if (scene.timerEvent) {
                scene.timerEvent.remove(false);
                scene.timerEvent = null;
            }
            scene.chatBubble.anims.play('chat_bubble_reverse', true);
            scene.time.delayedCall(500, () => {
                scene.dialogueText.destroy();
                scene.chatBubble.destroy();
            });
            return;
        }

        if (scene.chatBubble) {
            scene.dialogueText.destroy();
            scene.chatBubble.destroy();
        }

        const newChatBubble = scene.add.sprite(scene.player2!.x - 123, scene.player2!.y - 130, 'chat_bubble').setScale(0.34);
        newChatBubble.flipX = true;
        newChatBubble.play('chat_bubble', true);

        const dialogue = "Things haven't been the same since the 7/11 attacks.\nBut, if you follow my lead, you might just\nmake it out of here alive.";
        let textContent = "";
        const textSpeed = 55;

        scene.dialogueText = scene.add.text(
            newChatBubble.x - (newChatBubble.width * 0.1 / 2) - 235,
            newChatBubble.y - (newChatBubble.height * 0.1 / 2) - 15,
            "",
            { font: "16px", color: "#000", align: "center" }
        );

        let charIndex = 0;

        scene.time.addEvent({
            delay: textSpeed,
            callback: () => {
                textContent += dialogue[charIndex];
                scene.dialogueText.setText(textContent);
                charIndex++;
            },
            repeat: dialogue.length - 1
        });

        scene.timerEvent = scene.time.delayedCall(9000, () => {
            if (!newChatBubble.anims) return;
            newChatBubble.anims.play('chat_bubble_reverse', true);
            scene.dialogueText?.destroy();
            scene.time.delayedCall(500, () => {
                newChatBubble.destroy();
                scene.isInteracting = false; // Release the lock
            });
        });

        scene.chatBubble = newChatBubble;
    }
}

export function setupAnimations(scene: any) {
    // Define animations
    const animations = [
        { key: 'coinAnimation', frames: scene.anims.generateFrameNames('coin', { prefix: 'coin', start: 1, end: 8, zeroPad: 2 }), frameRate: 15, repeat: -1 },
        { key: 'logoAnimation', frames: scene.anims.generateFrameNames('logo', { prefix: 'logo_', start: 1, end: 31, zeroPad: 4 }), frameRate: 15, repeat: -1 },
        { key: 'cloud', frames: scene.anims.generateFrameNames('cloud', { prefix: 'cloud', start: 1, end: 4, zeroPad: 4 }), frameRate: 7, repeat: -1 },
        { key: 'chat_bubble', frames: scene.anims.generateFrameNames('chat_bubble', { prefix: 'chat', start: 1, end: 4, zeroPad: 2 }), frameRate: 7, repeat: 0 },
        { key: 'chat_bubble_reverse', frames: scene.anims.generateFrameNames('chat_bubble', { prefix: 'chat', start: 1, end: 4, zeroPad: 2 }).reverse(), frameRate: 7, repeat: 0 },
        // Player 1
        { key: 'standingP1', frames: scene.anims.generateFrameNames('player', { prefix: 'standing', start: 1, end: 11, zeroPad: 4 }), frameRate: 3, repeat: -1 },
        { key: 'walkingP1', frames: scene.anims.generateFrameNames('player', { prefix: 'walk', start: 1, end: 7, zeroPad: 4 }), frameRate: 10, repeat: -1 },
        { key: 'runningP1', frames: scene.anims.generateFrameNames('player', { prefix: 'run', start: 1, end: 8, zeroPad: 4 }), frameRate: 10, repeat: -1 },
        { key: 'jumpingP1', frames: scene.anims.generateFrameNames('player', { prefix: 'jump', start: 1, end: 8, zeroPad: 4 }), frameRate: 7, repeat: 0 },
        { key: 'crouchingP1', frames: scene.anims.generateFrameNames('player', { prefix: 'jump', start: 2, end: 2, zeroPad: 4 }), frameRate: 7, repeat: 0 },
        { key: 'meleeP1', frames: scene.anims.generateFrameNames('player', { prefix: 'melee', start: 1, end: 13, zeroPad: 4 }), frameRate: 10, repeat: 0 },
        { key: 'dyingP1', frames: scene.anims.generateFrameNames('player', { prefix: 'death', start: 1, end: 4, zeroPad: 4 }), frameRate: 4, repeat: 0 },
        { key: 'hurtP1', frames: scene.anims.generateFrameNames('player', { prefix: 'death', start: 1, end: 1, zeroPad: 4 }), frameRate: 1, repeat: 0 },
        // Player 3
        { key: 'standingP3', frames: scene.anims.generateFrameNames('player3', { prefix: 'standing', start: 0, end: 22, zeroPad: 4 }), frameRate: 3, repeat: -1 },
        { key: 'walkingP3', frames: scene.anims.generateFrameNames('player3', { prefix: 'walk', start: 0, end: 6, zeroPad: 4 }), frameRate: 10, repeat: -1 },
        { key: 'runningP3', frames: scene.anims.generateFrameNames('player3', { prefix: 'run', start: 0, end: 7, zeroPad: 4 }), frameRate: 10, repeat: -1 },
        { key: 'jumpingP3', frames: scene.anims.generateFrameNames('player3', { prefix: 'jump', start: 0, end: 6, zeroPad: 4 }), frameRate: 7, repeat: 0 },
        { key: 'meleeP3', frames: scene.anims.generateFrameNames('player3', { prefix: 'melee', start: 0, end: 3, zeroPad: 4 }), frameRate: 10, repeat: 0 },
        { key: 'runShootP3', frames: scene.anims.generateFrameNames('player3', { prefix: 'runShoot', start: 0, end: 3, zeroPad: 4 }), frameRate: 10, repeat: -1 },
        { key: 'shootP3', frames: scene.anims.generateFrameNames('player3', { prefix: 'shoot', start: 0, end: 3, zeroPad: 4 }), frameRate: 30, repeat: 0 },
        { key: 'dyingP3', frames: scene.anims.generateFrameNames('player3', { prefix: 'death', start: 0, end: 4, zeroPad: 4 }), frameRate: 4, repeat: 0 },
        { key: 'hurtP3', frames: scene.anims.generateFrameNames('player3', { prefix: 'run', start: 0, end: 0, zeroPad: 4 }), frameRate: 1, repeat: 0 },
        { key: 'crouchingP3', frames: scene.anims.generateFrameNames('player3', { prefix: 'jump', start: 0, end: 0, zeroPad: 4 }), frameRate: 4, repeat: 0 },
        // Player 2
        { key: 'walkingP2', frames: scene.anims.generateFrameNames('player2', { prefix: 'walk-', start: 1, end: 16 }), frameRate: 10, repeat: -1 },
        { key: 'runningP2', frames: scene.anims.generateFrameNames('player2', { prefix: 'run-', start: 1, end: 8 }), frameRate: 10, repeat: -1 },
        { key: 'jumpingP2', frames: scene.anims.generateFrameNames('player2', { prefix: 'jump-', start: 1, end: 4 }), frameRate: 7, repeat: 0 },
        { key: 'shootP2', frames: scene.anims.generateFrameNames('player2', { prefix: 'shoot-', start: 1, end: 1 }), frameRate: 10, repeat: 0 },
        { key: 'standingP2', frames: scene.anims.generateFrameNames('player2', { prefix: 'idle-', start: 1, end: 4 }), frameRate: 6, repeat: -1 },
        { key: 'runShootP2', frames: scene.anims.generateFrameNames('player2', { prefix: 'run-shoot-', start: 1, end: 8 }), frameRate: 10, repeat: -1 },
        { key: 'backJumpP2', frames: scene.anims.generateFrameNames('player2', { prefix: 'back-jump-', start: 1, end: 7 }), frameRate: 7, repeat: 0 },
        { key: 'climbP2', frames: scene.anims.generateFrameNames('player2', { prefix: 'climb-', start: 1, end: 6 }), frameRate: 7, repeat: -1 },
        { key: 'hurtP2', frames: scene.anims.generateFrameNames('player2', { prefix: 'hurt-', start: 1, end: 1 }), frameRate: 1, repeat: 0 },
        { key: 'dyingP2', frames: scene.anims.generateFrameNames('player2', { prefix: 'jump-', start: 3, end: 3 }), frameRate: 1, repeat: 0 },
        { key: 'crouchingP2', frames: scene.anims.generateFrameNames('player2', { prefix: 'crouch-', start: 1, end: 1 }), frameRate: 1, repeat: 0 },
        { key: 'projectile-1', frames: scene.anims.generateFrameNames('projectile-1', { prefix: 'shot-', start: 1, end: 3 }), frameRate: 3, repeat: -1 },
        { key: 'hitSprite1', frames: scene.anims.generateFrameNames('hitSprite1', { prefix: 'hits-1-', start: 1, end: 5 }), frameRate: 10, repeat: 0 },
        // NPC 1
        { key: 'walkingNPC1', frames: scene.anims.generateFrameNames('npc1', { prefix: 'walk-', start: 1, end: 16 }), frameRate: 10, repeat: -1 },
        { key: 'runningNPC1', frames: scene.anims.generateFrameNames('npc1', { prefix: 'run-', start: 1, end: 8 }), frameRate: 10, repeat: -1 },
        { key: 'jumpingNPC1', frames: scene.anims.generateFrameNames('npc1', { prefix: 'jump-', start: 1, end: 4 }), frameRate: 7, repeat: 0 },
        { key: 'shootNPC1', frames: scene.anims.generateFrameNames('npc1', { prefix: 'shoot-', start: 1, end: 1 }), frameRate: 10, repeat: 0 },
        { key: 'standingNPC1', frames: scene.anims.generateFrameNames('npc1', { prefix: 'idle-', start: 1, end: 4 }), frameRate: 6, repeat: -1 },
        { key: 'dyingNPC1', frames: scene.anims.generateFrameNames('npc1', { prefix: 'jump-', start: 3, end: 3 }), frameRate: 1, repeat: 0 },
        // Enemy 1
        { key: 'walkingE1', frames: scene.anims.generateFrameNames('enemy', { prefix: 'walking-', start: 1, end: 16 }), frameRate: 10, repeat: -1 },
        { key: 'runningE1', frames: scene.anims.generateFrameNames('enemy', { prefix: 'running-', start: 1, end: 8 }), frameRate: 10, repeat: -1 },
        { key: 'jumpingE1', frames: scene.anims.generateFrameNames('enemy', { prefix: 'jumping-', start: 1, end: 4 }), frameRate: 7, repeat: 0 },
        { key: 'shootE1', frames: scene.anims.generateFrameNames('enemy', { prefix: 'shoot-', start: 1, end: 1 }), frameRate: 10, repeat: 0 },
        { key: 'standingE1', frames: scene.anims.generateFrameNames('enemy', { prefix: 'standing-', start: 1, end: 4 }), frameRate: 6, repeat: -1 },
        { key: 'dyingE1', frames: scene.anims.generateFrameNames('enemy', { prefix: 'jumping-', start: 3, end: 3 }), frameRate: 1, repeat: 0 },
    ];

    // Create animations
    animations.forEach(animation => {
        if (!scene.anims.exists(animation.key)) {
            scene.anims.create(animation);
        }
    });
}
