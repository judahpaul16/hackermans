import Phaser from 'phaser';
import Player from '../classes/entities/Player';
import InputManager from '../classes/utils/InputManager';

export default class BaseScene extends Phaser.Scene {
  protected inputManager!: InputManager;
  public player?: Player;

  create() {
    this.inputManager = InputManager.getInstance(this);
    this.inputManager.resetKey.on('down', () => {
      // Reset player position if 'R' key is pressed
      this.resetPlayer();
    });

    this.inputManager.debugKey.on('down', () => {
      // Show Debug Menu if ESC key is pressed
      const dg = this.registry.get('debugGUI');
      if (dg) {
        dg.domElement.style.display = dg.domElement.style.display === 'none' ? '' : 'none';
      }
    });
    // any other common setup...
  }

  protected resetPlayer() {
    // This method can be implemented in the derived classes
    throw new Error("resetPlayer method must be implemented in derived classes");
  }

  // other common methods...

  update() {
    this.updatePlayer();
    // any other common update logic...

  }

  updatePlayer() {
    if (!this.player) return;
    if (this.player.isDead) return;
  
    let isMovingLeft = this.inputManager.cursors.left!.isDown || this.inputManager.moveLeftKey.isDown;
    let isMovingRight = this.inputManager.cursors.right!.isDown || this.inputManager.moveRightKey!.isDown;
    let isRunning = this.inputManager.cursors.shift!.isDown;
    let isJumping = this.inputManager.cursors.up!.isDown || this.inputManager.jumpKey!.isDown;
    let isAttacking = this.inputManager.cursors.space!.isDown;
  
    if (this.player.currentHealth <= 0 && !this.player.isDead) {
      this.physics.world.gravity.y = 0;
      this.player.play('dying', true);
      return;
    }
  
    if (this.player.getCurrentAnimation() === 'melee' || this.player.getCurrentAnimation() === 'jumping') return;
  
    if (isMovingRight) {
      if (isRunning) {
        this.player.setVelocityX(300);
        this.player.play('running', true);
      } else if (isJumping) {
        this.jump();        
      } else {
        this.player.setVelocityX(175);
        this.player.play('walking', true);
      }
      this.player.flipX = false;
      if (isAttacking) {
        this.attack();
      }
    } else if (isMovingLeft) {
      if (isRunning) {
        this.player.setVelocityX(-300);
        this.player.play('running', true);
      } else if (isJumping) {
        this.jump();        
      } else {
        this.player.setVelocityX(-175);
        this.player.play('walking', true);
      }
      this.player.flipX = true;
      if (isAttacking) {
        this.attack();
      }
    } else if (isJumping) {
      this.jump();        
    } else {
      this.player.setVelocityX(0);
      this.player.play('standingPlayer', true);
      if (isAttacking) {
        this.attack();
      }
    }
  }
  
  jump() {
    if (this.player && this.player.body!.touching.down) {
      this.player.setVelocityY(-450);
      this.player.play('jumping', true);
    }
  }
  
  attack() {
    if (this.player) {            
      this.player.play('melee', true);
      this.sound.play('melee', { volume: 0.5, loop: false });
    }
  }
  
}
