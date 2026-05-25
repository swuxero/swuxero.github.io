/*:
 * @target MZ
 * @plugindesc Keeps choice text readable on dark message windows.
 * @author XERO
 */
(() => {
    'use strict';

    Window_ChoiceList.prototype.resetTextColor = function() {
        this.changeTextColor('#ffffff');
        this.changeOutlineColor(ColorManager.outlineColor());
    };
})();
