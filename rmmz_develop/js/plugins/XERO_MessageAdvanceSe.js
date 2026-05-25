/*:
 * @target MZ
 * @plugindesc Plays a subtle sound exactly when the player advances a message.
 * @author XERO
 */

(() => {
    "use strict";

    const SE = { name: "Cursor3", pan: 0, pitch: 105, volume: 24 };
    let lastFrame = -1;

    function playAdvanceSe() {
        if (Graphics.frameCount === lastFrame) {
            return;
        }
        AudioManager.playSe(SE);
        lastFrame = Graphics.frameCount;
    }

    function messageWindow() {
        const scene = SceneManager._scene;
        return scene && scene._messageWindow;
    }

    function canAdvanceMessageNow() {
        const win = messageWindow();
        return (
            win &&
            win.pause &&
            win.visible &&
            !win.isAnySubWindowActive()
        );
    }

    function isAdvanceKey(event) {
        const buttonName = Input.keyMapper[event.keyCode];
        return buttonName === "ok" || buttonName === "cancel";
    }

    function isAdvanceInput() {
        return (
            Input.isTriggered("ok") ||
            Input.isTriggered("cancel") ||
            TouchInput.isTriggered()
        );
    }

    const _Window_Message_updateInput = Window_Message.prototype.updateInput;

    Window_Message.prototype.updateInput = function() {
        const shouldPlay = this.pause && isAdvanceInput() && !this.isAnySubWindowActive();
        if (shouldPlay) {
            playAdvanceSe();
        }
        return _Window_Message_updateInput.call(this);
    };

    const _Input_onKeyDown = Input._onKeyDown;

    Input._onKeyDown = function(event) {
        if (!event.repeat && isAdvanceKey(event) && canAdvanceMessageNow()) {
            playAdvanceSe();
        }
        _Input_onKeyDown.call(this, event);
    };

    const _TouchInput_onTrigger = TouchInput._onTrigger;

    TouchInput._onTrigger = function(x, y) {
        if (canAdvanceMessageNow()) {
            playAdvanceSe();
        }
        _TouchInput_onTrigger.call(this, x, y);
    };

    function choiceWindowActive() {
        const scene = SceneManager._scene;
        const win = scene && scene._choiceListWindow;
        return !!(win && win.visible && win.active);
    }

    const _SoundManager_playCancel = SoundManager.playCancel;
    const _SoundManager_playBuzzer = SoundManager.playBuzzer;

    SoundManager.playCancel = function() {
        if (choiceWindowActive()) {
            this.playCursor();
        } else {
            _SoundManager_playCancel.call(this);
        }
    };

    SoundManager.playBuzzer = function() {
        if (choiceWindowActive()) {
            this.playCursor();
        } else {
            _SoundManager_playBuzzer.call(this);
        }
    };
})();
