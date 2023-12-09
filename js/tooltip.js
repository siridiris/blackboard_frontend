let SHOWINGTOOLTIP=false;
class Tooltip {
    constructor(event, tiptext, options) {
        this.showdelay = 500; // ms
        this.hidedelay = 3500; // ms
        this.triggerevent = event;
        this.tiptext = tiptext;
        this.options = options;
        this.subtip = options && options.subtip ? options.subtip : null;
        this.shortcut = options && options.shortcut ? options.shortcut : null;
        this.HTML = options && options.HTML ? options.HTML : null;
        this.offset = {
            x: 8,
            y: 24,
        };
        this.UI = this.Create();

        this.triggerevent.target.addEventListener(
            "mouseleave",
            (event) => {
                this.Remove(event);
            },
            false
        );
        document.body.append(this.UI);
    }
    //-------------------------------------------------
    Create() {
        if(SHOWINGTOOLTIP){
            this.Remove();
            SHOWINGTOOLTIP=false;
            return
        }
        let ui = document.createElement("DIV");
        ui.className = "tooltip";
        let inner = document.createElement("DIV");
        inner.className = "inner";
        document.body.addEventListener("mousemove", (event) => {
            this.Show();
            this.UI.style.left =
                Math.min(window.innerWidth - this.UI.clientWidth, event.clientX + this.offset.x) - 8 + "px";
            this.UI.style.top =
                Math.min(window.innerHeight - this.UI.clientHeight, event.clientY + this.offset.y) + 8 + "px";
        });

        let maintip = document.createElement("DIV");
        maintip.className = "maintip";

        if (this.tiptext) {
            maintip.append(document.createTextNode(this.tiptext));
            inner.append(maintip);
        }
        if (this.subtip) {
            let subtip = document.createElement("DIV");
            subtip.className = "subtip";
            let parts = this.subtip.split("\n");
            parts.forEach((element) => {
                subtip.append(document.createTextNode(element));
                subtip.append(document.createElement("BR"));
            });
            inner.append(subtip);
        }
        if (this.shortcut) {
            let shortcut = document.createElement("DIV");
            shortcut.className = "shortcut";
            shortcut.append(document.createTextNode(this.options.shortcut));
            inner.append(shortcut);
        }

        if (this.HTML) {
            inner.append(this.HTML);
        }
        ui.append(inner);
        SHOWINGTOOLTIP=true;
        ui.style.zIndex = findHighestZ();

        return ui;
    }
    //-------------------------------------------------
    Show(event) {
        this.UI.style.display = "block";
        setTimeout((event) => {
            //this.triggerevent.target.style.border = "2px solid red"
            let x = parseInt(this.triggerevent.target.style.left);
            let y = parseInt(this.triggerevent.target.style.top);
            this.UI.style.left = Math.min(window.innerWidth - this.UI.clientWidth, x) - 8 + "px";
            this.UI.style.top = Math.min(window.innerHeight - this.UI.clientHeight, y) - 8 + "px";
        }, this.showdelay);

        this.removetimer = setTimeout((event) => {
            setTimeout((event) => {
                this.Remove(event);
            }, this.hidedelay);
        }, 1);
    }
    //-------------------------------------------------
    Remove(event) {
        if (this.UI && this.UI.parentNode) {
            this.UI.parentNode.removeChild(this.UI);
        }
        clearTimeout(this.removetimer);
        SHOWINGTOOLTIP=false;
    }
    //-------------------------------------------------
    GetInterface() {
        return this.UI;
    }
    //-------------------------------------------------
}
