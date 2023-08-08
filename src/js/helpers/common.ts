import Phaser from 'phaser';
import Player from '../classes/entities/Player';
import Player2 from '../classes/entities/Player2';
import Enemy from '../classes/entities/Enemy';
import * as dat from 'dat.gui';

export function createBackground(scene: any, key: string, width: number, height: number): Phaser.GameObjects.TileSprite {
    const imageHeight = scene.textures.get(key).getSourceImage().height;
    const ratio = height / imageHeight;
    const sprite = scene.add.tileSprite(0, scene.physics.world.bounds.height - height, width, height, key)
        .setOrigin(0)
        .setTileScale(1, ratio);
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
    }
}

export function updateWorldBounds(scene: any, value: number) {
    scene.backgroundImages!.farBuildings.destroy();
    scene.backgroundImages!.backBuildings.destroy();
    scene.backgroundImages!.middle.destroy();
    scene.backgroundImages!.foreground.destroy();
    scene.backgroundImages!.farBuildings = scene.createBackground('far-buildings', scene.width, scene.height*scene.sfactor1);
    scene.backgroundImages!.backBuildings = scene.createBackground('back-buildings', scene.width, scene.height*scene.sfactor2);
    scene.backgroundImages!.middle = scene.createBackground('middle', scene.width, scene.height*scene.sfactor3);
    scene.backgroundImages!.foreground = scene.createBackground('foreground-empty', scene.width, scene.height*scene.sfactor4);
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
    
    for (let i = 0; i < 12; i++) {
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

export function createHealthBar(scene: Phaser.Scene, player: Player | Player2) {
    // Determine if the character is an Player2
    const isP2 = player instanceof Player2;

    // Adjust the x-position of the health bar for P2
    const xOffset = isP2 ? 360 : 0;

    // Adding the avatar image at the top left corner with xOffset
    let someAvatar = isP2 ? 'p2Avatar' : 'avatar';
    player.avatar = scene.add.image(100 + xOffset, 100, someAvatar);

    // Creating a circular mask using a Graphics object
    player.amask = scene.make.graphics({});
    player.amask.fillCircle(100 + xOffset, 100, 30); // X, Y, radius with xOffset

    // Applying the mask to the avatar
    player.avatar.setMask(player.amask.createGeometryMask());
    player.amask.setScrollFactor(0);

    // Scale the avatar
    const avatarScale = 0.6;
    player.avatar.setScale(avatarScale);

    // Get the scaled height of the avatar
    const avatarHeight = player.avatar.height * avatarScale;

    // Background of the health bar (position it relative to avatar, with the possible offset for P2)
    player.healthBarFrame = scene.add.image(player.avatar.x - 36, player.avatar.y - 35, 'health-bar-frame').setOrigin(0);

    // Scale the healthBarFrame to match the avatar's height
    const healthBarFrameScale = avatarHeight / player!.healthBarFrame.height;
    player!.healthBarFrame.setScale(healthBarFrameScale);

    // Foreground/fill of the health bar (same position as background)
    // Create a Graphics object
    player!.healthBarFill = scene.add.graphics({ fillStyle: { color: 0x00ff00 } });

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
    const name = scene.add.text(player.avatar.x + 36, player.avatar.y - 33, player.name, { fontSize: 15, color: '#ffffff' });

    // Check if the HUD elements are defined before creating the container
    if (player!.avatar && player!.healthBarFrame && player!.healthBarFill) {
        player!.hudContainer = scene.add.container(0, 0, [player!.healthBarFill, player!.healthBarFrame, name, player!.avatar]);
        player!.hudContainer.setDepth(2);
    }
}

export function updateHealthBar(scene: Phaser.Scene, player: Player) {
    // Update the HUD container's position to match the camera's scroll
    if (player!.hudContainer && scene.cameras.main) {
        player!.hudContainer.setPosition(scene.cameras.main.scrollX, scene.cameras.main.scrollY);
    }

    // Update the width of the health bar fill
    let fillWidth = (player!.currentHealth / player!.maxHealth) * 265;
    if (player!.healthBarFill) {
        player!.healthBarFill.clear();
        player!.healthBarFill.fillRect(player!.healthBarFrame.x + 20, player!.healthBarFrame.y + 20, fillWidth, 30);
    }
    return player!.healthBarFill;
}

export function destroyHealthBar(player: Player | Player2 | Enemy) {
    if (player.avatar && player.amask && player.healthBarFrame && player.healthBarFill && player.hudContainer) {
        player.avatar.destroy();
        player.amask.destroy();
        player.healthBarFrame.destroy();
        player.healthBarFill.destroy();
        player.hudContainer.destroy();
    }
}
export function follow(scene: any, player2: Player2, player: Player, interactHint: Phaser.GameObjects.Text, followSpeed: number = 300, bufferZone: number = 150, walkSpeed: number = 175, jumpStrength: number = 200) {
    if (player2.body!.touching.down) {
        const distanceToPlayer = player2.x - player.x;
        let startFollowing = false;

        if (distanceToPlayer <= 300 || startFollowing) {
            startFollowing = true;
            interactHint.setVisible(false);
            // If Player2 is close to the player, stop moving
            if (Math.abs(distanceToPlayer) < bufferZone) {
                player2.play('standingP2', true);
                player2.setVelocityX(0);
                interactHint.x = player2.x - 40;
                if (scene.chatBubble) if (!scene.chatBubble.visible) interactHint.setVisible(true);
                if (!scene.chatBubble) interactHint.setVisible(true);
            } else {
                const isCloser = Math.abs(distanceToPlayer) < walkSpeed;
                const animation = isCloser ? 'walkingP2' : 'runningP2';
                const speed = isCloser ? walkSpeed : followSpeed;

                player2.y -= 10;
                player2.setOffset(0, -12);
                player2.play(animation, true);
                player2.setVelocityX(distanceToPlayer < 0 ? speed : -speed);
                // player2.setVelocityY(-200); // Keep the Player2 from falling through the ground
                player2.flipX = distanceToPlayer > 0;

                // Check if there's an obstacle in the way
                if (obstacleInWay(player2)) {
                    player2.play('jumpingP2', true);
                    player2.setVelocityY(-jumpStrength);
                }
            }
        }
    }
}


// You'll need to define what an obstacle is in your game environment
function obstacleInWay(player2: Player2): boolean {
    // Implement your logic to detect obstacles here.
    // This could include raycasting, collision checks, or other techniques specific to your game.
    return false; // Return true if an obstacle is detected
}

export function handleInteract(scene: any, player: Player, player2: Player2, interactKey: Phaser.Input.Keyboard.Key) {
    if (scene.isInteracting) return; // Exit if interaction is already in progress

    if (Phaser.Input.Keyboard.JustDown(interactKey)) {
        scene.isInteracting = true; // Set the lock
        scene.interactHint?.setVisible(false);
        
        scene.sound.stopByKey('p2Dialogue1');
        scene.sound.play('p2Dialogue1', { volume: 1 });

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
                scene.interactHint?.setVisible(true);
                newChatBubble.destroy();
                scene.isInteracting = false; // Release the lock
            });
        });

        scene.chatBubble = newChatBubble;
    }
}

