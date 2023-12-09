class ToolBar {
    constructor(owner) {
        this.Owner = owner;
        this.panels = [];
        this.UI = this.Create();
        return this;
    }
    //-------------------------------------------------
    Create() {
        let ui = document.createElement("DIV");
        ui.className = "toolbar";
        let panel = document.createElement("DIV");
        panel.className = "panel";
        for (let i = 0; i < 3; i++) {
            let p = panel.cloneNode(true);
            this.panels.push(p);
            ui.append(p);
        }
        return ui;
    }
    //-------------------------------------------------
    GetInterface() {
        return this.UI;
    }
    //-------------------------------------------------
    AddElements(arr) {
        //console.log(arr)
        // add the elements in arr to the most-right panel
        for (let i = 0; i < arr.length; i++) {
            this.panels[this.panels.length - 1].append(arr[i]);
        }
    }
    //-------------------------------------------------
}
