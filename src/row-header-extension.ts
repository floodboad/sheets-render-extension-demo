import type { IScale } from '@univerjs/core';
import type { SpreadsheetSkeleton, UniverRenderingContext } from '@univerjs/engine-render';
import { DEFAULT_FONTFACE_PLANE, FIX_ONE_PIXEL_BLUR_OFFSET, getColor, MIDDLE_CELL_POS_MAGIC_NUMBER, SheetExtension, SheetRowHeaderExtensionRegistry } from '@univerjs/engine-render';

const UNIQUE_KEY = 'RowHeaderCustomExtension';

// Show custom emojis on row headers
const customEmojiList = ['🍎', '🍌', '🍒', '🍓', '🍅', '🍆', '🍇', '🍈', '🍉', '🍊'];

export class RowHeaderCustomExtension extends SheetExtension {
    override uKey = UNIQUE_KEY;

    // Must be greater than 10
    override zIndex = 11;

    override draw(ctx: UniverRenderingContext, parentScale: IScale, spreadsheetSkeleton: SpreadsheetSkeleton) {
        const { rowColumnSegment, rowHeaderWidth = 0, columnHeaderHeight = 0 } = spreadsheetSkeleton;
        const { startRow, endRow, startColumn, endColumn } = rowColumnSegment;
        if (!spreadsheetSkeleton) {
            return;
        }

        const { rowHeightAccumulation, columnTotalWidth, columnWidthAccumulation, rowTotalHeight } =
            spreadsheetSkeleton;

        if (
            !rowHeightAccumulation ||
            !columnWidthAccumulation ||
            columnTotalWidth === undefined ||
            rowTotalHeight === undefined
        ) {
            return;
        }

        const scale = this._getScale(parentScale);

        ctx.fillStyle = getColor([248, 249, 250]);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = getColor([0, 0, 0])!;
        ctx.beginPath();
        ctx.lineWidth = 1;

        ctx.translateWithPrecisionRatio(FIX_ONE_PIXEL_BLUR_OFFSET, FIX_ONE_PIXEL_BLUR_OFFSET);

        ctx.strokeStyle = getColor([217, 217, 217]);
        ctx.font = `13px ${DEFAULT_FONTFACE_PLANE}`;
        let preRowPosition = 0;
        const rowHeightAccumulationLength = rowHeightAccumulation.length;
        for (let r = startRow - 1; r <= endRow; r++) {
            if (r < 0 || r > rowHeightAccumulationLength - 1) {
                continue;
            }
            const rowEndPosition = rowHeightAccumulation[r];
            if (preRowPosition === rowEndPosition) {
                // Skip hidden rows
                continue;
            }
            ctx.moveTo(0, rowEndPosition);
            ctx.lineTo(rowHeaderWidth, rowEndPosition);

            const middleCellPos = preRowPosition + (rowEndPosition - preRowPosition) / 2;
            customEmojiList[r] && ctx.fillText(customEmojiList[r], rowHeaderWidth / 2 + 12, middleCellPos + MIDDLE_CELL_POS_MAGIC_NUMBER); // Magic number 1, because the vertical alignment appears to be off by 1 pixel.
            preRowPosition = rowEndPosition;
        }

        // painting line bottom border
        const rowHeaderWidthFix = rowHeaderWidth - 0.5 / scale;

        ctx.moveTo(rowHeaderWidthFix, 0);
        ctx.lineTo(rowHeaderWidthFix, rowTotalHeight);
        ctx.stroke();
    }
}

SheetRowHeaderExtensionRegistry.add(new RowHeaderCustomExtension());