import Phaser from 'phaser';
import Player, { PlayerState } from '../classes/characters/Player';
import Player2 from '../classes/characters/Player2';
import Player3 from '../classes/characters/Player3';
import NPC from '../classes/characters/NPC';
import EnemyAI from '../classes/characters/EnemyAI';
import Drone from '../classes/entities/Drone';
import InputManager from '../classes/utils/InputManager';
import * as functions from '../helpers/functions';

export default class BaseScene extends Phaser.Scene {
    protected dg!: dat.GUI;
    protected inputManager!: InputManager;
    protected player?: Player;
    protected player2?: Player2;
    protected player3?: Player3;
    protected p1StartX: number = 200;
    protected p1StartY: number = 690;
    protected p2StartX: number = this.p1StartX + 25;
    protected p2StartY: number = this.p1StartY;
    protected p3StartX: number = this.p2StartX + 50;
    protected p3StartY: number = this.p1StartY;
    protected enemies: EnemyAI[] = [];
    protected npcs: NPC[] = [];
    protected drones: Drone[] = [];
    protected chatBubble?: Phaser.GameObjects.Sprite;
    protected dialogueText?: Phaser.GameObjects.Text;
    protected isInteracting: boolean = false;
    protected isDialogueInProgress: boolean = false;
    protected width: number = 3000;
    protected height: number = 650;
    // scale factors for parallax scrolling
    protected sfactor1: number = 1.25;
    protected sfactor2: number = 1.1;
    protected sfactor3: number = 0.9;
    protected sfactor4: number = 0.9;
    protected backgroundImages?: { 
        [key: string]: Phaser.GameObjects.TileSprite 
    } = {};
    // distance between active player and nearest NPC
    protected distanceA: number = Infinity;
    // distance between active player and nearest Enemy
    protected distanceB: number = Infinity;
    protected clouds: Phaser.GameObjects.Sprite[] = [];
    protected platforms?: Phaser.Physics.Arcade.StaticGroup;
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
    public dialogeQueue: {
        character: Player | Player2 | Player3 | NPC,
        dialogue: string, key: string
    }[] = [];

    /////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////// Base Create/Update Functions //////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////

