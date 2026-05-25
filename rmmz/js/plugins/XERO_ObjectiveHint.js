/*:
 * @target MZ
 * @plugindesc Shows blinking objective hints and input-driven overlay narration.
 * @author XERO
 *
 * @command ShowOverlayText
 * @text Show Overlay Text
 * @arg text
 * @type multiline_string
 * @arg position
 * @type select
 * @option top
 * @option center
 * @option bottom
 * @default center
 * @arg duration
 * @type number
 * @default 150
 * @arg fontSize
 * @type number
 * @default 30
 * @arg blackout
 * @type boolean
 * @default false
 * @arg blackoutOpacity
 * @type number
 * @default 210
 * @arg waitForInput
 * @type boolean
 * @default false
 * @arg fadeInFrames
 * @type number
 * @default 24
 * @arg y
 * @type number
 * @default -1
 *
 * @command WaitForInput
 * @text Wait For Input
 * @arg inputDelay
 * @type number
 * @default 14
 */
(() => {
    'use strict';

    const BED_HINT = '침대로 이동하자';
    const SCHOOL_HINT = '우리학교에 도움을 줄 수 있는 장소가 있을까? 칠판에 부착된 포스터를 확인해보자';
    const RESTAURANT_HINT = '수아가 어딨을까? 수아한테 말을 걸어보자!';
    const overlayState = {
        text: '',
        position: 'center',
        duration: 0,
        maxDuration: 0,
        fontSize: 30,
        blackout: false,
        blackoutOpacity: 210,
        waitForInput: false,
        waiting: false,
        inputDelay: 0,
        age: 0,
        fadeInFrames: 24,
        y: -1
    };
    const inputWaitState = {
        waiting: false,
        inputDelay: 0
    };

    function clearOverlay() {
        overlayState.text = '';
        overlayState.duration = 0;
        overlayState.maxDuration = 0;
        overlayState.waitForInput = false;
        overlayState.waiting = false;
        overlayState.inputDelay = 0;
        overlayState.age = 0;
        overlayState.fadeInFrames = 24;
        overlayState.y = -1;
        window.XERO_ObjectiveHintOverlayActive = false;
    }

    PluginManager.registerCommand('XERO_ObjectiveHint', 'ShowOverlayText', function(args) {
        const duration = Number(args.duration || 150);
        const waitForInput = String(args.waitForInput || 'false') === 'true';
        overlayState.text = String(args.text || '');
        overlayState.position = String(args.position || 'center');
        overlayState.duration = waitForInput ? Math.max(duration, 999999) : duration;
        overlayState.maxDuration = overlayState.duration;
        overlayState.fontSize = Number(args.fontSize || 30);
        overlayState.blackout = String(args.blackout || 'false') === 'true';
        overlayState.blackoutOpacity = Number(args.blackoutOpacity || 210);
        overlayState.waitForInput = waitForInput;
        overlayState.waiting = waitForInput;
        overlayState.inputDelay = waitForInput ? 14 : 0;
        overlayState.age = 0;
        overlayState.fadeInFrames = Number(args.fadeInFrames || 24);
        overlayState.y = Number(args.y || -1);
        window.XERO_ObjectiveHintOverlayActive = true;
        if (waitForInput && this && this.setWaitMode) {
            this.setWaitMode('xeroOverlayInput');
        }
    });

    PluginManager.registerCommand('XERO_ObjectiveHint', 'ClearOverlayText', clearOverlay);

    PluginManager.registerCommand('XERO_ObjectiveHint', 'WaitForInput', function(args) {
        inputWaitState.waiting = true;
        inputWaitState.inputDelay = Number(args.inputDelay || 14);
        if (this && this.setWaitMode) {
            this.setWaitMode('xeroInputOnly');
        }
    });

    const _Game_Interpreter_updateWaitMode = Game_Interpreter.prototype.updateWaitMode;
    Game_Interpreter.prototype.updateWaitMode = function() {
        if (this._waitMode === 'xeroInputOnly') {
            inputWaitState.inputDelay = Math.max(0, inputWaitState.inputDelay - 1);
            if (inputWaitState.inputDelay <= 0 && (Input.isTriggered('ok') || TouchInput.isTriggered())) {
                inputWaitState.waiting = false;
                this._waitMode = '';
                return false;
            }
            return true;
        }
        if (this._waitMode === 'xeroOverlayInput') {
            if (overlayState.waiting) {
                return true;
            }
            this._waitMode = '';
            return false;
        }
        return _Game_Interpreter_updateWaitMode.call(this);
    };

    function isSelfSwitchOn(mapId, eventId, letter) {
        return $gameSelfSwitches.value([mapId, eventId, letter]);
    }

    function currentHint() {
        if (!$gameMap || !$gameSwitches || !$gameSelfSwitches) {
            return '';
        }
        if ($gameMap.isEventRunning() || window.XERO_ObjectiveHintOverlayActive) {
            return '';
        }

        const mapId = $gameMap.mapId();
        if (mapId === 2 && isSelfSwitchOn(2, 1, 'A') && !isSelfSwitchOn(2, 2, 'A')) {
            return RESTAURANT_HINT;
        }

        if (mapId === 3 && isSelfSwitchOn(3, 1, 'A') && !isSelfSwitchOn(3, 2, 'A')) {
            return BED_HINT;
        }

        if (mapId === 4 && isSelfSwitchOn(4, 1, 'A') && !$gameSwitches.value(9)) {
            return SCHOOL_HINT;
        }

        return '';
    }

    class Sprite_XeroObjectiveHint extends Sprite {
        initialize() {
            super.initialize();
            this.bitmap = new Bitmap(Graphics.width, 84);
            this.x = 0;
            this.y = Graphics.height - 112;
            this.z = 20;
            this._lastText = null;
            this._frame = 0;
        }

        update() {
            super.update();
            this._frame += 1;
            const text = currentHint();
            if (text !== this._lastText || this._frame % 24 === 0) {
                this._lastText = text;
                this.refresh(text);
            }
            this.visible = !!text && !$gameMessage.isBusy();
            if (this.visible) {
                this.opacity = 155 + Math.floor((Math.sin(this._frame / 14) + 1) * 50);
            }
        }

        refresh(text) {
            const bmp = this.bitmap;
            bmp.clear();
            if (!text) return;

            bmp.fontFace = $gameSystem.mainFontFace();
            bmp.fontSize = text.length > 28 ? 20 : 24;
            bmp.outlineWidth = 4;
            bmp.outlineColor = 'rgba(0,0,0,0.9)';
            bmp.textColor = '#ffffff';

            const paddingX = 18;
            const paddingY = 10;
            const textWidth = Math.min(Graphics.width - 64, Math.ceil(bmp.measureTextWidth(text)) + paddingX * 2);
            const boxWidth = Math.max(260, textWidth);
            const boxHeight = 46;
            const x = Math.floor((Graphics.width - boxWidth) / 2);
            const y = 18;

            bmp.fillRect(x, y, boxWidth, boxHeight, 'rgba(0,0,0,0.72)');
            bmp.strokeRect(x, y, boxWidth, boxHeight, 'rgba(255,255,255,0.35)');
            bmp.drawText(text, x + paddingX, y + paddingY - 2, boxWidth - paddingX * 2, 28, 'center');
        }
    }

    class Sprite_XeroOverlayText extends Sprite {
        initialize() {
            super.initialize();
            this.bitmap = new Bitmap(Graphics.width, Graphics.height);
            this.z = 30;
            this._lastKey = '';
        }

        update() {
            super.update();
            if (overlayState.text && overlayState.duration > 0) {
                overlayState.age += 1;
                if (overlayState.waitForInput) {
                    overlayState.inputDelay = Math.max(0, overlayState.inputDelay - 1);
                    if (overlayState.inputDelay <= 0 && (Input.isTriggered('ok') || TouchInput.isTriggered())) {
                        clearOverlay();
                    }
                } else {
                    overlayState.duration -= 1;
                }
            }
            window.XERO_ObjectiveHintOverlayActive = !!overlayState.text && overlayState.duration > 0;

            const key = [
                overlayState.text,
                overlayState.position,
                overlayState.duration,
                overlayState.fontSize,
                overlayState.blackout,
                overlayState.blackoutOpacity,
                overlayState.waitForInput,
                overlayState.age,
                overlayState.fadeInFrames,
                overlayState.y
            ].join('|');

            if (key !== this._lastKey) {
                this._lastKey = key;
                this.refresh();
            }
        }

        refresh() {
            const bmp = this.bitmap;
            bmp.clear();
            if (!overlayState.text || overlayState.duration <= 0) {
                return;
            }

            const fadeIn = Math.min(1, overlayState.age / Math.max(1, overlayState.fadeInFrames));
            const fadeOut = overlayState.waitForInput ? 1 : Math.min(1, overlayState.duration / 30);
            const alpha = Math.max(0, Math.min(fadeIn, fadeOut));

            if (overlayState.blackout) {
                const opacity = Math.floor(overlayState.blackoutOpacity * alpha);
                bmp.fillRect(0, 0, Graphics.width, Graphics.height, `rgba(0,0,0,${opacity / 255})`);
            }

            const lines = overlayState.text.split('\n');
            const lineHeight = overlayState.fontSize + 11;
            const totalHeight = lines.length * lineHeight;
            let y = Math.floor((Graphics.height - totalHeight) / 2);
            if (overlayState.position === 'top') {
                y = 92;
            } else if (overlayState.position === 'bottom') {
                y = Graphics.height - totalHeight - 88;
            }
            if (overlayState.y >= 0) {
                y = overlayState.y;
            }

            bmp.fontFace = $gameSystem.mainFontFace();
            bmp.fontSize = overlayState.fontSize;
            bmp.textColor = `rgba(255,255,255,${alpha})`;
            bmp.outlineColor = `rgba(0,0,0,${alpha})`;
            bmp.outlineWidth = 4;

            lines.forEach((line, index) => {
                bmp.drawText(line, 48, y + index * lineHeight, Graphics.width - 96, lineHeight, 'center');
            });
        }
    }

    const _Scene_Map_createDisplayObjects = Scene_Map.prototype.createDisplayObjects;
    Scene_Map.prototype.createDisplayObjects = function() {
        _Scene_Map_createDisplayObjects.call(this);
        this._xeroOverlayText = new Sprite_XeroOverlayText();
        this.addChild(this._xeroOverlayText);
        this._xeroObjectiveHint = new Sprite_XeroObjectiveHint();
        this.addChild(this._xeroObjectiveHint);
    };
})();
