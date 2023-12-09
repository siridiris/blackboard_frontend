class SearchControl {
    constructor(owner, placeholdertext) {
        this.placeholdertext = placeholdertext || "Find A Title ... ";
        this.Owner = owner;
        this.CreateUI();
        return this;
    }
    //-------------------------------------------------
    GetInterface() {
        return this.UI;
    }
    //-------------------------------------------------
    Hide() {
        this.UI.style.opacity = 0.25;
        this.UI.field.style.cursor = "not-allowed";
    }
    //-------------------------------------------------
    Show() {
        this.UI.style.opacity = "";
        this.UI.field.style.cursor = "";
    }
    //-------------------------------------------------
    CreateUI() {
        this.UI = document.createElement("DIV");
        this.UI.className = "searchcontrol";

        this.UI.field = document.createElement("INPUT");
        this.UI.field.setAttribute("placeholder", this.placeholdertext);
        this.UI.field.onkeyup = (event) => {
            this.KeyUp(event);
        };
        this.UI.field.onkeydown = (event) => {
            this.KeyDown(event);
        };
        //this.UI.field.onclick = cancelEvent(this);
        this.UI.field.onfocus = (event) => {
            this.Select(event);
        };

        this.UI.clearbutton = document.createElement("DIV");
        this.UI.clearbutton.className = "clearinput";
        this.UI.clearbutton.append(document.createTextNode(""));
        this.UI.clearbutton.onclick = (event)=>{
            this.Clear(event);
        }
        this.UI.append(this.UI.field);
        this.UI.append(this.UI.clearbutton);
        this.UI.oncontextmenu = function (event) {
            // kill all event propagation on right click
            if (event.stopPropagation) {
                event.stopPropagation();
            }
            return false;
        };
        return this.UI;
    }
    //-------------------------------------------------
    KeyDown(event) {
        if (event.key === "Escape") {
            event.preventDefault();
            this.Clear(event);
            cancelEvent(event);
            return;
        } else if (event.which === 32 && this.UI.field.value.length == 0) {
            // reject SPACE as the FIRST character
            cancelEvent(event);
            return false;
        } else if (event.shiftKey) {
            this.KeyUp(event);
        }
    }
    //-------------------------------------------------
    Clear(event) {
        this.UI.field.value = "";
        this.Owner.ProcessQuery(this.UI.field.value);
    }
    //-------------------------------------------------
    Select(event) {
        this.UI.field.select();
        cancelEvent(event);
    }
    //-------------------------------------------------
    KeyUp(event) {
        if ((event.which === 32 && this.UI.field.value.length == 0) || event.key === ".") {
            // reject SPACE as the FIRST character
            this.Clear();
            cancelEvent(event);
            return false;
        } else {
            var items = this.Owner.ProcessQuery(this.UI.field.value);
        }
    }
    //-------------------------------------------------
    SetValue(string) {
        this.UI.field.value = string;
        this.Owner.ProcessQuery(this.UI.field.value);
    }
    //-------------------------------------------------
}
