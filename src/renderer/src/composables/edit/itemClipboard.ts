import type {
  KeyboardKeyData,
  LayoutItemData,
  MouseData
} from "../../../../shared/types";

type ItemClipboardOptions = {
  createId: (type: LayoutItemData["type"]) => string;
  pasteOffset?: number;
};

const cloneKeyboardKey = (item: KeyboardKeyData): KeyboardKeyData => ({
  ...item,
  codeMap: [...item.codeMap],
  images: { ...item.images },
  text: item.text
    ? {
        ...item.text,
        shift: item.text.shift ? { ...item.text.shift } : undefined
      }
    : undefined
});

const cloneMouse = (item: MouseData): MouseData => ({
  ...item,
  buttonOverlays: {
    left: { ...item.buttonOverlays.left },
    right: { ...item.buttonOverlays.right },
    middle: { ...item.buttonOverlays.middle },
    x1: { ...item.buttonOverlays.x1 },
    x2: { ...item.buttonOverlays.x2 }
  },
  ring: {
    ...item.ring,
    images: { ...item.ring.images }
  },
  images: { ...item.images }
});

const cloneLayoutItem = (item: LayoutItemData): LayoutItemData =>
  item.type === "key" ? cloneKeyboardKey(item) : cloneMouse(item);

/**
 * Creates an editor-local item clipboard with independent snapshots and
 * progressively offset paste results.
 */
export const createItemClipboard = ({
  createId,
  pasteOffset = 16
}: ItemClipboardOptions) => {
  let copiedItems: LayoutItemData[] = [];
  let pasteCount = 0;

  const copy = (items: LayoutItemData[]): void => {
    copiedItems = items.map(cloneLayoutItem);
    pasteCount = 0;
  };

  const paste = (): LayoutItemData[] => {
    if (copiedItems.length === 0) return [];

    pasteCount += 1;
    const positionOffset = pasteOffset * pasteCount;

    return copiedItems.map((item) => ({
      ...cloneLayoutItem(item),
      id: createId(item.type),
      x: item.x + positionOffset,
      y: item.y + positionOffset
    }));
  };

  return { copy, paste };
};
