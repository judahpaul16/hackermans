import Phaser from 'phaser';
import Player from '../classes/characters/Player';
import Player2 from '../classes/characters/Player2';
import Player3 from '../classes/characters/Player3';
import NPC from '../classes/characters/NPC';
import Enemy from '../classes/characters/Enemy';
import InputManager from '../classes/utils/InputManager';
import * as functions from '../helpers/functions';

export default class BaseScene extends Phaser.Scene {
    protected inputManager!: InputManager;
    protected player?: Player;
    protected player2?: Player2;
    protected player3?: Player3;
    protected p1StartX: number = 200;
    protected p1StartY: number = 650;
    protected p2StartX: number = this.p1StartX + 25;
    protected p2StartY: number = this.p1StartY;
    protected p3StartX: number = this.p2StartX + 50;
    protected p3StartY: number = this.p1StartY;
    protected enemies: Enemy[] = [];
    protected npcs: NPC[] = [];
    protected chatBubble?: Phaser.GameObjects.Sprite;
    protected dialogueText?: Phaser.GameObjects.Text;
    protected isInteracting: boolean = false;
    protected width: number = 3000;
    protected height: number = 650;
    // scale factors
    protected sfactor1: number = 1.25;
    protected sfactor2: number = 1.1;
    protected sfactor3: number = 0.9;
    protected sfactor4: number = 0.9;
    // distance between active player and nearest NPC
    protected distanceA: number = Infinity;
    // distance between active player and nearest Enemy
    protected distanceB: number = Infinity;
    protected backgroundImages?: { [key: string]: Phaser.GameObjects.TileSprite } = {};
    protected clouds: Phaser.GameObjects.Sprite[] = [];
    protected platforms?: Phaser.Physics.Arcade.StaticGroup;
    protected dg!: dat.GUI;
    protected pauseMenu?: Phaser.GameObjects.Container;
    protected pauseMenuSettings?: Phaser.GameObjects.Container;
    protected pauseMenuControls?: Phaser.GameObjects.Image;
    protected pauseBackground?: Phaser.GameObjects.Rectangle;
    protected pauseButton?: Phaser.GameObjects.Text;
    protected volumeBar?: Phaser.GameObjects.Graphics;
    protected volumeHandle?: Phaser.GameObjects.Rectangle;
    protected volumeValue: number = 0.5;
    protected level?: Phaser.GameObjects.Text;
    protected previousSceneName?: string;
    public platformKey: string = 'street';
    public levelNumber: number = 1;
    public players: Player[] = [];

    create() {
        // Basic Scene Setup
        
        // Pause Menu setup
        this.setupPauseMenu();

        // Add pause button to the top left corner of the camera
        this.pauseButton = this.add.text(20, 20, '[P] Pause / View Controls', {
            fontSize: 14,
            color: '#ffffff',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 3
        }).setScrollFactor(0);

        this.pauseButton.setInteractive().on('pointerdown', () => {
            this.togglePauseMenu();
        });

        // Camera setup
        this.cameras.main.setBounds(0, 0, this.width, 800);
        
        // Add Lv. # to the top right corner of the camera
        this.level = this.add.text(this.cameras.main.width - 80, 20, `Lv. ${this.levelNumber}`, {
            fontSize: 20,
            color: '#ffffff',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 3
        }).setScrollFactor(0);

        this.inputManager = InputManager.getInstance(this);
        // Update Input to apply to current scene
        InputManager.getInstance().updateInput(this);

        // Player setup
        this.setupPlayers();
        
        // Event listener for if 1, 2, or 3 is pressed and change camera to follow that player
        this.inputManager.switchKey1.on('down', () => {
            if (this.player && this.player2 && this.player3) {
                this.game.registry.set('activePlayer', this.player);
                this.cameras.main.startFollow(this.player, true, 0.5, 0.5);
                this.player.toggleIndicator();
                this.player2.toggleIndicator();
                this.player3.toggleIndicator();
            }
        });
        this.inputManager.switchKey2.on('down', () => {
            if (this.player && this.player2 && this.player3) {
                this.game.registry.set('activePlayer', this.player2);
                this.cameras.main.startFollow(this.player2, true, 0.5, 0.5);
                this.player.toggleIndicator();
                this.player2.toggleIndicator();
                this.player3.toggleIndicator();
            }
        });
        this.inputManager.switchKey3.on('down', () => {
            if (this.player && this.player2 && this.player3) {
                this.game.registry.set('activePlayer', this.player3);
                this.cameras.main.startFollow(this.player3, true, 0.5, 0.5);
                this.player.toggleIndicator();
                this.player2.toggleIndicator();
                this.player3.toggleIndicator();
            }
        });
        
        this.inputManager.resetKey.on('down', () => {
            // Reset player position if 'R' key is pressed
            this.resetPlayers();
        });

        this.inputManager.debugKey.on('down', () => {
            // Show Debug Menu if ESC key is pressed
            this.dg = this.registry.get('debugGUI');
            if (this.dg) {
                this.dg.domElement.style.display = this.dg.domElement.style.display === 'none' ? '' : 'none';
            }
        });
        
        // Reset players if 'R' key is pressed
        this.inputManager.resetKey.on('down', () => { this.resetPlayers() });

        // Pause game if 'P' key is pressed
        this.inputManager.pauseKey.on('down', () => { this.togglePauseMenu(); });

        // Debugging
        functions.initializeDebugGUI(this);

        // any other functions setup...
    }

