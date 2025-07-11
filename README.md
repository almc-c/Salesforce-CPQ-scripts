# Salesforce-CPQ-scripts

**Refresh Prices Quote Calculator Plugin (QCP):**

Example given for refresh prices may be used in cases where product prices need to be maintained throughout the duration of the quote validity, and allow "refresh" w/o depending on pressing "Refresh Prices" button.  Additionally, when this occurs, the next expiration date will be automatically updated on the quote.

SF CPQ does not offer a method to ensure the users click "Refresh Prices" as to automatically update the expiration date nor perform business logic such as validations that the user has completed the refresh step.

**Ideas for action**:  
* Use a scheduled flow / daily scheduled apex job to automatically move quotes to an expired state.
* Implement validations that prevent generating a quote document or submitting an order unless the expiration date is corrected.
* Implement a flag which prevents quotes at certain states such as ordered to prevent the QCP scripts from executing.
* Add expiration date to to field history tracking to log when the refresh occurred.



**Quote Line Group Quote Calculator Plugin (QCP):**

Example given is to correct behavior of the Optional flag on quote line group object, which incorrectly reports non-zero amounts when all of the lines are optional and the group is optional. 

Includes script to apply and release values in the Target Amount fields so that changes to line items do not continue to result in the same Target Amount without user reassigning the target prices.
