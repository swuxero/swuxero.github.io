/*:
 * @target MZ
 * @plugindesc 타이틀 커맨드창: LINESeedKR BD 폰트 / 흰색 / 22px / 커서 깜빡임 제거
 * @author XERO
 */
(() => {
    // 부팅 시 폰트 로드
    const _loadGameFonts = Scene_Boot.prototype.loadGameFonts;
    Scene_Boot.prototype.loadGameFonts = function() {
        _loadGameFonts.call(this);
        FontManager.load('LINESeedKR-Th', 'LINESeedKR-Th.otf');
    };

    // 폰트 패밀리 + 크기
    const _resetFont = Window_TitleCommand.prototype.resetFontSettings;
    Window_TitleCommand.prototype.resetFontSettings = function() {
        _resetFont.call(this);
        this.contents.fontFace = 'LINESeedKR-Th';
        this.contents.fontSize = 20;
    };

    // 텍스트 흰색 고정 (drawItem 내부의 resetTextColor 호출 덮어쓰기)
    Window_TitleCommand.prototype.resetTextColor = function() {
        this.changeTextColor('#ffffff');
    };

    // ① blend color 교번 제거 (흰색 반짝임)
    Window_TitleCommand.prototype.updateSelectionEffect = function() {
        if (this._cursorSprite) {
            this._cursorSprite.setBlendColor([0, 0, 0, 0]);
        }
    };

    // ② cursor alpha 교번 제거 (커서 자체 깜빡임)
    Window_TitleCommand.prototype._updateCursor = function() {
        Window.prototype._updateCursor.call(this);
        if (this._cursorSprite) {
            this._cursorSprite.alpha = this._cursorRect.height > 0 ? 1 : 0;
        }
    };
})();
