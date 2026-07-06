var SheetHandler = (function () {
  var SHEET_NAME = 'Leads';
  var STATUS_COL = 6;  // column F (1-based)
  var NEW_STATUS = 'New';

  // Column indices (0-based) for reading row data
  var COL = {
    date:    0,
    name:    1,
    phone:   2,
    company: 3,
    task:    4,
    status:  5,
    userId:  6,
  };

  function handleChange(e) {
    var sheet = SpreadsheetApp
      .getActiveSpreadsheet()
      .getSheetByName(SHEET_NAME);

    if (!sheet) return;

    var lastRow = sheet.getLastRow();

    // Skip header row
    if (lastRow < 2) return;

    var dataRange = sheet.getRange(2, 1, lastRow - 1, 7);
    var rows = dataRange.getValues();

    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      var status = row[COL.status];

      if (status !== NEW_STATUS) continue;

      var rowNumber = i + 2; // +2: 1-based + header offset
      var lead = {
        rowNumber: rowNumber,
        date:      row[COL.date],
        name:      row[COL.name],
        phone:     row[COL.phone],
        company:   row[COL.company],
        task:      row[COL.task],
        userId:    row[COL.userId],
      };

      var pdfUrl = PdfGenerator.generate(lead);
      Notifier.sendEmail(lead, pdfUrl);

      // Mark as processed so the trigger doesn't fire again for this row
      sheet.getRange(rowNumber, STATUS_COL).setValue('Processing');
    }
  }

  return { handleChange: handleChange };
})();