    update() {
        // Parallax scrolling
        let camX = this.cameras.main.scrollX;
        this.backgroundImages!.farBuildings.tilePositionX = camX * 0.1;
        this.backgroundImages!.backBuildings.tilePositionX = camX * 0.2;
        this.backgroundImages!.middle.tilePositionX = camX * 0.3;
        this.backgroundImages!.foreground.tilePositionX = camX * 0.5;

        // Update Player
        if (this.player) if (this.player.isActive()) this.updatePlayer(this.player);
        if (this.player2) if (this.player2.isActive()) this.updatePlayer(this.player2);
        if (this.player3) if (this.player3.isActive()) this.updatePlayer(this.player3);

        // Make chat bubble follow Player 3
        if (this.player3) {
            if (this.chatBubble && this.dialogueText) {
                this.chatBubble.setPosition(this.player3.x - 123, this.player3.y - 130);
                this.dialogueText.setPosition(this.chatBubble!.x - (this.chatBubble!.width * 0.1 / 2) - 165,
                    this.chatBubble!.y - (this.chatBubble!.height * 0.1 / 2) - 15);
            }
        }

        // Handle Interactions
        if (this.player && this.player3)
            functions.handleInteract(this, this.player, this.player3, this.inputManager.interactKey!);
        
        // if Lv. # not in camera top right corner, move it there
        if (this.level!.x != this.cameras.main.width - 80 || this.level!.y != 20)
            this.level!.setPosition(this.cameras.main.width - 80, 20);

        // if pauseMenu width not equal to camera width, set it to camera width
        if (this.pauseBackground!.width != this.cameras.main.width)
            this.pauseBackground!.width = this.cameras.main.width;

        // Update health bars only if created
        if (this.player) functions.updateHealthBar(this, this.player);
        if (this.player2) functions.updateHealthBar(this, this.player2);
        if (this.player3) functions.updateHealthBar(this, this.player3);
        if (this.npcs) for (let npc of this.npcs) functions.updateHealthBar(this, npc);
        if (this.enemies) for (let enemy of this.enemies) functions.updateHealthBar(this, enemy);

        // if you die, it's game over
        if (this.player!.currentHealth <= 0) {
            // wait for the animation to finish with a delay then fade to black and go to game over scene
            let blackMask = this.add.rectangle(
                this.cameras.main.width / 2, // center x
                this.cameras.main.height / 2, // center y
                this.cameras.main.width,
                this.cameras.main.height,
                0x000000, 1
            ).setAlpha(0).setScrollFactor(0);
            
            this.time.delayedCall(3500, () => {
                this.tweens.add({
                    targets: blackMask,
                    alpha: 1,
                    duration: 2000,
                    ease: 'Linear',
                    onComplete: () => {
                        this.scene.start('GameOverScene');
                    }
                });
            }, [], this);            
        }

        // any other functions update logic...

    }

