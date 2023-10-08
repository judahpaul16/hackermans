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

    // Add toggle for physics arcade debug to display sprite bounds and animation info
    const debugGraphic = scene.physics.world.createDebugGraphic();
    debugGraphic.setVisible(false);
    scene.dg.add(debugGraphic, 'visible').name('Show Bounds').listen();
    scene.showAnimationsInfo = false;
    scene.dg.add(scene, 'showAnimationsInfo').name('Show Animations Info').onChange((value : boolean) => {
        // When the switch is toggled, update all sprites' animation info visibility
        toggleAllAnimationInfo(scene, value);
    });
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
        const playerFolder = characterFolder.addFolder('Players');
        const player1Folder = playerFolder.addFolder('Player 1');
        player1Folder.add(scene.player!, 'scale', 0.1, 5).name('Sprite Scale').listen();    
        player1Folder.add(scene.player!.body!, 'width', 0, 200).name('Hitbox Width').listen();
        player1Folder.add(scene.player!.body!, 'height', 0, 200).name('Hitbox Height').listen();
        player1Folder.add(scene.player!.body!.offset, 'x', -200, 200).name('Hitbox X Offset').listen();
        player1Folder.add(scene.player!.body!.offset, 'y', -200, 200).name('Hitbox Y Offset').listen();
        const player2Folder = playerFolder.addFolder('Player 2');
        player2Folder.add(scene.player2!, 'scale', 0.1, 5).name('Sprite Scale').listen();
        player2Folder.add(scene.player2!.body!, 'width', 0, 200).name('Hitbox Width').listen();
        player2Folder.add(scene.player2!.body!, 'height', 0, 200).name('Hitbox Height').listen();
        player2Folder.add(scene.player2!.body!.offset, 'x', -200, 200).name('Hitbox X Offset').listen();
        player2Folder.add(scene.player2!.body!.offset, 'y', -200, 200).name('Hitbox Y Offset').listen();
        const player3Folder = playerFolder.addFolder('Player 3');
        player3Folder.add(scene.player3!, 'scale', 0.1, 5).name('Sprite Scale').listen();
        player3Folder.add(scene.player3!.body!, 'width', 0, 200).name('Hitbox Width').listen();
        player3Folder.add(scene.player3!.body!, 'height', 0, 200).name('Hitbox Height').listen();
        player3Folder.add(scene.player3!.body!.offset, 'x', -200, 200).name('Hitbox X Offset').listen();
        player3Folder.add(scene.player3!.body!.offset, 'y', -200, 200).name('Hitbox Y Offset').listen();
        const npcFolder = characterFolder.addFolder('NPCs');
        const enemyFolder = characterFolder.addFolder('Enemies');
        if (scene.npcs) {
            for (let i = 0; i < scene.npcs!.length; i++) {
                let npc = scene.npcs![i];
                let npcFolderN = npcFolder.addFolder('NPC ' + (i + 1));
                npcFolderN.add(npc, 'scale', 0.1, 5).name('Sprite Scale').listen();
                npcFolderN.add(npc.body!, 'width', 0, 200).name('Hitbox Width').listen();
                npcFolderN.add(npc.body!, 'height', 0, 200).name('Hitbox Height').listen();
                npcFolderN.add(npc.body!.offset, 'x', -200, 200).name('Hitbox X Offset').listen();
                npcFolderN.add(npc.body!.offset, 'y', -200, 200).name('Hitbox Y Offset').listen();
            }
        }
        if (scene.enemies) {
            for (let i = 0; i < scene.enemies!.length; i++) {
                let enemy = scene.enemies![i];
                let enemyFolderN = enemyFolder.addFolder('Enemy ' + (i + 1));
                enemyFolderN.add(enemy, 'scale', 0.1, 5).name('Sprite Scale').listen();
                enemyFolderN.add(enemy.body!, 'width', 0, 200).name('Hitbox Width').listen();
                enemyFolderN.add(enemy.body!, 'height', 0, 200).name('Hitbox Height').listen();
                enemyFolderN.add(enemy.body!.offset, 'x', -200, 200).name('Hitbox X Offset').listen();
                enemyFolderN.add(enemy.body!.offset, 'y', -200, 200).name('Hitbox Y Offset').listen();
            }
        }
    }
}

