/* Goessner.net */
/*	This work is licensed under Creative Commons GNU LGPL License.

	License: http://creativecommons.org/licenses/LGPL/2.1/
   Version: 0.9
	Author:  Stefan Goessner/2006
	Web:     http://goessner.net/ 
*/
function json2xml(o, tab) {
    var toXml = function(v, name, ind) {
            var xml = "";
            if (v instanceof Array) {
                for (var i = 0, n = v.length; i < n; i++)
                    xml += ind + toXml(v[i], name, ind + "\t") + "\n";
            } else if (typeof(v) == "object") {
                var hasChild = false;
                xml += ind + "<" + name;
                for (var m in v) {
                    if (m.charAt(0) == "@")
                        xml += " " + m.substr(1) + "=\"" + v[m].toString() + "\"";
                    else
                        hasChild = true;
                }
                xml += hasChild ? ">" : "/>";
                if (hasChild) {
                    for (var m in v) {
                        if (m == "#text")
                            xml += v[m];
                        else if (m == "#cdata")
                            xml += "<![CDATA[" + v[m] + "]]>";
                        else if (m.charAt(0) != "@")
                            xml += toXml(v[m], m, ind + "\t");
                    }
                    xml += (xml.charAt(xml.length - 1) == "\n" ? ind : "") + "</" + name + ">";
                }
            } else {
                xml += ind + "<" + name + ">" + v.toString() + "</" + name + ">";
            }
            return xml;
        },
        xml = "";
    for (var m in o)
        xml += toXml(o[m], m, "");
    return tab ? xml.replace(/\t/g, tab) : xml.replace(/\t|\n/g, "");
}

