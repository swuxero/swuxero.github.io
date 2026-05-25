/*:
 * @target MZ
 * @plugindesc WASD 키로 플레이어 이동
 * @author XERO
 */
(() => {
    Input.keyMapper[87] = 'up';    // W
    Input.keyMapper[65] = 'left';  // A
    Input.keyMapper[83] = 'down';  // S
    Input.keyMapper[68] = 'right'; // D
})();