/**
 * Input Manager
 * ==============
 * Centralizes all input handling - keyboard, gamepad, etc.
 */

import Phaser from 'phaser';

export class InputManager {
  private scene: Phaser.Scene;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private punchKey!: Phaser.Input.Keyboard.Key;      // C - punch (double C = combo)
  private uppercutKey!: Phaser.Input.Keyboard.Key;   // V - uppercut (direct)
  private kickKey!: Phaser.Input.Keyboard.Key;       // X - kick (double X = combo)
  private sidekickKey!: Phaser.Input.Keyboard.Key;   // Z - sidekick (direct)
  private interactKey!: Phaser.Input.Keyboard.Key;
  private debugHurtKey!: Phaser.Input.Keyboard.Key;  // P - debug trigger for hurt animation (face)
  private debugHurtStomachKey!: Phaser.Input.Keyboard.Key;  // O - debug trigger for stomach hurt animation
  private dodgeKey!: Phaser.Input.Keyboard.Key;       // I - dodge
  private matrixDodgeKey!: Phaser.Input.Keyboard.Key; // L - matrix dodge
  private counterDodgeKey!: Phaser.Input.Keyboard.Key; // U - counter-dodge (during enemy warning)

  // Enemy control keys
  private enemyJumpKey!: Phaser.Input.Keyboard.Key;   // Y - enemy jump
  private enemyLeftKey!: Phaser.Input.Keyboard.Key;   // G - enemy run left
  private enemyRightKey!: Phaser.Input.Keyboard.Key;  // J - enemy run right
  private enemyCrouchKey!: Phaser.Input.Keyboard.Key; // H - enemy crouch
  private enemyPunchKey!: Phaser.Input.Keyboard.Key;   // U - enemy punch
  private enemySidekickKey!: Phaser.Input.Keyboard.Key; // K - enemy sidekick

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.setupKeyboardInput();
  }

  private setupKeyboardInput(): void {
    const keyboard = this.scene.input.keyboard;
    if (!keyboard) return;

    this.cursors = keyboard.createCursorKeys();
    this.wasd = {
      W: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
    this.spaceKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.punchKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C);      // C - punch
    this.uppercutKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.V);   // V - uppercut
    this.kickKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);       // X - kick
    this.sidekickKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);   // Z - sidekick
    this.interactKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.debugHurtKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P); // P - debug hurt (face)
    this.debugHurtStomachKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.O); // O - debug hurt (stomach)
    this.dodgeKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.I);     // I - dodge
    this.matrixDodgeKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.L); // L - matrix dodge
    this.counterDodgeKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.U); // U - counter-dodge

    // Enemy controls
    this.enemyJumpKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Y);   // Y - enemy jump
    this.enemyLeftKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.G);   // G - enemy run left
    this.enemyRightKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J);  // J - enemy run right
    this.enemyCrouchKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.H); // H - enemy crouch
    this.enemyPunchKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.U);   // U - enemy punch
    this.enemySidekickKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K); // K - enemy sidekick
  }

  isMovingLeft(): boolean {
    return this.cursors?.left.isDown || this.wasd?.A.isDown || false;
  }

  isMovingRight(): boolean {
    return this.cursors?.right.isDown || this.wasd?.D.isDown || false;
  }

  isMovingUp(): boolean {
    return this.cursors?.up.isDown || this.wasd?.W.isDown || false;
  }

  isMovingDown(): boolean {
    return this.cursors?.down.isDown || this.wasd?.S.isDown || false;
  }

  isJumpPressed(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.spaceKey) ||
      Phaser.Input.Keyboard.JustDown(this.cursors?.up) ||
      Phaser.Input.Keyboard.JustDown(this.wasd?.W);
  }

  isJumpHeld(): boolean {
    return this.spaceKey?.isDown || this.cursors?.up.isDown || this.wasd?.W.isDown || false;
  }

  // C key - punch (double C = punch + uppercut combo)
  isPunchPressed(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.punchKey);
  }

  // V key - direct uppercut
  isUppercutPressed(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.uppercutKey);
  }

  // X key - kick (double X = kick + sidekick combo)
  isKickPressed(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.kickKey);
  }

  // Z key - direct sidekick
  isSidekickPressed(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.sidekickKey);
  }

  isInteractPressed(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.interactKey);
  }

  // P key - debug trigger for hurt animation (temporary, for testing without enemies)
  isDebugHurtPressed(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.debugHurtKey);
  }

  // O key - debug trigger for stomach hurt animation (temporary, for testing without enemies)
  isDebugHurtStomachPressed(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.debugHurtStomachKey);
  }

  // I key - dodge
  isDodgePressed(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.dodgeKey);
  }

  // L key - matrix dodge
  isMatrixDodgePressed(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.matrixDodgeKey);
  }

  // U key - counter-dodge (during enemy attack warning)
  isCounterDodgePressed(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.counterDodgeKey);
  }

  getHorizontalAxis(): number {
    let axis = 0;
    if (this.isMovingLeft()) axis -= 1;
    if (this.isMovingRight()) axis += 1;
    return axis;
  }

  // Enemy controls
  isEnemyMovingLeft(): boolean {
    return this.enemyLeftKey?.isDown || false;
  }

  isEnemyMovingRight(): boolean {
    return this.enemyRightKey?.isDown || false;
  }

  isEnemyJumpPressed(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.enemyJumpKey);
  }

  isEnemyCrouchPressed(): boolean {
    return this.enemyCrouchKey?.isDown || false;
  }

  isEnemyPunchPressed(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.enemyPunchKey);
  }

  isEnemySidekickPressed(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.enemySidekickKey);
  }
}
