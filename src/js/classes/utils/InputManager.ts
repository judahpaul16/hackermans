class InputManager {
    private static instance: InputManager;
  
    public cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    public debugKey: Phaser.Input.Keyboard.Key;
    public resetKey: Phaser.Input.Keyboard.Key;
    public interactKey: Phaser.Input.Keyboard.Key;
    public moveLeftKey: Phaser.Input.Keyboard.Key;
    public moveRightKey: Phaser.Input.Keyboard.Key;
    public jumpKey: Phaser.Input.Keyboard.Key;
  
    private constructor(scene: Phaser.Scene) {
      this.cursors = scene.input.keyboard!.createCursorKeys();
      this.debugKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
      this.resetKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.R);
      this.interactKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.F);
      this.moveLeftKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A);
      this.moveRightKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D);
      this.jumpKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    }
  
    public static getInstance(scene?: Phaser.Scene): InputManager {
      if (!InputManager.instance && scene) {
        InputManager.instance = new InputManager(scene);
      }
  
      if (!InputManager.instance) {
        throw new Error('InputManager not initialized. A scene must be provided the first time.');
      }
  
      return InputManager.instance;
    }
  }
  
  export default InputManager;
  