/*:
 * @target MZ
 * @plugindesc Adds a \BOOK escape code that draws img/pictures/book_04g.png in messages.
 * @author XERO
 */

(() => {
    "use strict";

    const bookBitmap = ImageManager.loadPicture("book_04g");
    const scrollBitmap = ImageManager.loadPicture("scroll_01g");

    const _Window_Message_processEscapeCharacter =
        Window_Message.prototype.processEscapeCharacter;

    Window_Message.prototype.processEscapeCharacter = function(code, textState) {
        if (code === "BOOK") {
            if (bookBitmap.isReady()) {
                const y = textState.y + Math.floor((textState.height - 32) / 2);
                this.contents.blt(
                    bookBitmap,
                    0,
                    0,
                    bookBitmap.width,
                    bookBitmap.height,
                    textState.x + 4,
                    y,
                    32,
                    32
                );
            }
            textState.x += 42;
            return;
        }
        if (code === "SCROLL") {
            if (scrollBitmap.isReady()) {
                const y = textState.y + Math.floor((textState.height - 32) / 2);
                this.contents.blt(
                    scrollBitmap,
                    0,
                    0,
                    scrollBitmap.width,
                    scrollBitmap.height,
                    textState.x + 4,
                    y,
                    32,
                    32
                );
            }
            textState.x += 42;
            return;
        }
        _Window_Message_processEscapeCharacter.call(this, code, textState);
    };
})();
