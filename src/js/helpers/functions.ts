import Phaser from 'phaser';
import Player from '../classes/characters/Player';
import Player2 from '../classes/characters/Player3';
import Player3 from '../classes/characters/Player2';
import NPC from '../classes/characters/NPC';
import EnemyAI from '../classes/characters/EnemyAI';
import * as dat from 'dat.gui';

export function createBackground(
    scene: any,
    key: string,
    width: number,
    height: number,
    depth: number = -1,
    offset: number = 0,
    scaleOffset: number = 0
): Phaser.GameObjects.TileSprite {

    const imageHeight = scene.textures.get(key).getSourceImage().height;
    const ratio = (height / imageHeight) + scaleOffset;
    const sprite = scene.add.tileSprite(0, scene.physics.world.bounds.height - height + offset, width, height, key)
        .setOrigin(0)
        .setDepth(depth)
        .setTileScale(ratio, ratio);
    return sprite;
}

export function addPlatform(scene: any, x: number, y: number, width: number, type: string, scale: number = 1) {
    if (scene.platforms) {
        let imageWidth = scene.textures.get(type).getSourceImage().width * scale;
        for (let i = 0; i < width; i += imageWidth)
            scene.platforms.create(x + i, y, type).setOrigin(0).setScale(scale).refreshBody();
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
    scene.showXY = false;
    scene.dg.add(scene, 'showXY').name('Show X, Y Coordinates').onChange((value : boolean) => {
        // When the switch is toggled, update all sprites' X-Y coords visibility
        toggleXYCoords(scene, value);
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
                let enemyFolderN = enemyFolder.addFolder(`${enemy.name} ` + (i + 1));
                enemyFolderN.add(enemy, 'scale', 0.1, 5).name('Sprite Scale').listen();
                enemyFolderN.add(enemy.body!, 'width', 0, 200).name('Hitbox Width').listen();
                enemyFolderN.add(enemy.body!, 'height', 0, 200).name('Hitbox Height').listen();
                enemyFolderN.add(enemy.body!.offset, 'x', -200, 200).name('Hitbox X Offset').listen();
                enemyFolderN.add(enemy.body!.offset, 'y', -200, 200).name('Hitbox Y Offset').listen();
            }
        }
    }
}

export function toggleXYCoords(scene: any, value: boolean) {
    // Update XY coords for all players
    if (scene.player) {
        scene.player.showXY = value;
        scene.player.updateDebugInfo();
    }
    if (scene.player2) {
        scene.player2.showXY = value;
        scene.player2.updateDebugInfo();
    }
    if (scene.player3) {
        scene.player3.showXY = value;
        scene.player3.updateDebugInfo();
    }

    // Update XY coords for all NPCs
    if (scene.npcs) {
        for (let i = 0; i < scene.npcs.length; i++) {
            let npc = scene.npcs[i];
            npc.showXY = value;
            npc.updateDebugInfo();
        }
    }

    // Update XY coords for all enemies
    if (scene.enemies) {
        for (let i = 0; i < scene.enemies.length; i++) {
            let enemy = scene.enemies[i];
            enemy.showXY = value;
            enemy.updateDebugInfo();
        }
    }

    // Update XY coords for all drones
    if (scene.drones) {
        for (let i = 0; i < scene.drones.length; i++) {
            let drone = scene.drones[i];
            drone.showXY = value;
            drone.updateDebugInfo();
        }
    }
}

