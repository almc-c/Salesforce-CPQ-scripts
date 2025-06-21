export function onBeforeCalculate(quote, lines, conn) {
  //@@ Expired Quote Refresh Function - GOAL: query the quote lines, get their pricebookentry ids, built a list, query the PBE recs and update the List price on the QLs.  Set next expiration 30 days out.
  // queries: https://developer.salesforce.com/docs/atlas.en-us.cpq_api_dev.meta/cpq_api_dev/cpq_dev_jsqcp_lookup_use_case.htm
  // date formats: https://developer.salesforce.com/docs/atlas.en-us.cpq_api_dev.meta/cpq_api_dev/cpq_dev_jsqcp_sub_use_case.htm
  // use onBefore to obtain prices before last price waterfall calc to not require double-calculation

  let debugSwitch = true;

  // expiration date context
  let dateNow = new Date();
  let dateNowString = dateNow.toISOString();
  console.log("dateNowString : " + dateNowString);

  debugSwitch && console.log("***The Quote Expiration Date Is: " + quote.record["SBQQ__ExpirationDate__c"]);

  let isExpired = false;
  let expirationDate = quote.record["SBQQ__ExpirationDate__c"];

  if (expirationDate < dateNowString) {
    debugSwitch && console.log("@@@ This quote is expired!");
    isExpired = true;
  }
 
  if (lines.length > 0 && isExpired == true) {
    
    debugSwitch && console.log("***Entering expired quote processing loop - refreshing prices");

    // compute next expiration date
    let nextExpirationDate = new Date(); // Now
    nextExpirationDate.setDate( nextExpirationDate.getDate() + 30 ); // Set now + 30 days as the new date
    debugSwitch && console.log("nextExpirationDate is : " + nextExpirationDate);

    // Get the ISO formatted date string. This will be formatted: YYYY-MM-DDTHH:mm:ss.sssZ  Replace everything after the T with an empty string
    quote.record["SBQQ__ExpirationDate__c"] = nextExpirationDate.toISOString().replace(new RegExp('[Tt].*'), "");  

    // when expired, fetch current prices
    let pbes = [];

    lines.forEach(function (line) {
      if (line.record["SBQQ__PricebookEntryId__c"]) {
        pbes.push(line.record["SBQQ__PricebookEntryId__c"]);
      }
    });

    if (pbes.length) {
      let pbeList = "('" + pbes.join("', '") + "')";
            //conn.query() returns a Promise that resolves when the query completes.
      return conn.query("SELECT Id, UnitPrice FROM PriceBookEntry WHERE Id IN " + pbeList)
        .then(function (results) {
          /*
           * conn.query()'s Promise resolves to an object (results) with three attributes:
           * - totalSize: an integer indicating how many records were returned
           * - done: a boolean indicating whether the query has completed
           * - records: a list of all records returned
           */

          if (results.totalSize) {
            let newPrices = {};
            results.records.forEach(function (record) {
              newPrices[record.Id] = record.UnitPrice;
            });

            lines.forEach(function (line) {
              if ( line.record["SBQQ__PricebookEntryId__c"] && newPrices[line.record["SBQQ__PricebookEntryId__c"]] >= 0 ) {
                line.record["SBQQ__ListPrice__c"] = newPrices[line.record["SBQQ__PricebookEntryId__c"]] || 0.0;
              }
            });
          }
        }); /* close the function. END price book entry scan and update. */
    }
  }
  return Promise.resolve();
} /* close the export function onBeforeCalculate */
