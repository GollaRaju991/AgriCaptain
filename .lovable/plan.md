## Remove "Add Crop" button from Sell Crop page

**File:** `src/pages/SellCrop.tsx`

**Change:** Delete the `<Button>` block (lines 332-337) that renders the "+ Add Crop" action in the Nearby/Filter/Add Crop row. The remaining Nearby and Filter buttons stay in place; the Filter button keeps `flex-1` so the row fills the available width cleanly.

No routes, navigation, or other pages are changed — only the visible button is removed from this page.