function toggleAllAnimationInfo(scene: any, value: boolean) {
    // Update animation info for all players
    if (scene.player) {
        scene.player.showAnimationInfo = value;
        scene.player.updateDebugInfo();
    }
    if (scene.player2) {
        scene.player2.showAnimationInfo = value;
        scene.player2.updateDebugInfo();
    }
    if (scene.player3) {
        scene.player3.showAnimationInfo = value;
        scene.player3.updateDebugInfo();
    }

    // Update animation info for all NPCs
    if (scene.npcs) {
        for (let i = 0; i < scene.npcs.length; i++) {
            let npc = scene.npcs[i];
            npc.showAnimationInfo = value;
            npc.updateDebugInfo();
        }
    }

    // Update animation info for all enemies
    if (scene.enemies) {
        for (let i = 0; i < scene.enemies.length; i++) {
            let enemy = scene.enemies[i];
            enemy.showAnimationInfo = value;
            enemy.updateDebugInfo();
        }
    }

    // Update animation info for all drones
    if (scene.drones) {
        for (let i = 0; i < scene.drones.length; i++) {
            let drone = scene.drones[i];
            drone.showAnimationInfo = value;
            drone.updateDebugInfo();
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

export function createHealthBar(scene: Phaser.Scene, player: any, extraYoffset: number = 0) {
    if (player && !player.avatar && !player.amask && !player.healthBarFrame && !player.healthBarFill && !player.healthBar) {
        // Determine type of character
        const isP2 = player instanceof Player2;
        const isP3 = player instanceof Player3;
        const isNPC = player instanceof NPC;
        const isEnemy = player.name.includes('Enemy');
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

export function updateHealthBar(scene: Phaser.Scene, player: any) {
    if (player && player.healthBarFill && player.healthBarFrame && player.healthBar) {
        if (player instanceof NPC || player.type === 'enemy') {
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

export function destroyHealthBar(player: any) {
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

export function triggerDialogue(
    scene: any,
    character: any,
    dialogue: string,
    dialogueSoundKey: string
) {
    if (scene.isInteracting) return;

    scene.isInteracting = true;
    
    const mainMusic = scene.sound.get('mainMusic');
    if (mainMusic instanceof Phaser.Sound.WebAudioSound || mainMusic instanceof Phaser.Sound.HTML5AudioSound)
        mainMusic.setVolume(0.15);
    
    scene.sound.stopByKey(dialogueSoundKey);
    scene.sound.play(dialogueSoundKey, { volume: 1 });

    if (scene.chatBubble && scene.chatBubble.anims && scene.chatBubble.anims.isPlaying) {
        if (scene.timerEvent) {
            scene.timerEvent.remove(false);
            scene.timerEvent = null;
        }
        scene.chatBubble.anims.play('chat_bubble_reverse', true);
        scene.time.delayedCall(500, () => {
            if (scene.dialogueText) {
                scene.dialogueText.destroy();
            }
            scene.chatBubble.destroy();
        });
        if (mainMusic instanceof Phaser.Sound.WebAudioSound || mainMusic instanceof Phaser.Sound.HTML5AudioSound)
            mainMusic.setVolume(0.35);
        return;
    }

    if (scene.chatBubble) {
        if (scene.dialogueText) {
            scene.dialogueText.destroy();
        }
        scene.chatBubble.destroy();
    }

    let newChatBubble = scene.add.sprite(character.x - 123, character.y - 130, 'chat_bubble').setScale(0.34).setDepth(11);
    newChatBubble.flipX = true;
    newChatBubble.play('chat_bubble', true);

    let charIndex = 0;
    let textContent = "";
    const textSpeed = 55;
    let newlinesEncountered = 0;
    let nextAppendDelay = 0;
    const delayInSeconds = 2;  // delay after every page

    // Calculate number of pages beforehand:
    let numberOfPages = (dialogue.match(/\n/g) || []).length / 3;

    // Calculate the total delay based on the number of pages:
    let totalDelay = numberOfPages * delayInSeconds * 1000;

    scene.time.addEvent({
        delay: textSpeed,
        callback: () => {
            if (nextAppendDelay > 0) {
                nextAppendDelay -= textSpeed;
                return;
            }
    
            if (charIndex >= dialogue.length) return; // This line prevents out-of-bound index.
    
            if (dialogue[charIndex] === '\n') newlinesEncountered++;
    
            if (newlinesEncountered === 3) {
                textContent = "";
                newlinesEncountered = 0;
                nextAppendDelay = delayInSeconds * 1000;
                charIndex++;
                return;
            }
    
            textContent += dialogue[charIndex];
            updateText(scene, newChatBubble, textContent);
            charIndex++;
        },
        repeat: dialogue.length + Math.ceil(totalDelay / textSpeed) - 1
    });
    
    function updateText(scene: any, newChatBubble: any, textContent: string) {
        if (scene.dialogueText) {
            scene.dialogueText.destroy();
        }

        try {
            scene.dialogueText = scene.add.text(
                newChatBubble.x - (newChatBubble.width * 0.1 / 2) - 235,
                newChatBubble.y - (newChatBubble.height * 0.1 / 2) - 15,
                textContent,
                { font: "16px", color: "#000", align: "center" }
            ).setDepth(12);
        } catch (e) {
            console.error("Error creating the text: ", e);
        }
    }

    const totalDisplayTime = (dialogue.length * textSpeed) + 2000 + totalDelay;
    scene.timerEvent = scene.time.delayedCall(totalDisplayTime, () => {
        if (!newChatBubble.anims) return;
        newChatBubble.anims.play('chat_bubble_reverse', true);
        if (scene.dialogueText) scene.dialogueText.destroy();
        scene.time.delayedCall(500, () => {
            newChatBubble.destroy();
            scene.isInteracting = false;
            if (mainMusic instanceof Phaser.Sound.WebAudioSound || mainMusic instanceof Phaser.Sound.HTML5AudioSound)
                mainMusic.setVolume(0.35);
        });
    });

    scene.chatBubble = newChatBubble;

    scene.events.on('update', () => {
        if (scene.chatBubble && scene.dialogueText) {
            scene.chatBubble.setPosition(character.x - 123, character.y - 130);
            scene.dialogueText.setPosition(scene.chatBubble.x - (scene.chatBubble.width * 0.1 / 2) - 165, scene.chatBubble.y - (scene.chatBubble.height * 0.1 / 2) - 15);
        }
    });
}

export function triggerDialogueQueue(scene: any, queue: { character: any; dialogue: string; key: string; }[]) {
    if (!scene.dialogueQueue) {
        scene.dialogueQueue = [];
    }

    scene.dialogueQueue = [...scene.dialogueQueue, ...queue];

    if (!scene.isDialogueInProgress) {
        processDialogueQueue(scene);
    }
}

function processDialogueQueue(scene: any) {
    if (scene.dialogueQueue.length === 0) {
        scene.isDialogueInProgress = false;
        return;
    }

    scene.isDialogueInProgress = true;

    const { character, dialogue, key } = scene.dialogueQueue.shift() as { character: any; dialogue: string; key: string; };
    triggerDialogue(scene, character, dialogue, key);

    scene.events.on('update', () => {
        if (!scene.isInteracting) {
            processDialogueQueue(scene);
        }
    });
}
