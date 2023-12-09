class TemporaryMessage {
    constructor(text, options) {
        //alert(options.timeonscreen)
        this.message = text;
        this.timeout = null;
        this.fcolor = options?.fcolor ? options.fcolor : "dimgray";
        this.bcolor = options?.bcolor ? options.bcolor : "silver";
        this.align = options?.align ? options.align : "left";
        this.timeonscreen = options?.timeonscreen != null ? options.timeonscreen : 3500;
        this.Create();
        return this;
    }
    //-------------------------------------------------
    Create() {
        this.ui = document.createElement("DIV");
        this.ui.classList.add("dropshadow", "temporarymessage", "appear", "slide-in-bottom");

        this.ui.style.zIndex = findHighestZ(); // call to external function
        
        this.ui.style.color = this.fcolor;
        this.ui.style.backgroundColor = this.bcolor;

        switch (this.align) {
            case "right":
                this.ui.style.left = "20px";
                this.ui.style.right = "unset";
                break;
            case "right":
                this.ui.style.right = "20px";
                this.ui.style.left = "unset";
                break;
        }
        this.ui.append(document.createTextNode(this.message));
        this.ui.onmouseenter = (event) => {
            this.Pause(event);
        };
        this.ui.onmouseleave = (event) => {
            this.RestartTimeout(event);
        };

        document.body.append(this.ui);

        this.StartTimeout(this.timeonscreen);
    }
    //-------------------------------------------------
    StartTimeout(millisec) {
        this.timeout = window.setTimeout((event) => {
            this.ui.classList.replace("appear", "disappear");
            this.ui.classList.replace("slide-in-bottom", "slide-out-bottom");
            window.setTimeout((event) => {
                this.Destroy();
            }, millisec);
        }, millisec);
    }
    //-------------------------------------------------
    Destroy() {
        if (this.ui && this.ui.parentNode) {
            this.ui.parentNode.removeChild(this.ui);
        }
    }
    //-------------------------------------------------
    Pause(event) {
        clearTimeout(this.timeout);
    }
    //-------------------------------------------------
    RestartTimeout() {
        // start the timeout with 0 milliseconds -> this.triggers the CSS slideout
        this.StartTimeout(1);
    }
    //-------------------------------------------------
}
