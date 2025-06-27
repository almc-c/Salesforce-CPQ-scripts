export function onBeforeCalculate(quote, lines, conn) {

    // Only run if the quote is grouped.
    if (quote.groups && quote.groups.length > 0) {
        
        quote.groups.forEach(function(group) {
            
            // Set all of the group member lines to Optional if the group is set to Make All Lines Optional.  Group record Net Amount will be non-zero and inaccurate if SBQQ__Optional__c = true as the method to make all lines optional.  
            // This resolves the issue and automates the 1-click to many lines as optional.
            if (group.record && group.record['Make_All_Lines_Optional__c'] === true) {        
                if (group.lineItems && group.lineItems.length > 0) {

                    group.lineItems.forEach(function(line) {
                        line.record['SBQQ__Optional__c'] = true;
                    });
                }
                group.record['Make_All_Lines_Optional__c'] = false;
            }
        }
    );
    }

    //Target Amount "Goal-Seek" Field Get/Set/Clear - to avoid persistence of the goal-seek target, which applies across qty or line changes

    //First for the quote-level fields (one and only one)
    quote.record['SBQQ__TargetCustomerAmount__c'] = quote.record['Target_Quote_Amount__c'];
    quote.record['Target_Quote_Amount__c'] = null;

    //Next for each group - to avoid persistence of the goal-seek target, which applies across qty or line changes
    quote.groups.forEach(function (group) {
        if (group.record != null) {
            group.record['SBQQ__TargetCustomerAmount__c'] = group.record['Group_Amount__c'];
            group.record['Group_Amount__c'] = null; 
        }
    }); /* close the function. END resetting Target Amount fields to null for next user operations */

    return Promise.resolve();
} /* close the export function onBeforeCalculate */
