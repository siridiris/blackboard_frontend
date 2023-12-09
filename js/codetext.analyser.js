class CodetextAnalyser {
    constructor(page, codetext) {
        this.page = page;
        this.tags = {};
        this.source = "\n" + codetext; //pre-pend a newline to accommodate \n's in REGEXP
        this.pageHTMLparts = [];
        this.Analyse();
        return this;
    }
    //-------------------------------------------------
    Analyse() {
        const REGEXP = new RegExp(
            /(\nINSTRUCTION\s\d*|\nCODE\s?\d*|\nDEFINITIE\s?\d*|\nINTRO\s?\d*|\nHTML\s?\d*|\nSTYLE\s?\d*|\nSCRIPT\s?\d*|\nPART\s?\d*|\nNOTES\s?\d*|\nFIGURE\s?\d*|\nIMAGE\s?\d*)/,
            "g"
        );
        // for some unknown reason (to me) the first element of the array is an EMPTY STRING ???
        // remove that effin' first element (".splice(0,1")
        let arr = this.source.split(REGEXP);
        arr.splice(0, 1);

        for (let i = 0; i < arr.length - 1; i += 2) {
            arr[i] = arr[i].trim();

            let node = document.createElement("DIV");
            let structtag = arr[i];
            structtag = structtag.replace(/[\s|\d]/g, "");
            node.classList.add("fade-in", "part", structtag);

            let structure = document.createElement("DIV");
            structure.className = "structural";
            structure.append(document.createTextNode(arr[i]));

            let section = document.createElement("DIV");
            section.classList.add("section");
            let keywords = ["class", "object", "method", "script"];

            // 2. format the section part and check each line
            let lines = arr[i + 1].split(/\n/);
            for (let l = 0; l < lines.length; l++) {
                // analyse the words in every lines[l]
                let words = lines[l].split(/(\s+)/gim);
                let lineHTML = document.createElement("DIV");
                for (let w = 0; w < words.length; w++) {
                    let span = document.createElement("SPAN");
                    if (words[w].length > 0) {
                        span.append(words[w]);
                        lineHTML.append(span);
                    }
                    // is it a keyword?
                    if (keywords.indexOf(words[w].toLowerCase()) != -1) {
                        span.classList.add("keyword");
                    }
                    // it is a link?
                    // make links from URLS
                    let urlRegex = /(https?:\/\/[^\s]+)/;

                    var urlMatch = words[w].match(urlRegex);
                    if (urlMatch) {
                        //console.log(urlMatch);
                        var a = document.createElement("SPAN");
                        a.classList.add()
                        a.append(words[w]);
                        span.onclick = (event) => {
                            window.open(words[w]);
                        };
                        span.classList.add("hyperlink");
                        //lineHTML.append(a);
                    }
                }
                if (lines[l].trimEnd().length == 0) {
                    section.append(" ");
                } else {
                    section.append(lineHTML);
                }
            }

            /*
            if(arr[i]=="HTML" ||arr[i]== "SCRIPT"){// how to insert and execute javascript???
                node.append(structure);
                node.append(section);
                section.innerHTML+=arr[i+1];
            }
            */

            node.append(structure);
            node.append(section);

            this.pageHTMLparts.push(node);
        }
        return this;
    }
    //-------------------------------------------------
}
