privacydemo

Nick Nicholas, NSIP 2014
nick.nicholas@nsip.edu.au

Code to demonstrate permissions profiling of [SIF](https://www.sifassociation.org/) content through [CEDS](http://ceds.ed.gov/) ids, using JSON injection into payloads.

The code is in Javascript running via node.js. The script is `sifproc.js`, which loads as its static page `sif.html`.

The script illustrates the approach taken for filtering, which is done on JSON rather than XML:

1. Convert SIF/XML to JSON (`json2xml()`)
2. Inject CEDS identifiers (`schoolinfo.jq`)
3. Filter out elements based on CEDS identifier (`filter.hi.jq, filter.mid.jq, filter.lo.jq`)
4. Remove CEDS identifiers, and convert filtered JSON back to SIF/XML (`remove_cedsId.jq, xml2json()`)

The filters are in jq, and presuppose SIF-AU 1.3 for the XML to be filtered. 

Three possible security values are set in the script:

* High: Run filter.hi.jq only
* Medium: Run filter.hi.jq then filter.mid.jq
* Low: Run filter.hi.jq then filter.mid.jq then filter.lo.jq
* Public: no filtering

The filters cover the SBP subset of SIF-AU 1.3, plus the SIF3Assessment* objects. Only those elements with privacy implications
are present in the CEDS injection or privacy filters; other values are ignored.

The elements are chosen for filtering based on the data area they belong to; the assignments are somewhat arbitrary, 
and should not be confused for advice from a privacy officer. They should be taken as a starting point.

#ISSUES

1. Note that certain Australian elements have no CEDS equivalent, as CEDS has been developed for the US; for example,
`StudentPersonal/YoungCarersRole`. Those elements will not be filtered out by these filters.

2. The filters substitute the text "suppressed" for the elements to be eliminated, for illustrative purposes. This yields
XML which may not parse successfully, and which may still reveal too much about the individuals. In a production environment,
it is preferable to remove the elements involved, rather than inject "suppressed" text. In jq, a simply way of doing so
is by appending  
```
| del(.. | select(. == "suppressed"))
```
(select all nodes in the object tree whose value is "suppressed", and delete them).

3. The jq output, for both filtering and CEDS insertion, contains a lot of empty values for keys, which will convert to empty
XML tags. These can be removed in JSON or in XML; if there is any real demand, please get in touch.

4. The Goessner converter between XML and JSON does not know about the XSD; as a result, it will convert a list with multiple elements
into a JSON array, but a list wiht a single element into an object. (e.g. `<Blist><B>X</B><B>Y</B></Blist> => {Blist: [{B: X}, {B: Y}] ;
<Blist><B>X</B></Blist> => {Blist: {B: X} } )` This trips up the JQ filters for injecting CEDS identifiers, which expect different paths
for single values and for arrays: 

* `.SchoolInfo.PhoneNumberList.PhoneNumber.Number`  is used for a single PhoneNumber value within PhoneNumberList
* `.SchoolInfo.PhoneNumberList.PhoneNumber[].Number`  is used for multiple  PhoneNumber values within PhoneNumberList

This complicates the expressions used on the left hand side of the CEDS injection filter: using either expression unmodified will lead 
to an error, and empty output. A generic matching expression needs to deal with both single elements and arrays with the same index; in JQ
the foregoing becomes:

```
(.SchoolInfo.SchoolContactList.SchoolContact|((arrays|.[]),objects).ContactInfo.PhoneNumberList.PhoneNumber|((arrays|.[]),objects).Number) 
```

That is, at the point where either a single element or an array can turn up, insert `|((arrays|.[]),objects)` --- running two filters in
parallel: one (`arrays`) where the next element down is an array, exploding it into its components (`[]`), and one (`objects`) where the next
element down is a single object. (Running the filters in parallel would normally lead to multiple outputs; but in the CEDS injection filter
the update (`|=`) operator is used, which modifies the object tree in situ.

Likewise, an match for `.SchoolInfo.YearLevels.YearLevel`, which could be either a single or multiple elements, becomes

```
(.SchoolInfo.YearLevels.YearLevel |((arrays|.[]),objects))
```

instead of the two incompatible filters

```
.SchoolInfo.YearLevels.YearLevel
.SchoolInfo.YearLevels.YearLevel[]
```

For generality, this filter step needs to be injected wherever there is an element within a list in the SIF/XML.

This reduces the legibility of the JQ, but oh well.

#RUNNING

Change the path to sif.html in sifproc.js to your absolute path:
```
    res.sendFile('/Users/nickn/Documents/Arbeit/sifproc/sif.html');
```
Then run the script:
```
node sifproc.js
```
You can then load XML for filtering at:
```
http://127.0.0.1:9999/
```

#ACKNOWLEDGEMENTS

The scripts incorporate the following:

json2xml(), xml2json() are licensed under Creative Commons GNU LGPL License, from Stefan Goessner: http://goessner.net/download/prj/jsonxml/

hilitor.js is by Ger Hobbelt: https://github.com/GerHobbelt/hilitor

json.human.js is licensed under the MIT open source license, from Mariano Guerra: https://github.com/marianoguerra/json.human.js


#DEPENDENCIES

Install jq on the command line: https://github.com/stedolan/jq (or ```brew install jq```)

Install node.js

install all the requisite modules in sifproc.js:
```
npm install xmldom
npm install express
npm install body-parser
npm install method-override
npm install pretty-data
```
