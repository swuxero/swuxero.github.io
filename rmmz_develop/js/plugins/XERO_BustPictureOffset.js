/*:
 * @target MZ
 * @plugindesc Raises dialogue bust pictures and clears/suppresses them around message scenes.
 * @author XERO
 *
 * @param yOffset
 * @text Y Offset
 * @type number
 * @min 0
 * @default 36
 *
 * @param bustPictureIds
 * @text Bust Picture IDs
 * @type string
 * @default 10,11
 *
 * @param focusPictureNames
 * @text Focus Picture Names
 * @type string
 * @default selfie,phone
 *
 * @help
 * Picture IDs 10 and 11 are used for dialogue busts in this project.
 * This plugin:
 * - raises those bust pictures slightly,
 * - erases them before monologue/system messages,
 * - suppresses them while focus images such as selfie/phone are visible.
 */
(() => {
    'use strict';

    const pluginName = 'XERO_BustPictureOffset';
    const parameters = PluginManager.parameters(pluginName);
    const yOffset = Number(parameters.yOffset || 36);
    const bustIds = String(parameters.bustPictureIds || '10,11')
        .split(',')
        .map(id => Number(id.trim()))
        .filter(id => Number.isFinite(id));
    const focusNames = String(parameters.focusPictureNames || 'selfie,phone')
        .split(',')
        .map(name => name.trim())
        .filter(Boolean);

    const isBustId = pictureId => bustIds.includes(Number(pictureId));
    const isFocusPicture = name => focusNames.includes(String(name));

    Game_Screen.prototype.xeroBustFocusActive = function() {
        return this._xeroBustFocusActive === true;
    };

    Game_Screen.prototype.xeroEraseBustPictures = function() {
        for (const pictureId of bustIds) {
            this.erasePicture(pictureId);
        }
    };

    const _Game_Screen_clearPictures = Game_Screen.prototype.clearPictures;
    Game_Screen.prototype.clearPictures = function() {
        _Game_Screen_clearPictures.call(this);
        this._xeroBustFocusActive = false;
    };

    const _Game_Screen_showPicture = Game_Screen.prototype.showPicture;
    Game_Screen.prototype.showPicture = function(
        pictureId, name, origin, x, y, scaleX, scaleY, opacity, blendMode
    ) {
        if (isFocusPicture(name)) {
            this._xeroBustFocusActive = true;
            this.xeroEraseBustPictures();
        }

        if (isBustId(pictureId)) {
            if (this.xeroBustFocusActive()) {
                this.erasePicture(pictureId);
                return;
            }
            y -= yOffset;
        }

        _Game_Screen_showPicture.call(
            this,
            pictureId,
            name,
            origin,
            x,
            y,
            scaleX,
            scaleY,
            opacity,
            blendMode
        );
    };

    const _Game_Screen_erasePicture = Game_Screen.prototype.erasePicture;
    Game_Screen.prototype.erasePicture = function(pictureId) {
        const picture = this.picture(pictureId);
        const pictureName = picture ? picture.name() : '';
        _Game_Screen_erasePicture.call(this, pictureId);
        if (isFocusPicture(pictureName)) {
            this._xeroBustFocusActive = false;
        }
    };

    const _Game_Interpreter_command101 = Game_Interpreter.prototype.command101;
    Game_Interpreter.prototype.command101 = function(params) {
        const speakerName = params ? String(params[4] || '') : '';
        if (speakerName === '' && $gameScreen && !$gameScreen.xeroBustFocusActive()) {
            $gameScreen.xeroEraseBustPictures();
        }
        return _Game_Interpreter_command101.call(this, params);
    };
})();
