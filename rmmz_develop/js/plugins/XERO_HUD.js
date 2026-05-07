/*:
 * @target MZ
 * @plugindesc 좌상단 HUD — 주인공 페이스 / 이름 / 심리 HP 바 (변수 1번)
 * @author XERO
 */
(() => {
    'use strict';

    const HP_VAR = 1;
    const HP_MAX = 100;

    const HUD = { x: 8, y: 8, w: 284, h: 62 };
    const BOX = { x: 4, y: 4, size: 54 };
    const TX  = BOX.x + BOX.size + 10;                 // 68
    const BAR = { x: TX + 26, y: 36, w: 134, h: 14 }; // HP 바 영역

    function border(bmp, x, y, w, h, color) {
        bmp.fillRect(x,     y,     w, 1,   color);
        bmp.fillRect(x,     y+h-1, w, 1,   color);
        bmp.fillRect(x,     y+1,   1, h-2, color);
        bmp.fillRect(x+w-1, y+1,   1, h-2, color);
    }

    const _loadFonts = Scene_Boot.prototype.loadGameFonts;
    Scene_Boot.prototype.loadGameFonts = function() {
        _loadFonts.call(this);
        FontManager.load('LINESeedKR-Th', 'LINESeedKR-Th.otf');
    };

    class Sprite_XeroHud extends Sprite {
        initialize() {
            super.initialize();
            this.x = HUD.x;
            this.y = HUD.y;
            this.bitmap  = new Bitmap(HUD.w, HUD.h);
            this._lastHp = -1;
            this._faceBmp = null;
            this._loadFace();
        }

        _loadFace() {
            const actor = $gameParty.leader();
            if (!actor || !actor.faceName()) { this.refresh(); return; }
            this._faceBmp = ImageManager.loadFace(actor.faceName());
            this._faceBmp.addLoadListener(() => this.refresh());
        }

        update() {
            super.update();
            this.visible = $gameMap.mapId() !== 1;
            if (!this.visible) return;

            const hp = $gameVariables.value(HP_VAR);
            if (hp !== this._lastHp) {
                this._lastHp = hp;
                this.refresh();
            }
        }

        refresh() {
            const bmp  = this.bitmap;
            const hp   = $gameVariables.value(HP_VAR);
            const actor = $gameParty.leader();

            bmp.clear();

            // HUD 배경 & 외곽
            bmp.fillRect(0, 0, HUD.w, HUD.h, 'rgba(15,14,23,0.88)');
            border(bmp, 0, 0, HUD.w, HUD.h, '#7b5ea7');

            // 페이스 박스
            bmp.fillRect(BOX.x, BOX.y, BOX.size, BOX.size, 'rgba(30,25,50,0.9)');
            border(bmp, BOX.x, BOX.y, BOX.size, BOX.size, '#7b5ea7');

            if (actor) {
                if (this._faceBmp && actor.faceName()) {
                    const fi = actor.faceIndex();
                    bmp.blt(this._faceBmp,
                        (fi % 4) * 144, Math.floor(fi / 4) * 144, 144, 144,
                        BOX.x + 3, BOX.y + 3, BOX.size - 6, BOX.size - 6);
                } else {
                    bmp.fontFace  = $gameSystem.mainFontFace();
                    bmp.fontSize  = 26;
                    bmp.textColor = '#a78bca';
                    bmp.drawText(actor.name().charAt(0),
                        BOX.x, BOX.y + 10, BOX.size, BOX.size - 10, 'center');
                }

                // 이름
                bmp.fontFace  = 'LINESeedKR-Th';
                bmp.fontSize  = 17;
                bmp.textColor = '#ffffff';
                bmp.drawText(actor.name(), TX, 6, 160, 22);
            }

            // HP 레이블
            bmp.fontFace  = 'LINESeedKR-Th';
            bmp.fontSize  = 13;
            bmp.textColor = '#8888aa';
            bmp.drawText('HP', TX, 32, 24, 18);

            // HP 바 트랙 (어두운 배경)
            bmp.fillRect(BAR.x, BAR.y, BAR.w, BAR.h, 'rgba(0,0,0,0.55)');

            // HP 채움 (빨간 그라데이션)
            const ratio  = Math.max(0, Math.min(1, hp / HP_MAX));
            const fillW  = Math.floor(BAR.w * ratio);
            if (fillW > 0) {
                bmp.gradientFillRect(BAR.x, BAR.y, fillW, BAR.h, '#ff7070', '#cc2020', false);
            }

            // HP 바 테두리
            border(bmp, BAR.x, BAR.y, BAR.w, BAR.h, '#504060');

            // HP 수치 텍스트
            bmp.fontSize  = 13;
            bmp.textColor = '#ffffff';
            bmp.drawText(`${hp}/${HP_MAX}`,
                BAR.x + BAR.w + 4, 32, 48, 18, 'right');
        }
    }

    const _createAllWindows = Scene_Map.prototype.createAllWindows;
    Scene_Map.prototype.createAllWindows = function() {
        _createAllWindows.call(this);
        this._xeroHud = new Sprite_XeroHud();
        this.addChild(this._xeroHud);
    };

})();