    protected setupPlayers() {
        // Projectile setup
        this.game.registry.set('friendlyProjectileGroup', this.physics.add.group({ gravityY: 0, velocityY: 0 }));
        this.game.registry.set('enemyProjectileGroup', this.physics.add.group({ gravityY: 0, velocityY: 0 }));

        // Street setup
        this.platforms = this.physics.add.staticGroup();
        functions.addPlatform(this, 150, 790, 1000, this.platformKey);

        // Player setup
        // if previous scene is not this scene, start player at the end of the scene
        let previousSceneName = this.game.registry.get('previousScene');

        // onlt start at the end if the previous scene ends in a number 1 greater than this scene
        // Extract the number from the current scene key (e.g., 'GameScene2' becomes 2)
        let currentSceneNumber = parseInt(this.scene.key.match(/\d+/)?.[0] || '0');

        // Extract the number from the previous scene key (e.g., 'GameScene1' becomes 1)
        let previousSceneNumber = parseInt(previousSceneName.match(/\d+/)?.[0] || '0');

        // Check if the previous scene number is exactly 1 less than the current scene number
        if (previousSceneNumber === currentSceneNumber + 1) {
            // The previous scene ends in a number 1 greater than this scene
            this.player = new Player(this, this.width - 50, 650, 'player');
            this.player.flipX = true;
        } else {
            this.player = new Player(this, this.p1StartX, this.p1StartY, 'player');
        }

        this.player!.body!.setSize(40, 60);
        this.player!.setScale(2);
        this.player!.body!.setOffset(0, 6);
        this.physics.add.collider(this.player!, this.platforms);

        // Player 2 setup
        // onlt start at the end if the previous scene ends in a number 1 greater than this scene
        // Check if the previous scene number is exactly 1 less than the current scene number
        if (previousSceneNumber === currentSceneNumber + 1) {
            // The previous scene ends in a number 1 greater than this scene
            this.player2! = new Player2(this, this.width - 50, 650, 'player2');
            this.player2!.flipX = true;
        } else {
            this.player2! = new Player2(this, this.p2StartX, this.p2StartY, 'player2');
        }

        this.player2!.body!.setSize(40, 60);
        this.player2!.setScale(2);
        this.player2!.body!.setOffset(0, 6);
        this.physics.add.collider(this.player2!, this.platforms);

        this.player2!.play('standingP2', true);
        this.player2!.flipX = true;

        // Player 3 setup
        // onlt start at the end if the previous scene ends in a number 1 greater than this scene
        // Check if the previous scene number is exactly 1 less than the current scene number
        if (previousSceneNumber === currentSceneNumber + 1) {
            // The previous scene ends in a number 1 greater than this scene
            this.player3! = new Player3(this, this.width - 50, 650, 'player3');
            this.player3!.flipX = true;
        } else {
            this.player3! = new Player3(this, this.p3StartX, this.p3StartY, 'player3');
        }

        this.player3!.body!.setSize(40, 60);
        this.player3!.setScale(2);
        this.player3!.body!.setOffset(0, 6);
        this.physics.add.collider(this.player3!, this.platforms);

        this.player3!.play('standingP3', true);
        this.player3!.flipX = true;

        if (this.npcs)
            for (let npc of this.npcs)
                this.physics.add.collider(npc, this.platforms);

        if (this.enemies)
            for (let enemy of this.enemies)
                this.physics.add.collider(enemy, this.platforms);
        
        // Health Bar setup
        functions.createHealthBar(this, this.player!);
        functions.createHealthBar(this, this.player2!);
        functions.createHealthBar(this, this.player3!);

        // Set active player if not already set
        if (!this.game.registry.get('activePlayer')) {
            this.game.registry.set('activePlayer', this.player);
        } else {
            for (let player of [this.player, this.player2, this.player3]) {
                if (player!.name === this.game.registry.get('activePlayer').name) {
                    this.game.registry.set('activePlayer', player);
                }
            }
        }
        this.players = [this.player!, this.player2!, this.player3!];
        this.game.registry.set('players', this.players);
        
        // Setup NPCs
        if (this.npcs) {
            this.game.registry.set('npcs', this.npcs);
            for (let npc of this.npcs) {
                // Create an interact hint only if it doesn't already exist
                if (!npc.interactHint) {                    
                    npc.interactHint = this.add.text(npc.x - 30, npc.y - 15, 'Press [F]', {
                        fontSize: 15,
                        color: '#ffffff',
                        align: 'center',
                        stroke: '#000000',
                        strokeThickness: 3
                    }).setDepth(10).setVisible(false);                    
                    this.add.tween({
                        targets: npc.interactHint,
                        y: npc.y - 35,
                        duration: 1500,
                        ease: 'Linear',
                        yoyo: true,
                        repeat: -1
                    });
                    this.add.tween({
                        targets: npc.interactHint,
                        alpha: 0,
                        duration: 1000,
                        ease: 'Linear',
                        yoyo: true,
                        repeat: -1
                    });
                }
                let activePlayer = this.game.registry.get('activePlayer') as Player | Player2 | Player3;
                if (activePlayer) {
                    this.distanceA = Phaser.Math.Distance.Between(activePlayer!.x, activePlayer!.y, npc.x, npc.y);
                    if (this.distanceA <= 600) {
                        // Create NPC health bar
                        functions.createHealthBar(this, npc!);
                        npc.interactHint.setVisible(true); // Show the interact hint
                    } else if (this.distanceA > 600) {
                        // Destroy NPC health bar
                        functions.destroyHealthBar(npc!);
                        npc.interactHint.setVisible(false); // Hide the interact hint
                    }
                }
            }
        }        
        // Setup Enemies
        if (this.enemies) {
            this.game.registry.set('enemies', this.enemies);
            for (let enemy of this.enemies) {
                let activePlayer = this.game.registry.get('activePlayer') as Player | Player2 | Player3;
                if (activePlayer) {
                    this.distanceB = Phaser.Math.Distance.Between(activePlayer!.x, activePlayer!.y, enemy.x, enemy.y);
                    if (this.distanceB <= 600) {
                        // Create Enemy health bar
                        functions.createHealthBar(this, enemy!);
                        enemy.hunt();
                    } else if (this.distanceB > 600) {
                        // Destroy Enemy health bar
                        functions.destroyHealthBar(enemy!);
                    }
                }
            }
        }

        // Attach camera to active player
        let activePlayer = this.game.registry.get('activePlayer') as Player | Player2 | Player3;
        if (activePlayer) {
            // pass activePlayer between scenes
            activePlayer.name == this.player!.name ? activePlayer = this.player! : activePlayer.name == this.player2!.name ? activePlayer = this.player2! : activePlayer = this.player3!;
            this.cameras.main.startFollow(activePlayer, true, 0.5, 0.5)
            activePlayer.toggleIndicator()
        } else {
            this.game.registry.set('activePlayer', this.player)
            this.cameras.main.startFollow(this.player!, true, 0.5, 0.5);
            this.player!.toggleIndicator();
        }

        // Define a common collision handler
        const onProjectileHitPlayer = (player: any, projectile: any) => {
            projectile.destroy();
            player.takeDamage(10);
        };
        
        // Projectile Collision
        let friendlyProjectileGroup = this.game.registry.get('friendlyProjectileGroup') as Phaser.Physics.Arcade.Group;
        let enemyProjectileGroup = this.game.registry.get('enemyProjectileGroup') as Phaser.Physics.Arcade.Group;
        
        // Adding collider for player 1
        this.physics.add.collider(this.player, enemyProjectileGroup, (player, projectile) => {
            onProjectileHitPlayer(player, projectile);
        });
        
        // Adding collider for player 2
        this.physics.add.collider(this.player2, enemyProjectileGroup, (player2, projectile) => {
            onProjectileHitPlayer(player2, projectile);
        });
        
        // Adding collider for player 3
        this.physics.add.collider(this.player3, enemyProjectileGroup, (player3, projectile) => {
            onProjectileHitPlayer(player3, projectile);
        });

        // Add collider for npcs
        if (this.npcs) {
            for (let npc of this.npcs) {
                this.physics.add.collider(npc, enemyProjectileGroup, (npc, projectile) => {
                    onProjectileHitPlayer(npc, projectile);
                });
            }
        }

        // Add collider for enemy
        if (this.enemies) {
            for (let enemy of this.enemies) {
                this.physics.add.collider(enemy, friendlyProjectileGroup, (enemy, projectile) => {
                    onProjectileHitPlayer(enemy, projectile);
                });
            }
        }
    }

