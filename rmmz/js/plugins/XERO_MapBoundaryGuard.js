/*:
 * @target MZ
 * @plugindesc Prevents the player from walking onto the outer map boundary.
 * @author XERO
 */
(() => {
    'use strict';

    const hasMapTile = (x, y) => {
        return $gameMap.layeredTiles(x, y).some(tileId => tileId > 0);
    };

    const isInsidePlayableArea = (x, y) => {
        if (!$gameMap || !$gameMap.isValid(x, y)) {
            return false;
        }
        if (x <= 0 || y <= 0 || x >= $gameMap.width() - 1 || y >= $gameMap.height() - 1) {
            return false;
        }
        return hasMapTile(x, y);
    };

    const _Game_Player_canPass = Game_Player.prototype.canPass;
    Game_Player.prototype.canPass = function(x, y, d) {
        const x2 = $gameMap.roundXWithDirection(x, d);
        const y2 = $gameMap.roundYWithDirection(y, d);
        if (!isInsidePlayableArea(x2, y2)) {
            return false;
        }
        return _Game_Player_canPass.call(this, x, y, d);
    };

    const _Game_Player_canPassDiagonally = Game_Player.prototype.canPassDiagonally;
    Game_Player.prototype.canPassDiagonally = function(x, y, horz, vert) {
        const x2 = $gameMap.roundXWithDirection(x, horz);
        const y2 = $gameMap.roundYWithDirection(y, vert);
        if (!isInsidePlayableArea(x2, y2)) {
            return false;
        }
        return _Game_Player_canPassDiagonally.call(this, x, y, horz, vert);
    };
})();
