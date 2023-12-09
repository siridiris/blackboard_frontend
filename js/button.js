class Button {
    constructor(owner, options) {
        this.Owner = owner;
        this.options = options;
        this.caption = this.options.caption ? this.options.caption : "\u200B"; /* zero-width space character */
        this.ID = this.options.id ? this.options.id : "";
        this.classname = this.options.classname ? this.options.classname : "";
        this.ischeckbutton = this.options.checked != undefined;
        this.ischecked = undefined;
        this.UI = this.Create();

        this.UI.onclick = this.options.func_click
            ? (event) => {
                  this.options.func_click(event);
              }
            : null;
        this.UI.oncontextmenu = (event) => {
            this.Kill(event);
        };

        this.UI.onmousedown = this.options.func_mousedown
            ? this.options.func_mousedown.bindEventListener(this.Owner)
            : null;
        this.UI.onmouseup = this.options.func_mouseup ? this.options.func_mouseup.bindEventListener(this.Owner) : null;
        if (this.ischeckbutton) {
            // optionally connect to CSS e.g. #togglecolorsbutton[checked="1"]
            this.SetChecked(this.options.checked);
        }
    }
    //-------------------------------------------------
    Kill(event) {
        if (event.stopPropagation) event.stopPropagation();

        event.cancelBubble = true;
        this.UI.click(event);
        return false;
    }
    //-------------------------------------------------
    GetInterface() {
        return this.UI;
    }
    //-------------------------------------------------
    /*     GetAppPointer() {
        let own = this.Owner;
        while (own && own.Owner != null) {
            own = own.Owner;
        }
        return own;
    } */
    //-------------------------------------------------
    Create() {
        let ui = document.createElement("DIV");
        ui.append(document.createTextNode(this.caption));
        if (this.options.title) {
            ui.addEventListener("mouseenter", (event) => {
                new Tooltip(event, this.options.title, this.options);
            });
        }
        ui.onclick = (event) => {
            this.TowerButtonClick(event);
        };
        if (this.ID) {
            ui.id = this.ID;
        }
        ui.classList = "towerbutton";
        if (this.classname) {
            ui.classList.add(this.classname);
        }
        return ui;
    }
    //-------------------------------------------------
    Disable() {
        this.UI.onclick = null;
        this.UI.classList.add("disabled");
    }
    //-------------------------------------------------
    Enable() {
        this.UI.onclick = this.options.func_click
            ? (event) => {
                  this.options.func_click(this.Owner);
              }
            : null;
        this.UI.classList.remove("disabled");
    }
    //-------------------------------------------------
    Hide(event) {
        this.UI.style.display = "none";
    }
    //-------------------------------------------------
    Show(event) {
        this.UI.style.display = "inline-flex";
    }
    //-------------------------------------------------
    TowerButtonClick(event) {
        //console.clear();
        if (this.ischeckbutton) {
            let checked = this.UI.getAttribute("checked") == (1 || true || "true") ? 0 : 1;
            this.UI.setAttribute("checked", checked);
            // store the state
            // localStorage.setItem(this.caption, this.IsChecked() ? 1 : 0);
        }
    }
    //-------------------------------------------------
    SetChecked(value) {
        let v = undefined;
        switch (value) {
            case 1:
            case "1":
            case true:
                v = 1;
                break;
            case 0:
            case "0":
            case false:
                v = 0;
                break;
        }
        this.ischecked = v;
        this.UI.setAttribute("checked", this.ischecked);
    }
    //-------------------------------------------------
    IsChecked() {
        return this.ischecked;
    }
    //-------------------------------------------------
}
