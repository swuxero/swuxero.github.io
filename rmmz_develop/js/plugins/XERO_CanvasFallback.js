/*:
 * @target MZ
 * @plugindesc WebGL 없이 Canvas 모드로 실행 (GPU 미지원 개발 환경용)
 * @author XERO
 *
 * @help
 * GPU/WebGL을 사용할 수 없는 개발 PC에서 게임을 실행하기 위한 플러그인.
 * PIXI.Application을 Canvas 모드로 강제 초기화합니다.
 * 배포(릴리즈) 시에는 반드시 비활성화하세요.
 */
(() => {
    'use strict';

    // PIXI를 Canvas 모드로 강제 초기화
    Graphics._createPixiApp = function() {
        try {
            this._setupPixi();
            this._app = new PIXI.Application({
                view: this._canvas,
                autoStart: false,
                forceCanvas: true,
            });
            this._app.ticker.remove(this._app.render, this._app);
            this._app.ticker.add(this._onTick, this);
        } catch (e) {
            this._app = null;
        }
    };

    // Effekseer는 WebGL gl 컨텍스트가 필요 → Canvas 모드에서 비활성화
    Graphics._createEffekseerContext = function() {
        this._effekseer = null;
    };
})();