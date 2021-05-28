function myAutoGenerationOfPresentingCCMv4Section() {
  // I think this is bound to the scriptscratchpad, so I have access to:
  // Get the document to which this script is bound.
  var doc = DocumentApp.getActiveDocument();
  var ui = DocumentApp.getUi();
  Logger.log('Triggering Prompt');
  var response = ui.alert('This script will insert the entire CCMv4 Metrics Catalog MVP set at the current cursor location', ui.ButtonSet.OK_CANCEL);
  if (response != ui.Button.OK) {
    return;
  }

  // Figureing out where to insert is a pain. This finds the rough location to insert our new elements
  // NOTE: increment this each time so that things get inserted progressively from this point
  Logger.log('Determining insertion point');
  var cursor = doc.getCursor();
  var cursorElement = doc.getCursor().getElement();
  var cursorIndex  = cursorElement.getParent().getChildIndex(cursorElement);
  if (!cursorIndex) {
    DocumentApp.getUi().alert('Cannot find a cursor index to insert at.');
  }  

  // Now lets get the CCMv4 metric catalog sheet (also known by gid 1TcIh8y7PEL4FxyMNVdfeaWM5rykR3t0HwrLmKvtkxbc)
  Logger.log('Opening spreadsheet...');
  var ccmmetricscatalog = SpreadsheetApp.openById('1TcIh8y7PEL4FxyMNVdfeaWM5rykR3t0HwrLmKvtkxbc');
  Logger.log("parsing ["+ccmmetricscatalog.getName()+"]");

  // EDITORIAL NOTE insertion in a single cell table so it gets a nice box
  // TODO: use current time zone for time? 
  var datestr = Utilities.formatDate(new Date(), "GMT+1", "MM/dd/yyyy 'T'HH:mm:ss'Z'");
  var cell = null;
  cell = [['EDITORIAL NOTE: The following section was generated automatically from the \"'+ccmmetricscatalog.getName()+'\". DO NOT update or format the text in these sections. Instead update the source data or the generation script.\n\nThis note to be removed during final edit.']];
  doc.getBody().insertTable(cursorIndex++,cell);
  cell = [['EDITORIAL NOTE: For more information contact max.pritikin@gmail.com\n'+ datestr]];
  doc.getBody().insertTable(cursorIndex++,cell);

/* NOT EXTREMELY USEFUL; this is in section3 and too difficult to keep in sync
  var intro = "\n\nThe following sections are example metrics produced by the working group. For each proposed metric the following table provides details about the metric."
  doc.getBody().insertParagraph(cursorIndex++, intro);
  var cells = [];
  cells.push(['Primary CCMv4 Control ID', "This is the primary CCMv4 Control ID the metric is mapped to."]);
  cells.push(['Primary Control Description', "To help the reader this is the description of the primary control ID from CCMv4."]);
  cells.push(['Related CCMv4 Control IDs', "These additional controls are also related to the metric.\nIn some cases the information systems used to generate the metric is used for these other controls thus the continued meeting of the metric includes a level of assurance that these other controls have working information systems in place."]);
  cells.push(['Metric ID', "Each metric is provisionally named after the primary control ID to reflect the primary mapping."]);    
  cells.push(['Metric Description', "A brief description"]);
  cells.push(['Expression', "Either:\nA mathematical formula describing the measurement,\nOr:\nA description of the process needed to perform the measurement"]);
  cells.push(['Rules', "List of rules that MUST be followed to perform a measurement and obtain measurement results with this metric.\nWhen the expression is a mathematical formula, the rules can be used to detail how different fields in the formula are calculated."]);
  cells.push(['SLO recommendations',"Recommendations for the definition of SLOs and SQOs based on this metric, if applicable."]);
  // Only insert this way if we're gonna merge the rows (see below for why that isn't working)
  // cells.push(['Implementation Guidelines', row.implementationGuidelines || "pritikin - TODO"])
  var table = doc.getBody().insertTable(cursorIndex++, cells);
  // make first column a bit thinner. In points even though the UI is inches
  table.setColumnWidth(0, 120); 
  // Implementation guidelines
  var style = {};
  style[DocumentApp.Attribute.BOLD] = true;
  section = doc.getBody().insertParagraph(cursorIndex++,"Implementation Guidelines:").setAttributes(style);
  style[DocumentApp.Attribute.BOLD] = false;
  doc.getBody().insertParagraph(cursorIndex++,"Guidelines that SHOULD be followed to obtain measurement results and implement this metric using automated tools. These guidelines can notably describe system-specific information (e.g. AWS vs. Azure). When general guidelines are not possible, examples of implementation may be suggested.").setAttributes(style);
*/

  // NOTE: The following parses the MVP Summary tab
  var mvpsummary = ccmmetricscatalog.getSheetByName("MVP Summary");
  if (mvpsummary != null) {
    Logger.log('MVP Summary is currently sheet #'+mvpsummary.getIndex());
  }
  var data = mvpsummary.getDataRange().getValues();
  // see ObjService.gs apps script file
  var obj = rangeToObjects(data);

// each row becomes its own subsection 
  obj.forEach(function(row) {
    var sectionTitle = "Metric "+ (row.metricId || row.ccmV4ControlId+"-M(autogen)");
    var section = doc.getBody().insertParagraph(cursorIndex++, sectionTitle); 
    section.setHeading(DocumentApp.ParagraphHeading.HEADING2);

    //var cells = [['CCMv4 Metric Catalog Column', 'Value']];
    var cells = [];

    // An alternate approach is to use a loop as in ObjService::objectToArray, but this is straightforward enough for this task
    cells.push(['Primary CCMv4 Control ID', row.ccmV4ControlId || "null"]);
    cells.push(['Primary Control Description', row.ccmControlDescription || "null"]);
    cells.push(['Related CCMv4 Control IDs', row.applicableCcmControlIds || "null"]);
    cells.push(['Metric ID',  row.metricId || "null"]);    
    cells.push(['Metric Description',  row.description || "null"]);
    cells.push(['Expression',  row.expression || "null"]);
    cells.push(['Rules',  row.rules || "null"]);
    cells.push(['SLO recommendations', row.slossqosRecommendations || "null"]);
    // Only insert this way if we're gonna merge the rows (see below for why that isn't working)
    // cells.push(['Implementation Guidelines', row.implementationGuidelines || "pritikin - TODO"])

    var table = doc.getBody().insertTable(cursorIndex++, cells);
    // make first column a bit thinner. In points even though the UI is inches
    table.setColumnWidth(0, 120); 

    // visual spacer
    doc.getBody().insertParagraph(cursorIndex++, " ");

    // merge the implementation guidelines row 
    // TODO: BROKEN. This does the merge and results in a 0 column with the merged text but it is ONLY the width of the first column instead of the entire table. Additionally the docs viewer crashes when this script is run. I think I'm hitting a bug in how cell merge is handled internally. Not setting the width doesn't help so I'm moving on to the other option.
/*
    var impguidancerow = table.getRow(8);
    // var cell1; cell1 = impguidancerow.getCell(0);
    var cell2; cell2 = impguidancerow.getCell(1);
    cell2.merge(); 
*/
    // Implementation guidelines
    // ALTERNATIVE makes ToC fugly: section.setHeading(DocumentApp.ParagraphHeading.HEADING3)
    var style = {};
    style[DocumentApp.Attribute.BOLD] = true;
    section = doc.getBody().insertParagraph(cursorIndex++,"Implementation Guidelines:").setAttributes(style);
    style[DocumentApp.Attribute.BOLD] = false;
    doc.getBody().insertParagraph(cursorIndex++,row.implementationGuidelines).setAttributes(style);

    // blank line at the end of the section
    doc.getBody().insertParagraph(cursorIndex++, " ");
  });
}