    create() {
        // Basic Scene Setup
        
        // Pause Menu setup
        this.setupPauseMenu();

        // Create base background
        functions.createBackground(this, 'underground', this.width, this.height, -2, 650, -0.65);

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
            // Reset player position if '0' key is pressed
            this.resetPlayers();
        });

        this.inputManager.reloadKey.on('down', () => {
            // Reload if 'R' key is pressed and type ranged
            [this.player2, this.player3].forEach(player => {
                let activePlayer = this.game.registry.get('activePlayer') as Player | Player2 | Player3;
                if (player && player.type === 'ranged' && player.number === activePlayer.number) {
                    player.reload();
                }
            });
        });

        this.inputManager.interactKey.on('down', () => {
            // Interact with Character if 'F' key is pressed
            let activePlayer = this.game.registry.get('activePlayer') as Player | Player2 | Player3;
            if (activePlayer) {
                for (let npc of this.npcs) {
                    this.distanceA = Phaser.Math.Distance.Between(activePlayer!.x, activePlayer!.y, npc.x, npc.y);
                    if (this.distanceA <= 600) {
                        let key = `${npc.name.toLowerCase()}Dialogue${this.levelNumber}`
                        functions.triggerDialogue(this, npc, npc.dialogue[key], key);
                    }
                }
            }
        });

        this.inputManager.debugKey.on('down', () => {
            // Show Debug Menu if ESC key is pressed
            this.dg = this.registry.get('debugGUI');
            if (this.dg) {
                this.dg.domElement.style.display = this.dg.domElement.style.display === 'none' ? '' : 'none';
            }
        });
        
        // Reset players if '0' key is pressed
        this.inputManager.resetKey.on('down', () => { this.resetPlayers() });

        // Pause game if 'P' key is pressed
        this.inputManager.pauseKey.on('down', () => { this.togglePauseMenu(); });

        // Debugging
        functions.initializeDebugGUI(this);
    }
    // CREATE END

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
    }
    // UPDATE END

    /////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////// Base Scene Functions  //////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////

    protected setupPlayers() {
        // Projectile setup
        this.game.registry.set('friendlyProjectileGroup', this.physics.add.group({ gravityY: 0, velocityY: 0 }));
        this.game.registry.set('enemyProjectileGroup', this.physics.add.group({ gravityY: 0, velocityY: 0 }));

        // Street setup
        this.platforms = this.physics.add.staticGroup();
        functions.addPlatform(this, 0, 750, this.width, this.platformKey, 0.7);

        // Player setup
        // if previous scene is not this scene, start player at the end of the scene
        let previousSceneName = this.game.registry.get('previousScene');

        // only start at the end if the previous scene ends in a number 1 greater than this scene
        // Extract the number from the current scene key (e.g., 'GameScene2' becomes 2)
        let currentSceneNumber = parseInt(this.scene.key.match(/\d+/)?.[0] || '0');

        // Extract the number from the previous scene key (e.g., 'GameScene1' becomes 1)
        let previousSceneNumber = parseInt(previousSceneName.match(/\d+/)?.[0] || '0');

        // Check if the previous scene number is exactly 1 less than the current scene number
        if (previousSceneNumber === currentSceneNumber + 1) {
            // The previous scene ends in a number 1 greater than this scene
            this.player = new Player(this, this.width - 50, 600, 'player');
            this.player.flipX = true;
        } else {
            this.player = new Player(this, this.p1StartX, this.p1StartY, 'player');
            if (this.player.body && this.player.body instanceof Phaser.Physics.Arcade.Body)
                this.player.body.setVelocity(0);
        }

        this.player!.body!.setSize(40, 60);
        this.player!.setScale(2);
        this.player!.body!.setOffset(0, 6);
        this.physics.add.collider(this.player!, this.platforms);

        // Player 2 setup
        // only start at the end if the previous scene ends in a number 1 greater than this scene
        // Check if the previous scene number is exactly 1 less than the current scene number
        if (previousSceneNumber === currentSceneNumber + 1) {
            // The previous scene ends in a number 1 greater than this scene
            this.player2! = new Player2(this, this.width - 50, 600, 'player2');
            this.player2!.flipX = true;
        } else this.player2! = new Player2(this, this.p2StartX, this.p2StartY, 'player2');

        this.player2!.body!.setSize(40, 60);
        this.player2!.setScale(2);
        this.player2!.body!.setOffset(0, 6);
        this.physics.add.collider(this.player2!, this.platforms);

        this.player2!.play('standingP2', true);
        this.player2!.flipX = true;

        // Create a reload hint only if it doesn't already exist and not reloading
        if (!this.player2.reloadText) {                    
            this.player2.reloadText = this.add.text(this.player2.x - 45, this.player2.y - 95, 'Reloading...', {
                fontSize: 15,
                color: '#ffffff',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 3
            }).setDepth(10).setVisible(false);
            this.add.tween({
                targets: this.player2.reloadText,
                alpha: 0,
                duration: 800,
                ease: 'Linear',
                yoyo: true,
                repeat: -1
            });
        }

        // Player 3 setup
        // only start at the end if the previous scene ends in a number 1 greater than this scene
        // Check if the previous scene number is exactly 1 less than the current scene number
        if (previousSceneNumber === currentSceneNumber + 1) {
            // The previous scene ends in a number 1 greater than this scene
            this.player3! = new Player3(this, this.width - 50, 600, 'player3');
            this.player3!.flipX = true;
        } else this.player3! = new Player3(this, this.p3StartX, this.p3StartY, 'player3');

        this.player3!.body!.setSize(40, 60);
        this.player3!.setScale(2);
        this.player3!.body!.setOffset(0, 6);
        this.physics.add.collider(this.player3!, this.platforms);

        this.player3!.play('standingP3', true);
        this.player3!.flipX = true;

        // Create a reload hint only if it doesn't already exist and not reloading
        if (!this.player3.reloadText) {                    
            this.player3.reloadText = this.add.text(this.player3.x - 45, this.player3.y - 65, 'Reloading...', {
                fontSize: 15,
                color: '#ffffff',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 3
            }).setDepth(10).setVisible(false);
            this.add.tween({
                targets: this.player3.reloadText,
                alpha: 0,
                duration: 800,
                ease: 'Linear',
                yoyo: true,
                repeat: -1
            });
        }

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
                    npc.interactHint = this.add.text(npc.x - 45, npc.y, 'Press [F]', {
                        fontSize: 15,
                        color: '#ffffff',
                        align: 'center',
                        stroke: '#000000',
                        strokeThickness: 3
                    }).setDepth(10).setVisible(false);                    
                    this.add.tween({
                        targets: npc.interactHint,
                        y: npc.y - 25,
                        duration: 1000,
                        ease: 'Linear',
                        yoyo: true,
                        repeat: -1
                    });
                    this.add.tween({
                        targets: npc.interactHint,
                        alpha: 0,
                        duration: 800,
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
                        enemy.transitionTo(PlayerState.HUNTING, enemy.flipX);
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
        let onProjectileHitPlayer = (player: any, projectile: any) => {
            projectile.destroy();
            player.takeDamage(10);
            // knockback
            player.setVelocity(projectile.velocityX > 0 ? 50 : -50, -50);
            // reset gravity
            setTimeout(() => {
                player.body.setGravityY(600);
                player.setVelocity(0, 0);
            }, 500);
        };
        
        // Projectile Collision
        let friendlyProjectileGroup = this.game.registry.get('friendlyProjectileGroup') as Phaser.Physics.Arcade.Group;
        let enemyProjectileGroup = this.game.registry.get('enemyProjectileGroup') as Phaser.Physics.Arcade.Group;
        
        // Adding collider for players and npcs
        for (let player of [...this.players, ...this.npcs]) {
            this.physics.add.collider(player, enemyProjectileGroup, (player, projectile) => {
                onProjectileHitPlayer(player, projectile);
            });

            this.physics.add.collider(player, this.enemies, (player: any, enemy: any) => {
                if (player.currentAnimation === player.attackKey) {
                    enemy.takeDamage(40);
                    player.heal(40);
                }
            });
        }

        // Add collider for enemy
        if (this.enemies) {
            for (let enemy of this.enemies) {
                this.physics.add.collider(enemy, friendlyProjectileGroup, (enemy, projectile) => {
                    onProjectileHitPlayer(enemy, projectile);
                });

                this.physics.add.collider(enemy, this.players, (enemy: any, player: any) => {
                    if (player.currentAnimation === player.attackKey) {
                        enemy.takeDamage(40);
                        player.heal(40);
                    }
                });
            }
        }

        // Add collider for drones
        if (this.drones) {
            for (let drone of this.drones) {
                // Calculate distance between drone and nearest player
                this.physics.add.collider(drone, this.players, (drone: any, player: any) => {
                    let distance: number;
                    for (let player of this.players) {
                        distance = Phaser.Math.Distance.Between(player.x, player.y, drone.x, drone.y);
                        if (player.currentAnimation === player.attackKey) {
                            drone.play('explode', true).setScale(1.5).on('animationcomplete', () => {
                                drone.showAnimationInfo = false;
                                drone.showXY = false;
                                drone.animationInfoText.destroy();
                                drone.xyText.destroy();
                                drone.destroy();
                            });
                            player.heal(30);
                        }
                    }
                });
                this.physics.add.collider(drone, friendlyProjectileGroup, (drone: any, projectile: any) => {
                    projectile.destroy();
                    drone.play('explode', true).setScale(1.5).on('animationcomplete', () => {
                        drone.showAnimationInfo = false;
                        drone.showXY = false;
                        drone.animationInfoText.destroy();
                        drone.xyText.destroy();
                        drone.destroy();
                    });
                });
            }
        }
    }

    updatePlayer(player: Player | Player2 | Player3) {
        if (player.isDead) return;
        if (this.inputManager.isInputDisabled()) return;
    
        // Generic update functions
        [this.player, this.player2, this.player3].forEach(p => {
            if (p && p.indicator) p.updateIndicatorPosition();
            if (p) functions.updateHealthBar(this, p);
            if (p) p.updateDebugInfo();
        });
    
        if (this.npcs) {
            for (let npc of this.npcs) {
                npc.updateDebugInfo();
                let activePlayer = this.game.registry.get('activePlayer') as Player | Player2 | Player3;
                this.updateCharacterDistance(this.distanceA, activePlayer, npc, 600);
            }
        }
    
        if (this.enemies) {
            for (let enemy of this.enemies) {
                enemy.updateDebugInfo();
                let activePlayer = this.game.registry.get('activePlayer') as Player | Player2 | Player3;
                this.updateCharacterDistance(this.distanceB, activePlayer, enemy, 600);
            }
        }
    
        if (this.drones) {
            for (let drone of this.drones) {
                drone.updateDebugInfo();
            }
        }
    
        // Check Reload
        [this.player2, this.player3].forEach(p => {
            if (p && p.reloadText) p.reloadText.setPosition(p.x - 45, p.y - 95);
            if (p) p.checkReload();
        });
        if (this.enemies) {
            for (let enemy of this.enemies) {
                if (enemy.type == "ranged") enemy.checkReload();
            }
        }
    
        this.handleInput(player);
    
        // Reset characters' position if they fall off the world
        [this.player, this.player2, this.player3, ...this.npcs, ...this.enemies].forEach(entity => {
            if (entity!.y > this.height + 65) entity!.y = 660;
        });
    
        this.handleFollowLogic();
    
        this.checkSceneTransition();
    }

    private handleInput(player: Player | Player2 | Player3) {
        const isMovingLeft = this.inputManager.cursors.left!.isDown || this.inputManager.moveLeftKey.isDown;
        const isMovingRight = this.inputManager.cursors.right!.isDown || this.inputManager.moveRightKey!.isDown;
        const isRunning = this.inputManager.cursors.shift!.isDown;
        const isJumping = this.inputManager.cursors.up!.isDown || this.inputManager.jumpKey!.isDown;
        const isAttacking = this.inputManager.cursors.space!.isDown || this.inputManager.attackKey!.isDown;
        const isSpecialAttacking = this.inputManager.specialAttackKey1!.isDown || this.inputManager.specialAttackKey2!.isDown;
        const isCrouching = this.inputManager.cursors.down!.isDown || this.inputManager.crouchKey!.isDown;
    
        if (isMovingRight || isMovingLeft) {
            if (isRunning) {
                if (!isAttacking) {
                    if (player.attackSound && player.number === 1) player.attackSound.stop();
                    player.transitionTo(PlayerState.RUNNING, isMovingLeft);
                }
            } else if (isJumping) {
                if (!isAttacking) 
                    player.transitionTo(PlayerState.JUMPING, isMovingLeft);
            } else {
                if (!isAttacking) {
                    if (player.attackSound && player.number === 1) player.attackSound.stop();
                    player.transitionTo(PlayerState.WALKING, isMovingLeft);
                }
            }
        } else if (isJumping) {
            if (!isAttacking) {
                if (player.attackSound && player.number === 1) player.attackSound.stop();
                player.transitionTo(PlayerState.JUMPING, player.flipX);
            }
        } else if (isCrouching) {
            if (!isAttacking) {
                if (player.attackSound && player.number  === 1) player.attackSound.stop();
                player.transitionTo(PlayerState.CROUCHING, player.flipX);
            }
        } else {
            if (!isAttacking && player.body!.touching.down) {
                if (player.attackSound && player.number  === 1) player.attackSound.stop();
                player.transitionTo(PlayerState.STANDING, player.flipX);
            }
        }
    
        if (isAttacking) player.transitionTo(PlayerState.ATTACKING, player.flipX);
        if (isSpecialAttacking) player.specialAttack();
    }
    
    private updateCharacterDistance(distance: number, activePlayer: Player | Player2 | Player3, character: any, range: number) {
        distance = Phaser.Math.Distance.Between(activePlayer!.x, activePlayer!.y, character.x, character.y);
        if (distance <= range) {
            functions.createHealthBar(this, character);
            if (character.name.includes('Enemy'))
                character.transitionTo(PlayerState.HUNTING, character.flipX);
            if (character.interactHint) {
                character.interactHint.setVisible(true);
                character.interactHint.x = character.x - 45;
            }
        } else {
            functions.destroyHealthBar(character!);
            if (character.interactHint) {
                character.interactHint.setVisible(false);
            }
        }
    }
    
    private handleFollowLogic() {
        if (this.player!.isActive()) {
            this.player2!.follow(this.player!);
            this.player3!.follow(this.player!);
        } else if (this.player2!.isActive()) {
            this.player!.follow(this.player2!);
            this.player3!.follow(this.player2!);
        } else if (this.player3!.isActive()) {
            this.player!.follow(this.player3!);
            this.player2!.follow(this.player3!);
        }
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
    
    public setupPauseMenu() {
        // Pause Menu setup
        this.pauseMenu = this.add.container(0, 0).setScrollFactor(0);
        this.pauseMenuSettings = this.add.container(
            this.cameras.main.width / 2, // x
            this.cameras.main.height / 2 - 215 // y
        ).setScrollFactor(0);
        this.pauseMenuControls = this.add.image(
            this.cameras.main.width / 2, // x
            this.cameras.main.height * 2 / 3 + 80, // y
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

    public resizeCallback (gameSize: Phaser.Structs.Size) {
        // Update pause menu
        if (this.pauseMenu && this.pauseMenuSettings && this.pauseMenuControls && this.pauseBackground) {
            this.pauseMenuSettings.setPosition(gameSize.width / 2, gameSize.height / 2 - 215);
            this.pauseMenuControls.setPosition(gameSize.width / 2, gameSize.height * 2 / 3 + 80);
            this.pauseBackground.setSize(gameSize.width, gameSize.height);
        }
    }
}
