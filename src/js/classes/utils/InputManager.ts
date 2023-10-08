class InputManager {
    public static instance: InputManager;

    public cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    public debugKey!: Phaser.Input.Keyboard.Key;
    public resetKey!: Phaser.Input.Keyboard.Key;
    public interactKey!: Phaser.Input.Keyboard.Key;
    public crouchKey!: Phaser.Input.Keyboard.Key;
    public moveLeftKey!: Phaser.Input.Keyboard.Key;
    public moveRightKey!: Phaser.Input.Keyboard.Key;
    public jumpKey!: Phaser.Input.Keyboard.Key;
    public pauseKey!: Phaser.Input.Keyboard.Key;
    public switchKey1!: Phaser.Input.Keyboard.Key;
    public switchKey2!: Phaser.Input.Keyboard.Key;
    public switchKey3!: Phaser.Input.Keyboard.Key;
    public attackKey!: Phaser.Input.Keyboard.Key;
    public specialAttackKey1!: Phaser.Input.Keyboard.Key;
    public specialAttackKey2!: Phaser.Input.Keyboard.Key;
    public reloadKey!: Phaser.Input.Keyboard.Key;

    public keysDisabled: boolean = false;

    public constructor(scene: Phaser.Scene) {
        this.initializeKeys(scene);
    }

    private initializeKeys(scene: Phaser.Scene) {
        this.cursors = scene.input.keyboard!.createCursorKeys();
        this.debugKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        this.resetKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ZERO);
        this.reloadKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        this.interactKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.F);
        this.moveLeftKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.crouchKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.moveRightKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.jumpKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.pauseKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.P);
        this.switchKey1 = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
        this.switchKey2 = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
        this.switchKey3 = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.THREE);
        this.attackKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.DELETE);
        this.specialAttackKey1 = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.G);
        this.specialAttackKey2 = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.INSERT);
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

    public updateInput(scene: Phaser.Scene): void {
        this.initializeKeys(scene);
    }

    public enableInput() {
        this.keysDisabled = false;
    }

    public disableInput() {
        this.keysDisabled = true;
    }

    public isInputDisabled() {
        return this.keysDisabled;
    }
}

export default InputManager;
