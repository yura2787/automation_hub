// Entry point — install this as an onChange trigger on the spreadsheet.
// Spreadsheet → Extensions → Apps Script → Triggers → Add Trigger:
//   Function: onSheetChange | Event source: From spreadsheet | Event type: On change

function onSheetChange(e) {
  SheetHandler.handleChange(e);
}
