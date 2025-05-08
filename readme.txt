db:
km_driven
----------
id
employee_id
plate
date
addr_start
addr_end
km_driven
km_before
km_now

cars:
----------
id
employee_id
plate

App should many pages
1st Page - Dashboard
Should have 2 Boxes
Left Box (Small Width):
-Form to add Drive
input date today, can be changed
should have automatic Location
if the Driver is near the addr_start it should add to addr_str the current Location, if the Driver is near the addr_end it should add t addr_end the current Location

-Select Element to select the Employee, preselected should be the loged in employee

-Select Element to select the Plate, preselected should be the Main Employee Car (Can Be changed in settings)

Under it should be all previous entries from newest to last, with filters

Right Box (Big Width):
Calendar with employee calendar fro es-web and there should be the drives too, able to click and change a drive.

2nd Page - Drives

Should have a list of all the drives listed and be able to change the drives and add drives,

If a drive is added or changed
-Change, have a select button to add after a drive, if drive is added, it gets the km_now from the previous record and adds ist km on top, it should add to all rows this kms driven on top, it should do it with the Dates and not ids

-Delete, if a user deletes a drive, it should after the deleted row substract to km_before and km_now the kms driven

3rd Page Settings:
User be able to Change his E-Mail, his Password, Add, Change, Remove Cars, Set Default car, open a ticket



