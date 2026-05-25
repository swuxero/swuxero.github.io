/*:
 * @target MZ
 * @plugindesc Custom HUD for the protagonist profile and mental HP variable.
 * @author XERO
 */
(() => {
    "use strict";

    const HP_VAR = 1;
    const HP_MAX = 100;
    const RECOVERED_HP = 70;
    const PROFILE_RECOVERED = "프로필_체력100";
    const PROFILE_LOW = "프로필_체력0";
    const HP_IMAGE_NAMES = ["HP_20", "HP_35", "HP_50", "HP_70", "HP_100"];

    const HUD = { x: 8, y: 8, w: 300, h: 92 };
    const BOX = { x: 7, y: 7, size: 70 };
    const TX = BOX.x + BOX.size + 14;
    const BAR = { x: TX, y: 48, w: 204, h: 30, scale: 2 };

    const COLORS = {
        panel: "rgba(16, 17, 25, 0.94)",
        panelEdge: "#d8d9e6",
        panelShadow: "rgba(0, 0, 0, 0.45)",
        inner: "rgba(9, 10, 16, 0.84)",
        innerEdge: "#8e91a5",
        text: "#ffffff"
    };

    function border(bmp, x, y, w, h, color) {
        bmp.fillRect(x, y, w, 1, color);
        bmp.fillRect(x, y + h - 1, w, 1, color);
        bmp.fillRect(x, y + 1, 1, h - 2, color);
        bmp.fillRect(x + w - 1, y + 1, 1, h - 2, color);
    }

    function bltPixelated(target, source, sx, sy, sw, sh, dx, dy, dw, dh) {
        const context = target.context;
        const previous = context.imageSmoothingEnabled;
        context.imageSmoothingEnabled = false;
        target.blt(source, sx, sy, sw, sh, dx, dy, dw, dh);
        context.imageSmoothingEnabled = previous;
    }

    function hpValue() {
        return Math.max(0, Math.min(HP_MAX, Number($gameVariables.value(HP_VAR) || 0)));
    }

    function isRecoveredHp(hp) {
        return hp >= RECOVERED_HP;
    }

    function hpImageName(hp) {
        if (hp >= 100) return "HP_100";
        if (hp >= 70) return "HP_70";
        if (hp >= 50) return "HP_50";
        if (hp >= 35) return "HP_35";
        return "HP_20";
    }

    function shouldHideHud() {
        if (!$gameMap || $gameMap.mapId() === 1) {
            return true;
        }
        if ($gameScreen && $gameScreen.brightness && $gameScreen.brightness() < 255) {
            return true;
        }
        if (window.XERO_ObjectiveHintOverlayActive) {
            return true;
        }
        if ($gameSwitches && $gameSwitches.value(17)) {
            return true;
        }
        if ($gameScreen) {
            const picture = $gameScreen.picture(1);
            const name = picture && picture._name;
            if (name === "정면" || name === "주인공_정면" || name === "credit") {
                return true;
            }
        }
        return false;
    }

    const _loadFonts = Scene_Boot.prototype.loadGameFonts;
    Scene_Boot.prototype.loadGameFonts = function() {
        _loadFonts.call(this);
        FontManager.load("LINESeedKR-Th", "LINESeedKR-Th.otf");
    };

    class Sprite_XeroHud extends Sprite {
        initialize() {
            super.initialize();
            this.x = HUD.x;
            this.y = HUD.y;
            this.bitmap = new Bitmap(HUD.w, HUD.h);
            this._lastHp = -1;
            this._lastProfileName = "";
            this._lastHpImageName = "";
            this._profiles = {
                [PROFILE_RECOVERED]: ImageManager.loadPicture(PROFILE_RECOVERED),
                [PROFILE_LOW]: ImageManager.loadPicture(PROFILE_LOW)
            };
            this._hpImages = {};
            for (const name of HP_IMAGE_NAMES) {
                this._hpImages[name] = ImageManager.loadPicture(name);
            }
            [...Object.values(this._profiles), ...Object.values(this._hpImages)].forEach(bitmap => {
                bitmap.addLoadListener(() => this.refresh());
            });
        }

        update() {
            super.update();
            this.visible = !shouldHideHud();
            if (!this.visible) return;

            const hp = hpValue();
            const profileName = isRecoveredHp(hp) ? PROFILE_RECOVERED : PROFILE_LOW;
            const barName = hpImageName(hp);
            if (
                hp !== this._lastHp ||
                profileName !== this._lastProfileName ||
                barName !== this._lastHpImageName
            ) {
                this._lastHp = hp;
                this._lastProfileName = profileName;
                this._lastHpImageName = barName;
                this.refresh();
            }
        }

        refresh() {
            const bmp = this.bitmap;
            const hp = hpValue();
            const profileName = isRecoveredHp(hp) ? PROFILE_RECOVERED : PROFILE_LOW;
            const profile = this._profiles[profileName];
            const hpImage = this._hpImages[hpImageName(hp)];

            bmp.clear();

            bmp.fillRect(3, 4, HUD.w - 3, HUD.h - 4, COLORS.panelShadow);
            bmp.fillRect(0, 0, HUD.w - 4, HUD.h - 4, COLORS.panel);
            border(bmp, 0, 0, HUD.w - 4, HUD.h - 4, COLORS.panelEdge);
            bmp.fillRect(1, 1, HUD.w - 6, 1, "rgba(255,255,255,0.22)");

            bmp.fillRect(BOX.x, BOX.y, BOX.size, BOX.size, COLORS.inner);
            border(bmp, BOX.x, BOX.y, BOX.size, BOX.size, COLORS.innerEdge);

            if (profile && profile.isReady()) {
                bmp.blt(
                    profile,
                    0,
                    0,
                    profile.width,
                    profile.height,
                    BOX.x + 4,
                    BOX.y + 4,
                    BOX.size - 8,
                    BOX.size - 8
                );
            }

            bmp.fontFace = "LINESeedKR-Th";
            bmp.fontSize = 22;
            bmp.textColor = COLORS.text;
            bmp.outlineColor = "rgba(0,0,0,0.8)";
            bmp.outlineWidth = 3;
            bmp.drawText("유진", TX, 12, 72, 28);

            bmp.fontSize = 14;
            bmp.outlineWidth = 3;
            bmp.drawText(`HP ${hp}`, TX + 98, 17, 50, 22, "left");

            if (hpImage && hpImage.isReady()) {
                bltPixelated(
                    bmp,
                    hpImage,
                    0,
                    0,
                    hpImage.width,
                    hpImage.height,
                    BAR.x,
                    BAR.y,
                    hpImage.width * BAR.scale,
                    hpImage.height * BAR.scale
                );
            }

        }
    }

    const _createAllWindows = Scene_Map.prototype.createAllWindows;
    Scene_Map.prototype.createAllWindows = function() {
        _createAllWindows.call(this);
        this._xeroHud = new Sprite_XeroHud();
        this.addChild(this._xeroHud);
    };
})();
