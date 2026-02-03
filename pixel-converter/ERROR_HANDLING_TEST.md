# Error Handling UI - Manual Test Plan

## Task 16.3: Add error handling UI

This document outlines manual tests to verify the error handling UI implementation.

### Test 1: Invalid File Type Upload (Requirement 2.8)
**Steps:**
1. Open the Pixel Converter application
2. Click the "Upload Image" button
3. Select a non-image file (e.g., .txt, .pdf, .doc)

**Expected Result:**
- A red error snackbar appears at the bottom center of the screen
- Message: "Invalid file type. Please upload an image file."
- Snackbar auto-dismisses after 5 seconds
- File is rejected and not loaded

### Test 2: Empty Undo Stack (Requirement 8.4)
**Steps:**
1. Open the Pixel Converter application (fresh state, no actions performed)
2. Click the "Undo" button in the toolbar OR press Ctrl+Z

**Expected Result:**
- A blue info snackbar appears at the bottom center of the screen
- Message: "Nothing to undo"
- Snackbar auto-dismisses after 3.5 seconds

### Test 3: Invalid JSON Import (Requirement 10.3)
**Steps:**
1. Open the Pixel Converter application
2. Navigate to the "Export / Import" panel in the sidebar
3. Click "Import JSON"
4. Select a file with invalid JSON format or missing required fields

**Expected Result:**
- A red error snackbar appears at the bottom center of the screen
- Message: "Import failed: [specific error message]"
- Snackbar auto-dismisses after 6 seconds
- Import is rejected and current state is preserved

### Test 4: Successful Image Load
**Steps:**
1. Open the Pixel Converter application
2. Click the "Upload Image" button
3. Select a valid image file (e.g., .png, .jpg)

**Expected Result:**
- A green success snackbar appears at the bottom center of the screen
- Message: "Image loaded successfully"
- Snackbar auto-dismisses after 3.5 seconds
- Image is converted and displayed on the canvas

### Test 5: Data Group Operations
**Steps:**
1. Open the Pixel Converter application
2. In the "Group Data" panel, try to delete the "None" group

**Expected Result:**
- An orange warning snackbar appears at the bottom center of the screen
- Message: "Cannot delete the 'None' group"
- Snackbar auto-dismisses after 3.5 seconds

**Steps:**
1. Try to clear the "None" group

**Expected Result:**
- An orange warning snackbar appears at the bottom center of the screen
- Message: "Cannot clear the 'None' group"
- Snackbar auto-dismisses after 3.5 seconds

### Test 6: Size Input Validation
**Steps:**
1. Open the Pixel Converter application
2. In the toolbar, find the "Size" input field
3. Enter a value less than 8 (e.g., 5)

**Expected Result:**
- Input field shows red error state
- Helper text changes to "Must be 8-256"
- Value is clamped to 8 when focus is lost

**Steps:**
1. Enter a value greater than 256 (e.g., 300)

**Expected Result:**
- Input field shows red error state
- Helper text changes to "Must be 8-256"
- Value is clamped to 256 when focus is lost

### Test 7: Export Operations
**Steps:**
1. Open the Pixel Converter application (no image loaded)
2. Navigate to the "Export / Import" panel
3. Click "Export PNG"

**Expected Result:**
- A red error snackbar appears at the bottom center of the screen
- Message: "No pixels to export. Load an image first."
- Snackbar auto-dismisses after 3.5 seconds

**Steps:**
1. Load an image
2. Click "Export JSON"

**Expected Result:**
- A green success snackbar appears at the bottom center of the screen
- Message: "JSON exported successfully"
- Snackbar auto-dismisses after 3.5 seconds
- JSON file is downloaded

### Test 8: Successful Import
**Steps:**
1. Open the Pixel Converter application
2. Export a JSON file (to have valid data)
3. Click "Import JSON"
4. Select the exported JSON file

**Expected Result:**
- A green success snackbar appears at the bottom center of the screen
- Message: "Import successful! Loaded X pixels, Y colors, Z data groups, W color types."
- Snackbar auto-dismisses after 5 seconds
- Data is loaded and displayed correctly

## Summary

All error messages have been replaced with Material UI Snackbar notifications:
- ✅ No more `alert()` calls
- ✅ Consistent notification styling
- ✅ Auto-dismiss functionality
- ✅ Appropriate severity levels (error, warning, info, success)
- ✅ Clear, helpful error messages
- ✅ Visual validation feedback for inputs
