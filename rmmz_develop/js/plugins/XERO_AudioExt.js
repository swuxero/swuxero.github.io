/*:
 * @target MZ
 * @plugindesc Loads selected custom audio files with their actual extensions.
 * @author XERO
 */

(() => {
    "use strict";

    const customAudio = new Map([
        ["bgm/음식점", { folder: "bgm/", name: "음식점", ext: ".mp3", hallEcho: true }],
        ["bgm/주인공_방", { folder: "bgm/", name: "주인공_방", ext: ".mp3" }],
        ["bgm/학교", { folder: "bgm/", name: "학교", ext: ".mp3" }],
        ["bgm/인권센터", { folder: "bgm/", name: "인권센터", ext: ".mp3" }],
        ["bgm/디성센터", { folder: "bgm/", name: "디성센터", ext: ".mp3" }],
        ["bgm/경찰서", { folder: "bgm/", name: "경찰서", ext: ".mp3" }],
        ["bgm/타이틀_경찰서엔딩", { folder: "bgm/", name: "타이틀_경찰서엔딩", ext: ".mp3" }],
        ["bgs/heartbeat", { folder: "bgs/", name: "heartbeat", ext: ".ogg" }],
        ["bgs/핸드폰_진동", { folder: "bgs/", name: "핸드폰_진동", ext: ".mp3" }],
        ["se/카메라", { folder: "bgs/", name: "카메라", ext: ".mp3" }],
        ["se/핸드폰_진동", { folder: "bgs/", name: "핸드폰_진동", ext: ".mp3" }]
    ]);

    const _AudioManager_createBuffer = AudioManager.createBuffer;

    AudioManager.createBuffer = function(folder, name) {
        const custom = customAudio.get(`${folder}${name}`);
        if (custom) {
            const url = this._path + custom.folder + Utils.encodeURI(custom.name) + custom.ext;
            const buffer = new WebAudio(url);
            buffer.name = name;
            buffer.frameCount = Graphics.frameCount;
            buffer._xeroHallEcho = !!custom.hallEcho;
            return buffer;
        }
        return _AudioManager_createBuffer.call(this, folder, name);
    };

    const _AudioManager_playBgm = AudioManager.playBgm;

    AudioManager.playBgm = function(bgm, pos) {
        const shouldFadeIn = bgm && bgm.name && !this.isCurrentBgm(bgm);
        _AudioManager_playBgm.call(this, bgm, pos);
        if (shouldFadeIn && this._bgmBuffer && !this._meBuffer) {
            this._bgmBuffer.fadeIn(2);
        }
    };

    const _WebAudio_createSourceNode = WebAudio.prototype._createSourceNode;

    WebAudio.prototype._createSourceNode = function(index) {
        _WebAudio_createSourceNode.call(this, index);
        if (!this._xeroHallEcho || !WebAudio._context || !this._sourceNodes[index]) {
            return;
        }

        const sourceNode = this._sourceNodes[index];
        const delayNode = WebAudio._context.createDelay(0.6);
        const echoGain = WebAudio._context.createGain();
        delayNode.delayTime.setValueAtTime(0.18, WebAudio._currentTime());
        echoGain.gain.setValueAtTime(0.16, WebAudio._currentTime());
        sourceNode.connect(delayNode);
        delayNode.connect(echoGain);
        echoGain.connect(this._gainNode);
    };
})();