function xml2json(xml, tab) {
    var X = {
        toObj: function(xml) {
            var o = {};
            if (xml.nodeType == 1) { // element node ..
                if (xml.attributes.length) // element with attributes  ..
                    for (var i = 0; i < xml.attributes.length; i++)
                    o["@" + xml.attributes[i].nodeName] = (xml.attributes[i].nodeValue || "").toString();
                if (xml.firstChild) { // element has child nodes ..
                    var textChild = 0,
                        cdataChild = 0,
                        hasElementChild = false;
                    for (var n = xml.firstChild; n; n = n.nextSibling) {
                        if (n.nodeType == 1) hasElementChild = true;
                        else if (n.nodeType == 3 && n.nodeValue.match(/[^ \f\n\r\t\v]/)) textChild++; // non-whitespace text
                        else if (n.nodeType == 4) cdataChild++; // cdata section node
                    }
                    if (hasElementChild) {
                        if (textChild < 2 && cdataChild < 2) { // structured element with evtl. a single text or/and cdata node ..
                            X.removeWhite(xml);
                            for (var n = xml.firstChild; n; n = n.nextSibling) {
                                if (n.nodeType == 3) // text node
                                    o["#text"] = X.escape(n.nodeValue);
                                else if (n.nodeType == 4) // cdata node
                                    o["#cdata"] = X.escape(n.nodeValue);
                                else if (o[n.nodeName]) { // multiple occurence of element ..
                                    if (o[n.nodeName] instanceof Array)
                                        o[n.nodeName][o[n.nodeName].length] = X.toObj(n);
                                    else
                                        o[n.nodeName] = [o[n.nodeName], X.toObj(n)];
                                } else // first occurence of element..
                                    o[n.nodeName] = X.toObj(n);
                            }
                        } else { // mixed content
                            if (!xml.attributes.length)
                                o = X.escape(X.innerXml(xml));
                            else
                                o["#text"] = X.escape(X.innerXml(xml));
                        }
                    } else if (textChild) { // pure text
                        if (!xml.attributes.length)
                            o = X.escape(X.innerXml(xml));
                        else
                            o["#text"] = X.escape(X.innerXml(xml));
                    } else if (cdataChild) { // cdata
                        if (cdataChild > 1)
                            o = X.escape(X.innerXml(xml));
                        else
                            for (var n = xml.firstChild; n; n = n.nextSibling)
                                o["#cdata"] = X.escape(n.nodeValue);
                    }
                }
                if (!xml.attributes.length && !xml.firstChild) o = null;
            } else if (xml.nodeType == 9) { // document.node
                o = X.toObj(xml.documentElement);
            } else
                alert("unhandled node type: " + xml.nodeType);
            return o;
        },
        toJson: function(o, name, ind) {
            var json = name ? ("\"" + name + "\"") : "";
            if (o instanceof Array) {
                for (var i = 0, n = o.length; i < n; i++)
                    o[i] = X.toJson(o[i], "", ind + "\t");
                json += (name ? ":[" : "[") + (o.length > 1 ? ("\n" + ind + "\t" + o.join(",\n" + ind + "\t") + "\n" + ind) : o.join("")) + "]";
            } else if (o == null)
                json += (name && ":") + "null";
            else if (typeof(o) == "object") {
                var arr = [];
                for (var m in o)
                    arr[arr.length] = X.toJson(o[m], m, ind + "\t");
                json += (name ? ":{" : "{") + (arr.length > 1 ? ("\n" + ind + "\t" + arr.join(",\n" + ind + "\t") + "\n" + ind) : arr.join("")) + "}";
            } else if (typeof(o) == "string")
                json += (name && ":") + "\"" + o.toString() + "\"";
            else
                json += (name && ":") + o.toString();
            return json;
        },
        innerXml: function(node) {
            var s = ""
            if ("innerHTML" in node)
                s = node.innerHTML;
            else {
                var asXml = function(n) {
                    var s = "";
                    if (n.nodeType == 1) {
                        s += "<" + n.nodeName;
                        for (var i = 0; i < n.attributes.length; i++)
                            s += " " + n.attributes[i].nodeName + "=\"" + (n.attributes[i].nodeValue || "").toString() + "\"";
                        if (n.firstChild) {
                            s += ">";
                            for (var c = n.firstChild; c; c = c.nextSibling)
                                s += asXml(c);
                            s += "</" + n.nodeName + ">";
                        } else
                            s += "/>";
                    } else if (n.nodeType == 3)
                        s += n.nodeValue;
                    else if (n.nodeType == 4)
                        s += "<![CDATA[" + n.nodeValue + "]]>";
                    return s;
                };
                for (var c = node.firstChild; c; c = c.nextSibling)
                    s += asXml(c);
            }
            return s;
        },
        escape: function(txt) {
            return txt.replace(/[\\]/g, "\\\\")
                .replace(/[\"]/g, '\\"')
                .replace(/[\n]/g, '\\n')
                .replace(/[\r]/g, '\\r');
        },
        removeWhite: function(e) {
            e.normalize();
            for (var n = e.firstChild; n;) {
                if (n.nodeType == 3) { // text node
                    if (!n.nodeValue.match(/[^ \f\n\r\t\v]/)) { // pure whitespace text node
                        var nxt = n.nextSibling;
                        e.removeChild(n);
                        n = nxt;
                    } else
                        n = n.nextSibling;
                } else if (n.nodeType == 1) { // element node
                    X.removeWhite(n);
                    n = n.nextSibling;
                } else // any other node
                    n = n.nextSibling;
            }
            return e;
        }
    };
    if (xml.nodeType == 9) // document node
        xml = xml.documentElement;
    var json = X.toJson(X.toObj(X.removeWhite(xml)), xml.nodeName, "\t");
    return "{\n" + tab + (tab ? json.replace(/\t/g, tab) : json.replace(/\t|\n/g, "")) + "\n}";
}

function parseXml(xml) {
    var dom = null;
    var DOMParser = require('xmldom').DOMParser;
    try {
        dom = (new DOMParser()).parseFromString(xml, "text/xml");
    } catch (e) {
        dom = null;
    }
    return dom;
}

/* end Goessner */

/* JQ filters */

var jq1; /* child process for jq for ceds injection */
var jq2; /* child process for jq for ceds filtering */
var jq3; /* child process for jq for removing ceds injection */

/* jq-tutorial */
var exec = require('child_process').exec;
/* jq: child process; input: stream; callback */
function run_jq(jq, input, callback) {
    var data;
    //jq1 = spawn('jq', ['-f', datafile], {stdin: 'pipe'} );
    input.pipe(jq.stdin);
    data = '';
    jq.stdout.on("data", function(x) {
        data += x;
    });
    jq.on("close", function(code) {
        //console.log(data);
        return callback(data);
    });


}




/* end JQ filters */

var express = require('express');
var http = require('http');
var app = express();
app.use(express.static(__dirname /*+ '/public'*/));

var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var prettydata = require('pretty-data');
var spawn = require('child_process').spawn;

var urlencodedParser = bodyParser.urlencoded({
    extended: false
})

app.use(bodyParser.json())
app.use(methodOverride('X-HTTP-Method-Override'));




app.get('/', function(req, res) {
    res.sendFile('/Users/nickn/Documents/Arbeit/sifproc/sif.html');
});

app.post('/myaction', urlencodedParser, function(req, res) {

        var dom = parseXml(req.body.siftext);
        var profile = req.body.profile;
        var json = xml2json(dom, '\t');
	var jsonhuman = require('./json.human.js-master/src/json.human.js');
        var body = JSON.stringify(json.replace(/\t/g, '&nbsp;&nbsp;'), null, 2);

        /* http://www.no-margin-for-errors.com/blog/2010/07/26/deliver-real-time-information-to-your-users-using-node-js/ */
        var ret = {};
        ret.json = body;
        ret.ceds = req.op;
        if (req.body.op == 'JSON') {

            ret.output = ret.json;
	ret.pretty = jsonhuman(JSON.parse(json)).outerHTML;

            res.send(ret);
        }
        if (req.body.op == 'Inject CEDS' || req.body.op == 'Filter CEDS' || req.body.op == 'Filtered XML') {
            var stream = require('stream');
            var s = new stream.Readable();
            s._read = function noop() {};
            s.push(json);
            s.push(null);
            jq1 = spawn('jq', ['-f', 'schoolinfo.jq'], { stdin: 'pipe' });
    	    //s.pipe(jq1.stdin);



            run_jq(jq1, s, function(data) {
                ret.ceds = data; /*console.log(ret);*/
                if (req.body.op == 'Inject CEDS') {
                    ret.output = JSON.stringify(ret.ceds, null, 2).replace(/  /g, '&nbsp;&nbsp;'); /*console.log(ret.output);*/
			ret.pretty = jsonhuman(JSON.parse(data)).outerHTML;
                    res.send(ret);
                }
            });
            //console.log(jq1);
        }
        if (req.body.op == 'Filter CEDS' || req.body.op == 'Filtered XML') {
            //console.log("XXX");


		var filtered_ceds_callback = function(data) {
                ret.filtered_ceds = data; //console.log(ret);
                if (req.body.op == 'Filter CEDS') {
                    ret.output = JSON.stringify(ret.filtered_ceds, null, 2).replace(/  /g, '&nbsp;&nbsp;'); 
                        ret.pretty = jsonhuman(JSON.parse(data)).outerHTML;
                    res.send(ret);
                }
            };

		if (profile == 'Hi' ) {
            		jq2 = spawn('jq', ['-f', 'filter.hi.jq'], { stdin: 'pipe' });
            		run_jq(jq2, jq1.stdout, filtered_ceds_callback);
		} 
		else if (profile == 'Med' ) {
            		var jq_hi = spawn('jq', ['-f', 'filter.hi.jq'], { stdin: 'pipe' });
            		jq2 = spawn('jq', ['-f', 'filter.mid.jq'], { stdin: 'pipe' });
    			//jq1.pipe(jq_hi.stdin);
            		run_jq(jq_hi, jq1.stdout, function(data){});
            		run_jq(jq2, jq_hi.stdout, filtered_ceds_callback);
		} 
		if (profile == 'Low' || profile == 'Public' ) {
            		var jq_hi = spawn('jq', ['-f', 'filter.hi.jq'], { stdin: 'pipe' });
            		var jq_mid = spawn('jq', ['-f', 'filter.mid.jq'], { stdin: 'pipe' });
            		jq2 = spawn('jq', ['-f', 'filter.lo.jq'], { stdin: 'pipe' });
            		run_jq(jq_hi, jq1.stdout, function(data){});
            		run_jq(jq_mid, jq_hi.stdout, function(data){});
            		run_jq(jq2, jq_mid.stdout, filtered_ceds_callback);
		}
	}
                if (req.body.op == 'Filtered XML') {

            		jq3 = spawn('jq', ['-f', 'remove_cedsId.jq'], { stdin: 'pipe' });
    	    		//jq2.pipe(jq3.stdin);
			run_jq(jq3, jq2.stdout, function(data) {
			ret_removed_cedsids = data;

                    var xml = prettydata.pd.xml(json2xml(JSON.parse(data),'\t'));
			console.log(xml); 
		ret.output = xml.replace(/  /g, '&nbsp;&nbsp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br/>'); 
			ret.pretty = jsonhuman(JSON.parse(data)).outerHTML;
			res.send(ret);
                });
	}
});
http.createServer(app).listen(9999, function() {
    console.log('Server running at http://127.0.0.1:9999/');
});
