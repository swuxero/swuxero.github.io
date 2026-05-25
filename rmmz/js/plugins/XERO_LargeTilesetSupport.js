/*:
 * @target MZ
 * @plugindesc Allows oversized B/C/D/E tileset sheets to render correctly in playtest.
 * @author XERO
 *
 * @help
 * RPG Maker MZ packs tileset images into 1024px atlas slots at runtime.
 * Some custom tileset sheets are wider than that and can render as black
 * gaps or tile fragments during play. This plugin increases the runtime
 * atlas slot size while keeping the map data and tileset layout unchanged.
 */
(() => {
    'use strict';

    const SLOT_SIZE = 2048;
    const ATLAS_SIZE = SLOT_SIZE * 2;

    Tilemap.Renderer.prototype.initialize = function(renderer) {
        PIXI.ObjectRenderer.call(this, renderer);
        this._shader = null;
        this._images = [];
        this._internalTextures = [];
        this._clearBuffer = new Uint8Array(SLOT_SIZE * SLOT_SIZE * 4);
        this.contextChange();
    };

    Tilemap.Renderer.prototype._createShader = function() {
        const vertexSrc =
            "attribute float aTextureId;" +
            "attribute vec4 aFrame;" +
            "attribute vec2 aSource;" +
            "attribute vec2 aDest;" +
            "uniform mat3 uProjectionMatrix;" +
            "varying vec4 vFrame;" +
            "varying vec2 vTextureCoord;" +
            "varying float vTextureId;" +
            "void main(void) {" +
            "  vec3 position = uProjectionMatrix * vec3(aDest, 1.0);" +
            "  gl_Position = vec4(position, 1.0);" +
            "  vFrame = aFrame;" +
            "  vTextureCoord = aSource;" +
            "  vTextureId = aTextureId;" +
            "}";
        const fragmentSrc =
            "varying vec4 vFrame;" +
            "varying vec2 vTextureCoord;" +
            "varying float vTextureId;" +
            "uniform sampler2D uSampler0;" +
            "uniform sampler2D uSampler1;" +
            "uniform sampler2D uSampler2;" +
            "void main(void) {" +
            "  vec2 textureCoord = clamp(vTextureCoord, vFrame.xy, vFrame.zw);" +
            "  int textureId = int(vTextureId);" +
            "  vec4 color;" +
            "  if (textureId < 0) {" +
            "    color = vec4(0.0, 0.0, 0.0, 0.5);" +
            "  } else if (textureId == 0) {" +
            `    color = texture2D(uSampler0, textureCoord / ${ATLAS_SIZE}.0);` +
            "  } else if (textureId == 1) {" +
            `    color = texture2D(uSampler1, textureCoord / ${ATLAS_SIZE}.0);` +
            "  } else if (textureId == 2) {" +
            `    color = texture2D(uSampler2, textureCoord / ${ATLAS_SIZE}.0);` +
            "  }" +
            "  gl_FragColor = color;" +
            "}";

        return new PIXI.Shader(PIXI.Program.from(vertexSrc, fragmentSrc), {
            uSampler0: 0,
            uSampler1: 0,
            uSampler2: 0,
            uProjectionMatrix: new PIXI.Matrix()
        });
    };

    Tilemap.Renderer.prototype._createInternalTextures = function() {
        this._destroyInternalTextures();
        for (let i = 0; i < Tilemap.Layer.MAX_GL_TEXTURES; i++) {
            const baseTexture = new PIXI.BaseRenderTexture();
            baseTexture.resize(ATLAS_SIZE, ATLAS_SIZE);
            baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
            this._internalTextures.push(baseTexture);
        }
    };

    Tilemap.Renderer.prototype.updateTextures = function(renderer, images) {
        for (let i = 0; i < images.length; i++) {
            const image = images[i];
            const internalTexture = this._internalTextures[i >> 2];
            renderer.texture.bind(internalTexture, 0);
            const gl = renderer.gl;
            const x = SLOT_SIZE * (i % 2);
            const y = SLOT_SIZE * ((i >> 1) % 2);
            const format = gl.RGBA;
            const type = gl.UNSIGNED_BYTE;

            if (image.width > SLOT_SIZE || image.height > SLOT_SIZE) {
                console.warn(`Tileset image exceeds ${SLOT_SIZE}px atlas slot: ${image.width}x${image.height}`);
            }

            gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 0);
            gl.texSubImage2D(
                gl.TEXTURE_2D,
                0,
                x,
                y,
                SLOT_SIZE,
                SLOT_SIZE,
                format,
                type,
                this._clearBuffer
            );
            gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1);
            gl.texSubImage2D(gl.TEXTURE_2D, 0, x, y, format, type, image);
        }
    };

    Tilemap.Layer.prototype._updateVertexBuffer = function() {
        const numElements = this._elements.length;
        const required = numElements * Tilemap.Layer.VERTEX_STRIDE;
        if (this._vertexArray.length < required) {
            this._vertexArray = new Float32Array(required * 2);
        }
        const vertexArray = this._vertexArray;
        let index = 0;
        for (const item of this._elements) {
            const setNumber = item[0];
            const tid = setNumber >> 2;
            const sxOffset = SLOT_SIZE * (setNumber & 1);
            const syOffset = SLOT_SIZE * ((setNumber >> 1) & 1);
            const sx = item[1] + sxOffset;
            const sy = item[2] + syOffset;
            const dx = item[3];
            const dy = item[4];
            const w = item[5];
            const h = item[6];
            const frameLeft = sx + 0.5;
            const frameTop = sy + 0.5;
            const frameRight = sx + w - 0.5;
            const frameBottom = sy + h - 0.5;
            vertexArray[index++] = tid;
            vertexArray[index++] = frameLeft;
            vertexArray[index++] = frameTop;
            vertexArray[index++] = frameRight;
            vertexArray[index++] = frameBottom;
            vertexArray[index++] = sx;
            vertexArray[index++] = sy;
            vertexArray[index++] = dx;
            vertexArray[index++] = dy;
            vertexArray[index++] = tid;
            vertexArray[index++] = frameLeft;
            vertexArray[index++] = frameTop;
            vertexArray[index++] = frameRight;
            vertexArray[index++] = frameBottom;
            vertexArray[index++] = sx + w;
            vertexArray[index++] = sy;
            vertexArray[index++] = dx + w;
            vertexArray[index++] = dy;
            vertexArray[index++] = tid;
            vertexArray[index++] = frameLeft;
            vertexArray[index++] = frameTop;
            vertexArray[index++] = frameRight;
            vertexArray[index++] = frameBottom;
            vertexArray[index++] = sx + w;
            vertexArray[index++] = sy + h;
            vertexArray[index++] = dx + w;
            vertexArray[index++] = dy + h;
            vertexArray[index++] = tid;
            vertexArray[index++] = frameLeft;
            vertexArray[index++] = frameTop;
            vertexArray[index++] = frameRight;
            vertexArray[index++] = frameBottom;
            vertexArray[index++] = sx;
            vertexArray[index++] = sy + h;
            vertexArray[index++] = dx;
            vertexArray[index++] = dy + h;
        }
        this._vertexBuffer.update(vertexArray);
    };
})();
