(.. | objects | select(has("value")) | 
select (

( .cedsid == "000279" and .entitytype == "staff"  ) or # Phone number
( .cedsid == "000269" and .entitytype == "staff"  ) or # Street
( .cedsid == "000040" and .entitytype == "staff"  ) or # City
( .cedsid == "000214" and .entitytype == "staff"  ) or # Postal Code
( .cedsid == "000606" and .entitytype == "staff"  ) or # Longitutde
( .cedsid == "000607" and .entitytype == "staff"  ) or # Latitude
( .cedsid == "000088" and .entitytype == "staff"  ) or # Email
( .cedsid == "000115" and .entitytype == "staff"  ) or # Given Name
( .cedsid == "000172" and .entitytype == "staff"  ) or # Family Name
( .cedsid == "000184" and .entitytype == "staff"  ) or # Middle Name
( .cedsid == "000121" and .entitytype == "staff"  ) or # Suffix
( .cedsid == "000212" and .entitytype == "staff"  ) or # Honorific
( .cedsid == "000213" and .entitytype == "staff"  ) or # Position Title
( .cedsid == "001070" and .entitytype == "staff"  ) or # Staff Identifier

( .cedsid == "000279" and .entitytype == "student"  ) or 
( .cedsid == "000269" and .entitytype == "student"  ) or 
( .cedsid == "000214" and .entitytype == "student"  ) or 
( .cedsid == "000040" and .entitytype == "student"  ) or 
( .cedsid == "000606" and .entitytype == "student"  ) or 
( .cedsid == "000607" and .entitytype == "student"  ) or 
( .cedsid == "000088" and .entitytype == "student"  ) or
( .cedsid == "000115" and .entitytype == "student"  ) or
( .cedsid == "000172" and .entitytype == "student"  ) or
( .cedsid == "000184" and .entitytype == "student"  ) or
( .cedsid == "000121" and .entitytype == "student"  ) or
( .cedsid == "000212" and .entitytype == "student"  ) or
( .cedsid == "001071" and .entitytype == "student"  ) or # Student Identifier
( .cedsid == "000584" and .entitytype == "student"  ) or # Cohort Graduation Year
( .cedsid == "000107" and .entitytype == "student"  ) or # Exit Date
( .cedsid == "001069" and .entitytype == "student"  ) or # School Identifier
( .cedsid == "000226" and .entitytype == "student"  ) or # Projected Graduation Date
( .cedsid == "000006" and .entitytype == "student"  ) or # Activity Identifier
( .cedsid == "000100" and .entitytype == "student"  ) or # Entry Grade Level
( .cedsid == "000529" and .entitytype == "student"  ) or # First Entry Date into a US School



( .cedsid == "999999" )


)) 

|= "suppressed"

#  | del(.. | select(. == "suppressed"))
