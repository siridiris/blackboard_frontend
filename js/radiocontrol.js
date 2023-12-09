class RadioControl {
    constructor(owner, params) {
        this.Owner = owner;
        this.params = params;

        this.callback = this.params.callback;
        this.caption = this.params.caption ? this.params.caption : "";
        this.values = this.params.values;
        this.labels = this.params.labels;
        this.classname = this.params.cssclass ? this.params.cssclass : null;
        this.defaultvalue = this.params.defaultvalue;
        this.tooltip = this.params.tooltip ? this.params.tooltip : null;
        this.selectedValue = this.params.defaultvalue;
        this.UI = this.Create();
        this.UI.oncontextmenu = function (event) { // kill all event propagation on right click

            if (event.stopPropagation)
                event.stopPropagation();

            event.stopPropagation();
            return false;
        };
        return this;
    }
    //-------------------------------------------------
    Create() {
        let ui = document.createElement("SPAN");
        ui.className = "radiocontrolparent";
        if (this.classname) {
            ui.classList.add(this.classname);
        }

        // caption
        if (this.caption.trim().length > 0) {
            let span = document.createElement("SPAN");
            span.className = "radiolabel";
            let cpt = document.createTextNode(this.caption);
            span.append(cpt);
            ui.append(span);
        }
        // options
        this.options = document.createElement("DIV");
        this.options.className = "radiocontrol";
        ui.addEventListener("mouseenter", (event) => {
           
            //this.UI.style.backgroundColor = event.shiftKey ? "lime" : "";
            
            let t = this.params.tooltip && this.params.tooltip.trim().length > 0 ? this.params.tooltip.trim() : null;
            if (t) {
                new Tooltip(event, t, {
                    subtip: this.params.subtip
                });
            }
        });
        for (let i = 0; i < this.values.length; i++) {
            let btn = document.createElement("DIV");
            btn.className = "option " + "radiooption-" + this.values[i];
            let caption = this.labels[i].length == 0 ? "​" : this.labels[i]; // zero width space character
            btn.append(document.createTextNode(caption));

            btn.setAttribute("value", this.values[i]);
            btn.onclick = (event)=>{
                this.SelectRadioOption(event, this.values[i]);
            }
            //btn.onmousemove = this.HoverOn.bindEventListener(this);
            //btn.onmouseout = this.HoverOff.bindEventListener(this);
            this.values[i] == this.defaultvalue ? btn.classList.add("selected") : btn.classList.remove("selected"); // doesn't work when this.defaultvalue = false!
            this.options.append(btn);
        }
        ui.append(this.options);
        return ui;
    }
    //-------------------------------------------------
    GetInterface() {
        return this.UI;
    }
    //-------------------------------------------------
    Hide() {
        this.UI.style.display = "none";
    }
    //-------------------------------------------------
    Show() {
        this.UI.style.display = "";
    }
    //-------------------------------------------------
    GetSelectedValue() {
        //console.log("RADIOCONTROL > GetValue", this.selectedValue)
        return this.selectedValue;
    }
    //-------------------------------------------------
    SelectRadioOption(event, value) {
        if (value !== this.selectedValue) {
            // the user clicked another option than the currently selected option
            this.selectedValue = value;
            //console.log("RADIOCONTROL > SelectRadioOption", value)
            for (let i = 0; i < this.options.childNodes.length; i++) {
                this.values[i] == value ? this.options.childNodes[i].classList.add("selected") : this.options.childNodes[i].classList.remove("selected");
            }

            if (this.callback) {
                // call the owner's callback function and pass the selected value
                this.callback();
            }
            // localStorage.setItem(this.label, this.selectedValue);
        }
    }

    //-------------------------------------------------
    SetRadioButton(value) {
        for (let i = 0; i < this.options.childNodes.length; i++) {
            this.values[i] == value ? this.options.childNodes[i].classList.add("selected") : this.options.childNodes[i].classList.remove("selected");
            this.options.childNodes[i].style.cursor = this.values[i] == value ? "default" : "pointer";
        }
    }
    //-------------------------------------------------
}