export function setupAnimations(scene: any) {
    // Setup Coin animation
    scene.anims.create({ key: 'coinAnimation', frames: scene.anims.generateFrameNames(
        'coin', { prefix: 'coin', start: 1, end: 8, zeroPad: 2 }), frameRate: 15, repeat: -1 });

    // Setup Logo animation
    scene.anims.create({ key: 'logoAnimation', frames: scene.anims.generateFrameNames(
        'logo', { prefix: 'logo_', start: 1, end: 31, zeroPad: 4 }), frameRate: 15, repeat: -1 });
    // Setup Player animations
    scene.anims.create({ key: 'standingPlayer', frames: scene.anims.generateFrameNames(
        'player', { prefix: 'standing', start: 1, end: 11, zeroPad: 4 }), frameRate: 3, repeat: -1 });
    scene.anims.create({ key: 'walking', frames: scene.anims.generateFrameNames(
        'player', { prefix: 'walk', start: 1, end: 7, zeroPad: 4 }), frameRate: 10, repeat: -1 });
    scene.anims.create({ key: 'running', frames: scene.anims.generateFrameNames(
        'player', { prefix: 'run', start: 1, end: 8, zeroPad: 4 }), frameRate: 10, repeat: -1 });
    scene.anims.create({ key: 'jumping', frames: scene.anims.generateFrameNames(
        'player', { prefix: 'jump', start: 1, end: 8, zeroPad: 4 }), frameRate: 7, repeat: 0 });
    scene.anims.create({ key: 'melee', frames: scene.anims.generateFrameNames(
        'player', { prefix: 'melee', start: 1, end: 13, zeroPad: 4 }), frameRate: 10, repeat: 0 });
    scene.anims.create({ key: 'dying', frames: scene.anims.generateFrameNames(
        'player', { prefix: 'death', start: 1, end: 4, zeroPad: 4 }), frameRate: 4, repeat: 0 });
    scene.anims.create({ key: 'cloud', frames: scene.anims.generateFrameNames(
        'cloud', { prefix: 'cloud', start: 1, end: 4, zeroPad: 4 }), frameRate: 7, repeat: -1 });
    let chatBubbleFrames = scene.anims.generateFrameNames('chat_bubble', { prefix: 'chat', start: 1, end: 4, zeroPad: 2 })
    scene.anims.create({ key: 'chat_bubble', frames: chatBubbleFrames, frameRate: 7, repeat: 0 });
    scene.anims.create({ key: 'chat_bubble_reverse', frames: chatBubbleFrames.reverse(), frameRate: 7, repeat: 0 });
    scene.anims.create({ key: 'standingP2', frames: scene.anims.generateFrameNames(
        'player2', { prefix: 'standing', start: 1, end: 22, zeroPad: 4 }), frameRate: 3, repeat: -1 });
    scene.anims.create({ key: 'walkingP2', frames: scene.anims.generateFrameNames(
        'player2', { prefix: 'walk', start: 1, end: 8, zeroPad: 4 }), frameRate: 10, repeat: -1 });
    scene.anims.create({ key: 'runningP2', frames: scene.anims.generateFrameNames(
        'player2', { prefix: 'run', start: 1, end: 8, zeroPad: 4 }), frameRate: 10, repeat: -1 });
    scene.anims.create({ key: 'jumpingP2', frames: scene.anims.generateFrameNames(
        'player2', { prefix: 'jump', start: 1, end: 8, zeroPad: 4 }), frameRate: 7, repeat: 0 });
}