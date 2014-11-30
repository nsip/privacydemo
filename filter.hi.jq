(.. | objects | select(has("cedsid")) | 
select (

( .cedsid == "000488" and .entitytype == "staff"  ) or # Disciplinary Action Taken
( .cedsid == "000439" and .entitytype == "staff"  ) or # Medical Alert Indicator

( .cedsid == "000488" and .entitytype == "student"  ) or 
( .cedsid == "000439" and .entitytype == "student"  ) or 
( .cedsid == "001244" and .entitytype == "student"  ) or # Program Gifted Eligibility Criteria
( .cedsid == "000122" and .entitytype == "student"  ) or # Gifted Talented Indicator
( .cedsid == "000086" and .entitytype == "student"  ) or # Economic Disadvantage Status
( .cedsid == "000180" and .entitytype == "student"  ) or # Limited English Proficiency Status
( .cedsid == "000577" and .entitytype == "student"  ) or # Disability Status
( .cedsid == "001339" and .entitytype == "student"  ) or # Early Learning Program Eligibility Status


( .cedsid == "999999" )


)) 

|= "suppressed"

