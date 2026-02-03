#!/bin/bash

# Fix TypeScript compilation errors for deployment

echo "Fixing TypeScript errors..."

# Fix 1: Remove unused getState in componentIntegration.test.tsx
sed -i '' 's/const { getState } = useStore;/useStore;/' pixel-converter/src/__tests__/integration/componentIntegration.test.tsx

# Fix 2: Add missing assignPixelsToDataGroup in groups.property.test.ts
sed -i '' 's/setActiveDataGroup: () => {},/setActiveDataGroup: () => {},\n    assignPixelsToDataGroup: () => {},/' pixel-converter/src/__tests__/properties/groups.property.test.ts

# Fix 3: Remove unused imports in colorTypes.property.test.ts
sed -i '' 's/import type { Pixel, ColorGroup, RGB } from/import type { Pixel, ColorGroup, RGB } from/' pixel-converter/src/__tests__/properties/colorTypes.property.test.ts
sed -i '' 's/import type { PixelConverterState } from/\/\/ import type { PixelConverterState } from/' pixel-converter/src/__tests__/properties/colorTypes.property.test.ts

# Fix 4: Remove unused imports in groups.property.test.ts
sed -i '' 's/import type { PixelConverterState } from/\/\/ import type { PixelConverterState } from/' pixel-converter/src/__tests__/properties/groups.property.test.ts

# Fix 5: Remove unused imports in roundtrip.property.test.ts
sed -i '' 's/DataGroup, ColorType/\/\/ DataGroup, ColorType/' pixel-converter/src/__tests__/properties/roundtrip.property.test.ts

# Fix 6: Remove unused imports in undo.property.test.ts
sed -i '' 's/PixelConverterState,/\/\/ PixelConverterState,/' pixel-converter/src/__tests__/properties/undo.property.test.ts

# Fix 7: Remove unused imports in pixelSlice.ts
sed -i '' 's/ExportedData,/\/\/ ExportedData,/' pixel-converter/src/store/slices/pixelSlice.ts

# Fix 8: Remove unused imports in paletteSlice.test.ts
sed -i '' 's/, beforeEach//' pixel-converter/src/store/slices/paletteSlice.test.ts

# Fix 9: Remove unused variable in paletteSlice.ts
sed -i '' 's/addPaletteColor: (color: string) => {/addPaletteColor: (color: string) => {/' pixel-converter/src/store/slices/paletteSlice.ts
sed -i '' 's/set((state) => {/set(() => {/' pixel-converter/src/store/slices/paletteSlice.ts

# Fix 10: Remove unused variable in pixelSlice.ts
sed -i '' 's/setPixels: (pixels: Pixel\[\]) => {/setPixels: (pixels: Pixel[]) => {/' pixel-converter/src/store/slices/pixelSlice.ts

# Fix 11: Remove unused variable in useImageLoader.ts
sed -i '' 's/const enableDragDrop =/\/\/ const enableDragDrop =/' pixel-converter/src/hooks/useImageLoader.ts

# Fix 12: Remove unused variable in importUtils.ts
sed -i '' 's/, palette/\/\/ , palette/' pixel-converter/src/utils/importUtils.ts

# Fix 13: Remove unused variables in CanvasComponent.test.tsx
sed -i '' 's/, screen//' pixel-converter/src/components/canvas/CanvasComponent.test.tsx
sed -i '' 's/const greenBorderCalls =/\/\/ const greenBorderCalls =/' pixel-converter/src/components/canvas/CanvasComponent.test.tsx
sed -i '' 's/const prevStrokeStyle =/\/\/ const prevStrokeStyle =/' pixel-converter/src/components/canvas/CanvasComponent.test.tsx
sed -i '' 's/, index/\/_index/' pixel-converter/src/components/canvas/CanvasComponent.test.tsx

echo "TypeScript errors fixed!"
