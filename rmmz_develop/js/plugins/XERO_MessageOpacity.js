/*:
 * @target MZ
 * @plugindesc Uses Window.png normally for message windows and hides the pause arrow.
 * @author XERO
 */
(() => {
    'use strict';

    const applyMessageWindowStyle = window => {
        if (!window) return;
        window.opacity = 255;
        window.backOpacity = 255;
        window.frameVisible = true;
    };

    const _Window_Message_updateBackground = Window_Message.prototype.updateBackground;
    Window_Message.prototype.updateBackground = function() {
        _Window_Message_updateBackground.call(this);
        applyMessageWindowStyle(this);
    };

    const _Window_Message_startMessage = Window_Message.prototype.startMessage;
    Window_Message.prototype.startMessage = function() {
        _Window_Message_startMessage.call(this);
        applyMessageWindowStyle(this);
        this._refreshAllParts();
    };

    const _Window_Message__updatePauseSign = Window_Message.prototype._updatePauseSign;
    Window_Message.prototype._updatePauseSign = function() {
        _Window_Message__updatePauseSign.call(this);
        if (this._pauseSignSprite) {
            this._pauseSignSprite.visible = false;
            this._pauseSignSprite.alpha = 0;
        }
    };
})();