    updatePlayer(player: Player | Player2 | Player3) {
        if (player.isDead) return;
        if (this.inputManager.isInputDisabled()) return;

        // Update Indicator position
        if (this.player) if (this.player.indicator) this.player.updateIndicatorPosition();
        if (this.player2) if (this.player2.indicator) this.player2.updateIndicatorPosition();
        if (this.player3) if (this.player3.indicator) this.player3.updateIndicatorPosition();

        // Update health bars
        if (this.player) functions.updateHealthBar(this, this.player);
        if (this.player2) functions.updateHealthBar(this, this.player2);
        if (this.player3) functions.updateHealthBar(this, this.player3);

        // Update NPCs
        if (this.npcs) {
            for (let npc of this.npcs) {
                let activePlayer = this.game.registry.get('activePlayer') as Player | Player2 | Player3;
                if (activePlayer) {
                    this.distanceA = Phaser.Math.Distance.Between(activePlayer!.x, activePlayer!.y, npc.x, npc.y);
                    if (this.distanceA <= 600) {
                        // Create NPC health bar
                        functions.createHealthBar(this, npc);
                        npc.interactHint!.setVisible(true); // Show the interact hint
                        npc.interactHint!.x = npc.x - 30;
                    } else if (this.distanceA > 600) {
                        // Destroy NPC health bar
                        functions.destroyHealthBar(npc!);
                        npc.interactHint!.setVisible(false); // Hide the interact hint
                    }
                }
            }
        }
        // Update Enemies
        if (this.enemies) {
            for (let enemy of this.enemies) {
                let activePlayer = this.game.registry.get('activePlayer') as Player | Player2 | Player3;
                if (activePlayer) {
                    this.distanceB = Phaser.Math.Distance.Between(activePlayer!.x, activePlayer!.y, enemy.x, enemy.y);
                    if (this.distanceB <= 600) {
                        // Create Enemy health bar
                        functions.createHealthBar(this, enemy!);
                        enemy.hunt();
                    } else if (this.distanceB > 600) {
                        // Destroy Enemy health bar
                        functions.destroyHealthBar(enemy!);
                    }
                }
            }
        }

        let isMovingLeft = this.inputManager.cursors.left!.isDown || this.inputManager.moveLeftKey.isDown;
        let isMovingRight = this.inputManager.cursors.right!.isDown || this.inputManager.moveRightKey!.isDown;
        let isRunning = this.inputManager.cursors.shift!.isDown;
        let isJumping = this.inputManager.cursors.up!.isDown || this.inputManager.jumpKey!.isDown;
        let isAttacking = this.inputManager.cursors.space!.isDown || this.inputManager.attackKey!.isDown;
        let isCrouching = this.inputManager.cursors.down!.isDown || this.inputManager.crouchKey!.isDown;

        if (player.getCurrentAnimation() === player.attackKey || player.getCurrentAnimation() === player.jumpKey) return;
        if (isMovingRight) {
            if (isRunning) {
                player.setVelocityX(player.runSpeed);
                if (!isAttacking) player.play(player.runKey, true);
            } else if (isJumping) {
                player.jump();
            } else {
                player.setVelocityX(player.walkSpeed);
                if (!isAttacking) player.play(player.walkKey, true);
            }
            player.flipX = false;
        } else if (isMovingLeft) {
            if (isRunning) {
                player.setVelocityX(-player.runSpeed);
                if (!isAttacking) player.play(player.runKey, true);
            } else if (isJumping) {
                player.jump();
            } else {
                player.setVelocityX(-player.walkSpeed);
                if (!isAttacking) player.play(player.walkKey, true);
            }
            player.flipX = true;
        } else if (isJumping) {
            player.jump();
        } else if (isCrouching) {
            player.play(player.crouchKey, true); 
        } else {
            player.setVelocityX(0);
            if (!isAttacking) player.play(player.standKey, true);
        }
        
        if (isAttacking) {
            player.attack();
        }

        // if player falls off the world, reset their position
        if (this.player!.y > this.height + 65) {
            this.player!.y = 660;
        }

        // if player2 falls off the world, reset their position
        if (this.player2!.y > this.height + 65) {
            this.player2!.y = 660;
        }

        // if player3 falls off the world, reset their position
        if (this.player3!.y > this.height + 65) {
            this.player3!.y = 660;
        }

        // if an npc falls off the world, reset their position
        if (this.npcs) for (let npc of this.npcs) if (npc.y > this.height + 65) npc.y = 660;

        // if an enemy falls off the world, reset their position
        if (this.enemies) for (let enemy of this.enemies) if (enemy.y > this.height + 65) enemy.y = 660;

        // Set Follow
        if (this.player!.isActive()) {
            this.player2!.follow(this.player!, true);
            this.player3!.follow(this.player!, false);
        } else if (this.player2!.isActive()) {
            this.player!.follow(this.player2!, false);
            this.player3!.follow(this.player2!, false);
        } else if (this.player3!.isActive()) {
            this.player!.follow(this.player3!, false);
            this.player2!.follow(this.player3!, true);
        }

        // check scene transition
        this.checkSceneTransition();
    }

