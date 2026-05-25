/*:
 * @target MZ
 * @plugindesc Shows map messages when the mental HP variable decreases or recovers.
 * @author XERO
 */
(() => {
    "use strict";

    const HP_VARIABLE_ID = 1;
    const DAMAGE_COLOR_INDEX = 31;
    const RECOVER_COLOR_INDEX = 30;

    const _Game_Variables_setValue = Game_Variables.prototype.setValue;
    Game_Variables.prototype.setValue = function(variableId, value) {
        const oldValue = this.value(variableId);
        _Game_Variables_setValue.call(this, variableId, value);

        if (variableId !== HP_VARIABLE_ID || !$gameMessage) {
            return;
        }

        const newValue = this.value(variableId);
        const delta = newValue - oldValue;
        if (oldValue > 0 && delta < 0) {
            $gameMessage.add(`\\C[${DAMAGE_COLOR_INDEX}]체력이 ${delta} 깎였습니다.`);
        } else if (oldValue > 0 && delta > 0) {
            $gameMessage.add(`\\C[${RECOVER_COLOR_INDEX}]체력이 +${delta} 회복되었습니다.`);
        }
    };
})();
