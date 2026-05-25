/*:
 * @target MZ
 * @plugindesc Sets readable message colors and a highlight color for official info.
 * @author XERO
 */
(() => {
    'use strict';

    const OFFICIAL_BLUE_INDEX = 30;
    const OFFICIAL_BLUE = '#55e6ff';
    const HP_DAMAGE_PINK_INDEX = 31;
    const HP_DAMAGE_PINK = '#ff4fd8';
    const EVIDENCE_GOLD_INDEX = 32;
    const EVIDENCE_GOLD = '#d8a24a';
    const DEFAULT_WHITE_INDEX = 33;
    const DEFAULT_WHITE = '#ffffff';
    const MONOLOGUE_COLOR = '#fff3c4';

    const _ColorManager_textColor = ColorManager.textColor;
    ColorManager.textColor = function(n) {
        if (Number(n) === OFFICIAL_BLUE_INDEX) {
            return OFFICIAL_BLUE;
        }
        if (Number(n) === HP_DAMAGE_PINK_INDEX) {
            return HP_DAMAGE_PINK;
        }
        if (Number(n) === EVIDENCE_GOLD_INDEX) {
            return EVIDENCE_GOLD;
        }
        if (Number(n) === DEFAULT_WHITE_INDEX) {
            return DEFAULT_WHITE;
        }
        return _ColorManager_textColor.call(this, n);
    };

    Window_Message.prototype.resetTextColor = function() {
        const speakerName = $gameMessage ? $gameMessage.speakerName() : '';
        this.changeTextColor(speakerName ? '#ffffff' : MONOLOGUE_COLOR);
        this.changeOutlineColor(ColorManager.outlineColor());
    };

    Window_NameBox.prototype.resetTextColor = function() {
        this.changeTextColor('#ffffff');
        this.changeOutlineColor(ColorManager.outlineColor());
    };
})();