    protected resetPlayers() {
        if (this.player) this.player.setPosition(200, 650);
        if (this.player2) this.player2.setPosition(275, 650);
        if (this.player3) this.player3.setPosition(325, 650);
    }

    protected togglePauseMenu() {
        const isPaused = this.pauseMenu!.visible;
        this.pauseMenu!.setVisible(!isPaused);
        this.physics.world.isPaused = !isPaused;
    
        if (isPaused) {
            this.inputManager.enableInput();
        } else {
            this.inputManager.disableInput();
        }
    }
    
    protected toggleControls() {
        this.pauseMenuControls!.setVisible(!this.pauseMenuControls!.visible);
    }

    protected createVolumeSlider() {
        const volumeBarWidth = 300;
        const volumeBarHeight = 10;
        const volumeHandleSize = 20;
        const x = 0; // Relative to the container
        const y = 100; // Relative to the container
        this.volumeValue = this.sound.volume;
    
        // Add a label for the volume slider
        const label = this.add.text(x - volumeBarWidth / 2, y - 40, 'Master Volume', { color: '#ffffff' });
    
        this.volumeBar = this.add.graphics({ lineStyle: { width: 2, color: 0xffffff }, fillStyle: { color: 0x444444 } });
        this.volumeBar.fillRect(x - volumeBarWidth / 2, y - volumeBarHeight / 2, volumeBarWidth, volumeBarHeight);
    
        // Create volume handle as a rectangle
        this.volumeHandle = this.add.rectangle(
            x + this.volumeValue * (volumeBarWidth - volumeHandleSize) - volumeBarWidth / 2, // x
            y, // y
            volumeHandleSize, // width
            volumeHandleSize // height
        ).setInteractive().setOrigin(0.5);
    
        this.input.setDraggable(this.volumeHandle);
        this.volumeHandle.setFillStyle(0xffffff);
    
        this.input.on('dragstart', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject) => {
            if (gameObject === this.volumeHandle) {
                this.volumeHandle.setFillStyle(0xff0000); // change color to red
            }
        });
    
