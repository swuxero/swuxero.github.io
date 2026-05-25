/*:
 * @target MZ
 * @plugindesc Applies the Chilgok_lws font and a custom color to danger messages.
 * @author XERO
 *
 * @command SetDangerMode
 * @text Set Danger Mode
 *
 * @arg mode
 * @type boolean
 * @default true
 *
 * @arg color
 * @type string
 * @default #d9825b
 */
(() => {
    'use strict';

    const FONT_FACE = 'Chilgok_lws';
    const FONT_FILE = 'Chilgok_lws.otf';
    const DEFAULT_COLOR = '#d9825b';

    let dangerMode = false;
    let dangerTextColor = DEFAULT_COLOR;

    window.XERO_DangerText = {
        isActive() {
            return dangerMode;
        },
        color() {
            return dangerTextColor;
        }
    };

    const _Scene_Boot_loadGameFonts = Scene_Boot.prototype.loadGameFonts;
    Scene_Boot.prototype.loadGameFonts = function() {
        _Scene_Boot_loadGameFonts.call(this);
        FontManager.load(FONT_FACE, FONT_FILE);
    };

    PluginManager.registerCommand('XERO_DangerText', 'SetDangerMode', args => {
        const safeArgs = args || {};
        dangerMode = String(safeArgs.mode) === 'true';
        dangerTextColor = String(safeArgs.color || DEFAULT_COLOR);
    });

    const _Window_Message_resetFontSettings = Window_Message.prototype.resetFontSettings;
    Window_Message.prototype.resetFontSettings = function() {
        _Window_Message_resetFontSettings.call(this);
        if (dangerMode) {
            this.contents.fontFace = FONT_FACE;
            this.changeTextColor(dangerTextColor);
        }
    };

    const _Window_Message_resetTextColor = Window_Message.prototype.resetTextColor;
    Window_Message.prototype.resetTextColor = function() {
        if (dangerMode) {
            this.changeTextColor(dangerTextColor);
            this.changeOutlineColor(ColorManager.outlineColor());
            return;
        }
        _Window_Message_resetTextColor.call(this);
    };
})();