function toggleAllAnimationInfo(scene: any, value: boolean) {
    // Update animation info for all players
    if (scene.player) {
        scene.player.showAnimationInfo = value;
        scene.player.updateAnimationInfo();
    }
    if (scene.player2) {
        scene.player2.showAnimationInfo = value;
        scene.player2.updateAnimationInfo();
    }
    if (scene.player3) {
        scene.player3.showAnimationInfo = value;
        scene.player3.updateAnimationInfo();
    }

    // Update animation info for all NPCs
    if (scene.npcs) {
        for (let i = 0; i < scene.npcs.length; i++) {
            let npc = scene.npcs[i];
            npc.showAnimationInfo = value;
            npc.updateAnimationInfo();
        }
    }

    // Update animation info for all enemies
    if (scene.enemies) {
        for (let i = 0; i < scene.enemies.length; i++) {
            let enemy = scene.enemies[i];
            enemy.showAnimationInfo = value;
            enemy.updateAnimationInfo();
        }
    }

    // Update animation info for all drones
    if (scene.drones) {
        for (let i = 0; i < scene.drones.length; i++) {
            let drone = scene.drones[i];
            drone.showAnimationInfo = value;
            drone.updateAnimationInfo();
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

export function createHealthBar(scene: Phaser.Scene, player: Player | Player2 | Player3 | NPC | Enemy, extraYoffset: number = 0) {
    if (player && !player.avatar && !player.amask && !player.healthBarFrame && !player.healthBarFill && !player.healthBar) {
        // Determine type of character
        const isP2 = player instanceof Player2;
        const isP3 = player instanceof Player3;
        const isNPC = player instanceof NPC;
        const isEnemy = player instanceof Enemy;
        const avatarOffsetX = isNPC || isEnemy ? 255 : 0;
        const fillOffsetX = isNPC || isEnemy ? -15 : 0;

        // Adjust the x-position of the health bar for P3 & Enemy
        let xOffset = isP2 ? 340 : 0;
        if (isEnemy || isNPC) xOffset = scene.scale.width - 480;
        
        // Adjust the y-position of the health bar for P2
        let yOffset = isP3 ? 100 : 0;
        yOffset += extraYoffset;

        // Adding the avatar image at the top left corner with xOffset
        player.avatar = scene.add.image(100 + xOffset + avatarOffsetX, 100 + yOffset, player.avatarKey);
        (isNPC || isEnemy) ? player.avatar.setFlipX(true) : player.avatar.setFlipX(false);

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
        (isNPC || isEnemy) ?
            player.healthBarFrame = scene.add.image(player.avatar.x - avatarOffsetX, player.avatar.y - 35, player.hbFrameKey).setOrigin(0)
        :
            player.healthBarFrame = scene.add.image(player.avatar.x - 36, player.avatar.y - 35, player.hbFrameKey).setOrigin(0);
        
        // Scale the healthBarFrame to match the avatar's height
        const healthBarFrameScale = avatarHeight / player.healthBarFrame.height;
        player.healthBarFrame.setScale(healthBarFrameScale);

        // Foreground/fill of the health bar (same position as background)
        // Create a Graphics object
        player.healthBarFill = scene.add.graphics({ fillStyle: { color: 0x00ad48 } });
        player.healthBarFill.x += fillOffsetX;

        // Determine the width based on the current health percentage
        let fillWidth = (player.currentHealth / player.maxHealth) * 265;

        // Draw a rectangle representing the fill
        player.healthBarFill.fillRect(player.healthBarFrame.x + 20, player.healthBarFrame.y + 20, fillWidth, 30);

        player.healthBarFill = updateHealthBar(scene, player);
                
        // Set the depth of the avatar to ensure it's rendered in front of the frame
        player.avatar.setDepth(5);
        // Set the depth of the health bar to ensure it's rendered in behind the frame
        player.healthBarFrame.setDepth(4);
        if (player.healthBarFill) player.healthBarFill.setDepth(3);

        // Add the player's name above the avatar
        let name = null;
        (isNPC || isEnemy) ?
            name = scene.add.text(player.avatar.x - 130, player.avatar.y - 33, player.name, { fontSize: 15, color: '#ffffff' })
        :
            name = scene.add.text(player.avatar.x + 36, player.avatar.y - 33, player.name, { fontSize: 15, color: '#ffffff' });

        // Add the player's health value in the center of the health bar
        let healthString = `${player.currentHealth}/${player.maxHealth}`;
        player.healthText = scene.add.text(player.healthBarFrame.x + 210, player.healthBarFrame.y + 28,
                                        healthString, 
                                        { fontSize: 15, color: '#ffffff', align: 'center' });
        (isNPC || isEnemy) ? player.healthText.setX(player.healthBarFrame.x + 20) : player.healthText.setX(player.healthBarFrame.x + 210);
        player.healthText.setDepth(3);

        if (player.avatar && player.healthBarFrame && player.healthBarFill) {
            player.healthBar = scene.add.container(0, 0, [player.healthBarFill, player.avatar, player.healthBarFrame, name, player.healthText]);
            player.healthBar.setDepth(2);        
        }
    }
}

export function updateHealthBar(scene: Phaser.Scene, player: Player | Player2 | Player3 | NPC | Enemy) {
    if (player && player.healthBarFill && player.healthBarFrame && player.healthBar) {
        if (player instanceof NPC || player instanceof Enemy) {
            let scrollX = scene.cameras.main.scrollX + window.innerWidth - scene.scale.width;
            let scrollY = (window.innerWidth < 1100) ? scene.cameras.main.scrollY + 100 : scene.cameras.main.scrollY;
            
            if (window.innerWidth < 1100 && player.avatar!.y != 200) {
                destroyHealthBar(player);
                createHealthBar(scene, player, 100);
            } else if (window.innerWidth < 1100) {
                player.healthBar.setPosition(scrollX, scrollY -= 100);
            } else {
                player.healthBar.setPosition(scrollX, scrollY);
            }
        } else{ 
            // Update the HUD container's position to match the camera's scroll
            if (player.healthBar && scene.cameras.main)
                player.healthBar.setPosition(scene.cameras.main.scrollX, scene.cameras.main.scrollY);
        }
        // Update the width of the health bar fill
        let fillWidth = (player.currentHealth / player.maxHealth) * 265;
        if (player.healthBarFill) {
            player.healthBarFill.clear();
            player.healthBarFill.fillRect(player.healthBarFrame.x + 20, player.healthBarFrame.y + 20, fillWidth, 30);
        }
    }
    // Update the text of the healthText
    if (player.healthText) {
        let healthString = `${player.currentHealth}/${player.maxHealth}`;
        player.healthText.setText(healthString);
    }

    return player.healthBarFill;
}

export function destroyHealthBar(player: Player | Player2 | Player3 | NPC | Enemy) {
    if (player.avatar && player.amask && player.healthBarFrame && player.healthBarFill && player.healthBar) {
        player.avatar.destroy();
        player.avatar = undefined;
        player.amask.destroy();
        player.amask = undefined;
        player.healthBarFrame.destroy();
        player.healthBarFrame = undefined;
        player.healthBarFill.destroy();
        player.healthBarFill = undefined;
        player.healthBar.destroy();
        player.healthBar = undefined;
    }
    if (player.healthText) {
        player.healthText.destroy();
        player.healthText = undefined;
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

        const newChatBubble = scene.add.sprite(scene.player2!.x - 123, scene.player2!.y - 130, 'chat_bubble').setScale(0.34).setDepth(11);
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
        ).setDepth(12);

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
        generateAnimationProps('chat_bubble_reverse', 'chat_bubble', 'chat', 1, 3, 7, 0, 2),
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