        this.input.on('drag', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject, dragX: number, dragY: number) => {
            if (gameObject === this.volumeHandle) {
                let newX = Phaser.Math.Clamp(dragX, x - volumeBarWidth / 2, x + volumeBarWidth / 2 - volumeHandleSize);
                this.volumeValue = (newX - (x - volumeBarWidth / 2)) / (volumeBarWidth - volumeHandleSize);
                (this.volumeHandle as Phaser.GameObjects.Rectangle).setPosition(newX, y); // Cast to Rectangle and set position
                this.sound.volume = this.volumeValue;
            }
        });
        
    
        this.input.on('dragend', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject) => {
            if (gameObject === this.volumeHandle) {
                this.volumeHandle.setFillStyle(0xffffff); // change color back to white
            }
        });
    
        this.volumeHandle.setDepth(1001).setScrollFactor(0);
        this.volumeBar.setScrollFactor(0)
    
        // Add the volume slider elements to the settings container
        this.pauseMenuSettings!.add([label, this.volumeBar, this.volumeHandle]);
    }
    
    protected checkSceneTransition() {
        // find active player
        let activePlayer!: Player | Player2 | Player3;
        for (let player of [this.player, this.player2, this.player3]) {
            if (player) {
                if (player.isActive()) {
                    activePlayer = player;
                    break;
                }
            }
        }
        if (activePlayer) {
            // if player moves beyond the right edge of the world, start the next scene
            if (activePlayer!.x > this.width) {
                if (this.dg) this.dg.destroy();
                this.scale.off('resize');
                this.game.registry.set('previousScene', this.scene.key);
                this.scene.start(this.scene.key.replace(/\d+/, (match: string) => (parseInt(match) + 1).toString()));
            }

            // if player moves beyond the left edge of the world, start the previous scene
            if (this.scene.key !== 'GameScene1'){
                if (activePlayer!.x < 0) {
                    if (this.dg) this.dg.destroy();
                    this.scale.off('resize');
                    this.game.registry.set('previousScene', this.scene.key);
                    this.scene.start(this.scene.key.replace(/\d+/, (match: string) => (parseInt(match) - 1).toString()));
                }
            }
        }
    }

    public setupPauseMenu() {
        // Pause Menu setup
        this.pauseMenu = this.add.container(0, 0).setScrollFactor(0);
        this.pauseMenuSettings = this.add.container(
            this.cameras.main.width / 2, // x
            this.cameras.main.height / 2 - 250 // y
        ).setScrollFactor(0);
        this.pauseMenuControls = this.add.image(
            this.cameras.main.width / 2, // x
            this.cameras.main.height * 2 / 3 + 100, // y
            'controls' // texture
        ).setScrollFactor(0).setOrigin(0.5);
        this.pauseBackground = this.add.rectangle(
            0, 0, // x, y
            this.cameras.main.width, // width
            this.cameras.main.height, // height
            0x000000, 0.55 // color, alpha
        ).setScrollFactor(0).setOrigin(0, 0);

        this.pauseButton = this.add.text(0, 0, 'Continue', { color: '#ffffff', fontSize: '32px' }).setOrigin(0.5).setScrollFactor(0);

        // Setup tweens for pause button
        this.tweens.add({
            targets: this.pauseButton,
            scale: 1.1,
            ease: 'Linear',
            duration: 500,
            yoyo: true,
            repeat: -1
        });
        this.tweens.add({
            targets: this.pauseButton,
            alpha: 0.5,
            ease: 'Linear',
            duration: 500,
            yoyo: true,
            repeat: -1
        });

        // Create volume slider
        this.createVolumeSlider();
        this.pauseMenu.setDepth(1000);

        // // Create border around the settings container
        // const border = this.add.graphics({ lineStyle: { width: 2, color: 0xffffff } });
        // border.strokeRect(
        //     this.cameras.main.width / 2 - (this.cameras.main.width * 0.33) / 2, // x
        //     this.cameras.main.height / 2 - (this.cameras.main.height * 0.33) / 2 - 175, // y
        //     this.cameras.main.width * 0.33, this.cameras.main.height * 0.33 // width, height
        // );

        // Add to pause menu containers
        this.pauseMenuSettings!.add([this.pauseButton]);
        this.pauseMenu.add([
            this.pauseBackground,
            this.pauseMenuSettings!,
            this.pauseMenuControls!,
            // border
        ]);

        // Initially hide the pause menu
        this.pauseMenu.setVisible(false);

        // Input for clicking the pause button
        this.pauseButton.setInteractive().on('pointerdown', () => { this.togglePauseMenu(); });

        // on window resize, update pause menu
        this.scale.on('resize', this.resizeCallback, this);
    }

    public resizeCallback (gameSize: Phaser.Structs.Size) {
        // Update pause menu
        if (this.pauseMenu && this.pauseMenuSettings && this.pauseMenuControls && this.pauseBackground) {
            this.pauseMenuSettings.setPosition(gameSize.width / 2, gameSize.height / 2 - 250);
            this.pauseMenuControls.setPosition(gameSize.width / 2, gameSize.height * 2 / 3 + 100);
            this.pauseBackground.setSize(gameSize.width, gameSize.height);
        }
    }

    // other functions methods...

}
