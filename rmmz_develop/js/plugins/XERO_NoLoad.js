/*:
 * @target MZ
 * @plugindesc Keeps only New Game on the title screen and disables touch UI menu buttons.
 * @author XERO
 */
(() => {
    'use strict';

    ConfigManager.touchUI = false;

    const _ConfigManager_applyData = ConfigManager.applyData;
    ConfigManager.applyData = function(config) {
        _ConfigManager_applyData.call(this, config);
        this.touchUI = false;
    };

    const _Window_TitleCommand_makeCommandList = Window_TitleCommand.prototype.makeCommandList;
    Window_TitleCommand.prototype.makeCommandList = function() {
        _Window_TitleCommand_makeCommandList.call(this);
        this._list = this._list.filter(cmd => cmd.symbol === 'newGame');
    };

    Scene_Title.prototype.commandWindowRect = function() {
        const offsetX = $dataSystem.titleCommandWindow.offsetX;
        const offsetY = $dataSystem.titleCommandWindow.offsetY;
        const ww = this.mainCommandWidth();
        const wh = this.calcWindowHeight(1, true);
        const wx = (Graphics.boxWidth - ww) / 2 + offsetX;
        const wy = Graphics.boxHeight - wh - 96 + offsetY;
        return new Rectangle(wx, wy, ww, wh);
    };

    Scene_Map.prototype.createButtons = function() {};
    Scene_MenuBase.prototype.createButtons = function() {};
    Scene_Battle.prototype.createButtons = function() {};

    Scene_Map.prototype.isMenuEnabled = function() { return false; };
})();
