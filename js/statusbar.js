class StatusBar {
    constructor(owner) {
        this.Owner = owner;
        this.defaultstatustext = "...";
        this.UI = this.Create();
    }
    //-------------------------------------------------
    GetInterface() {
        return this.UI;
    }
    //-------------------------------------------------
    Create() {

        let UI = document.createElement("DIV");
        UI.className = "statusbar";
        //UI.onmousemove = this.ShowCopyright.bindEventListener(this);
        UI.onmouseout = (event)=>{
            this.ShowDefaultText(event);
        }
        this.panel = document.createElement("DIV");
        this.panel.className = "panel";

        UI.append(this.panel);
        return UI;
    }
    //-------------------------------------------------
    SetText(text) {
        this.panel.innerHTML = text;
        /*         setTimeout((event) => {
                    this.statusbarleftpanel.innerHTML = this.defaultstatustext;
                }, 1000); */
    }
    //-------------------------------------------------
    SetDefaultText(text) {
        if (text) {
            this.defaultstatustext = text;
        }
        this.panel.innerHTML = this.defaultstatustext;
    }
    //-------------------------------------------------
    ShowDefaultText(event) {
        this.panel.innerHTML = this.defaultstatustext;
    }
    //-------------------------------------------------
    ShowCopyright(event) {
        this.panel.innerHTML = "(c) Diris";
    }
    //-------------------------------------------------
}