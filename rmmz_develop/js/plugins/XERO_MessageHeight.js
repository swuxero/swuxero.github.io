/*:
 * @target MZ
 * @plugindesc Slightly reduces the default message window height.
 * @author XERO
 *
 * @param heightOffset
 * @text Height Offset
 * @type number
 * @min 0
 * @default 24
 *
 * @help
 * Lowers the default message window height without changing global font or
 * window settings. Increase Height Offset for a shorter message window.
 */
(() => {
    'use strict';

    const pluginName = 'XERO_MessageHeight';
    const parameters = PluginManager.parameters(pluginName);
    const heightOffset = Number(parameters.heightOffset || 24);

    const _Scene_Message_messageWindowRect = Scene_Message.prototype.messageWindowRect;
    Scene_Message.prototype.messageWindowRect = function() {
        const rect = _Scene_Message_messageWindowRect.call(this);
        rect.height = Math.max(this.calcWindowHeight(3, false), rect.height - heightOffset);
        return rect;
    };
})();
