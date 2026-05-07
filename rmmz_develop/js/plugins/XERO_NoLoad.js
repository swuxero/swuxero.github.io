/*:
 * @target MZ
 * @plugindesc 타이틀 화면에서 '이어하기' 버튼을 제거하고 창 크기를 2칸으로 조정합니다.
 * @author XERO
 */
(() => {
    const _makeCommandList = Window_TitleCommand.prototype.makeCommandList;
    Window_TitleCommand.prototype.makeCommandList = function() {
        _makeCommandList.call(this);
        this._list = this._list.filter(cmd => cmd.symbol !== 'continue');
    };

    // 창 높이를 2칸(새 게임 + 옵션)으로 조정
    Scene_Title.prototype.commandWindowRect = function() {
        const offsetX = $dataSystem.titleCommandWindow.offsetX;
        const offsetY = $dataSystem.titleCommandWindow.offsetY;
        const ww = this.mainCommandWidth();
        const wh = this.calcWindowHeight(2, true);
        const wx = (Graphics.boxWidth - ww) / 2 + offsetX;
        const wy = Graphics.boxHeight - wh - 96 + offsetY;
        return new Rectangle(wx, wy, ww, wh);
    };
})();
