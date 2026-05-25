/*:
 * @target MZ
 * @plugindesc Scales map character sprites with map-specific overrides.
 * @author XERO
 *
 * @param scale
 * @text Default Scale
 * @type number
 * @decimals 1
 * @min 0.5
 * @max 4.0
 * @default 1.5
 */
(() => {
    'use strict';

    const params = PluginManager.parameters('XERO_CharScale');
    const DEFAULT_SCALE = Number(params.scale) || 1.0;
    const ACTOR1_SCALE = 0.7;
    const SCHOOL_ACTOR1_SCALE = 0.65;
    const SCHOOL_SCALE = 0.92;
    const SCHOOL_MAP_IDS = [4];
    const HIDDEN_PLAYER_MAP_IDS = [5, 6];

    const isActor1Character = character => {
        return character && character.characterName && character.characterName() === 'Actor1';
    };

    const characterScale = character => {
        if (isActor1Character(character)) {
            return SCHOOL_MAP_IDS.includes($gameMap.mapId()) ? SCHOOL_ACTOR1_SCALE : ACTOR1_SCALE;
        }
        return SCHOOL_MAP_IDS.includes($gameMap.mapId()) ? SCHOOL_SCALE : DEFAULT_SCALE;
    };

    const isHiddenPlayerMap = () => {
        return HIDDEN_PLAYER_MAP_IDS.includes($gameMap.mapId());
    };

    const shouldHideCharacter = character => {
        return isHiddenPlayerMap() && (
            character === $gamePlayer ||
            character instanceof Game_Follower
        );
    };

    const _Sprite_Character_update = Sprite_Character.prototype.update;
    Sprite_Character.prototype.update = function() {
        _Sprite_Character_update.call(this);
        const scale = characterScale(this._character);
        this.scale.x = scale;
        this.scale.y = scale;
        if (shouldHideCharacter(this._character)) {
            this.visible = false;
        }
    };
})();
