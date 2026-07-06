var Notifier = (function () {
  var MANAGER_EMAIL = PropertiesService.getScriptProperties().getProperty('MANAGER_EMAIL');

  function buildEmailBody(lead, pdfUrl) {
    return 'New lead request received.\n\n' +
      'Request #' + lead.rowNumber + '\n' +
      '─────────────────────────\n' +
      'Name:    ' + lead.name    + '\n' +
      'Phone:   ' + lead.phone   + '\n' +
      'Company: ' + lead.company + '\n' +
      'Task:    ' + lead.task    + '\n' +
      'Date:    ' + lead.date    + '\n' +
      '─────────────────────────\n\n' +
      'PDF document: ' + pdfUrl  + '\n\n' +
      'Automation Hub';
  }

  function getPdfBlob(pdfUrl) {
    // Fetch the PDF file from Drive as a blob for email attachment
    var fileId = pdfUrl.match(/[-\w]{25,}/);
    if (!fileId) return null;
    var file = DriveApp.getFileById(fileId[0]);
    return file.getBlob().setName('Lead_' + lead.rowNumber + '.pdf');
  }

  function sendEmail(lead, pdfUrl) {
    if (!MANAGER_EMAIL) {
      Logger.log('[Notifier] MANAGER_EMAIL script property is not set');
      return;
    }

    var fileId = (pdfUrl.match(/[-\w]{25,}/) || [])[0];
    var attachments = [];

    if (fileId) {
      try {
        var blob = DriveApp.getFileById(fileId).getBlob();
        blob.setName('Lead_' + lead.rowNumber + '_' + lead.name.replace(/\s+/g, '_') + '.pdf');
        attachments.push(blob);
      } catch (err) {
        Logger.log('[Notifier] could not attach PDF: ' + err.message);
      }
    }

    MailApp.sendEmail({
      to:          MANAGER_EMAIL,
      subject:     'New lead from ' + lead.name + ' — ' + lead.company,
      body:        buildEmailBody(lead, pdfUrl),
      attachments: attachments,
    });
  }

  return { sendEmail: sendEmail };
})();
