class DropDown {
    constructor(owner, params) {
        this.Owner = owner;
        this.params = params;

        this.callback = this.params.callback;
        this.caption = this.params.caption ? this.params.caption : "";
        this.values = this.params.values;
        this.labels = this.params.labels;
        this.classname = this.params.cssclass ? this.params.cssclass : null;
        this.defaultvalue = this.params.defaultvalue ? this.params.defaultvalue : "<LISTS>";
        this.tooltip = this.params.tooltip ? this.params.tooltip : null;
        this.selectedValue = this.params.defaultvalue;
        this.options = [];
        this.UI = this.Create();
        this.UI.oncontextmenu = function (event) {
            // kill all event propagation on right click
            if (event.stopPropagation) event.stopPropagation();
            return false;
        };
    }
    //-------------------------------------------------
    GetInterface() {
        return this.UI;
    }
    //-------------------------------------------------
    Create() {
        let ui = document.createElement("DIV");
        ui.classList.add("dropdowncontrol");
        ui.onmouseenter = (event) => {
            this.ShowOptions(event);
        };
        ui.onmouseleave = (event) => {
            //this.HideOptions(event);
        };

        this.itemlistcontainer = document.createElement("DIV");
        this.itemlistcontainer.classList.add("itemlistcontainer");
        this.itemlistcontainer.onmouseleave = (event) => {
            this.HideOptions(event);
        };

        this.selectedoption = document.createElement("DIV");
        this.selectedoption.classList.add("subtitle");
        this.selectedoption.innerHTML = "Your Lists..."; // default, when no list
        this.selectedoption.onclick = (event) => {
            this.ToggleOptions(event);
        };
        this.selectedoption.onmouseenter = (event) => {
            new Tooltip(event, "Hover To Show Lists", {
                //subtip: "If Mouse Leaves This Area The Lists Will Be Hidden",
                shortcut: "L, l",
            });
        };

        ui.append(this.selectedoption);

        // options
        this.optionspanel = document.createElement("DIV");
        this.optionspanel.classList.add("itemlist", "glassmorphism");
        if (this.classname) {
            this.optionspanel.classList.add(this.classname);
        }
        this.itemlistcontainer.append(this.optionspanel);
        ui.append(this.itemlistcontainer);

        return ui;
    }
    //-------------------------------------------------
    Select(option) {
        this.options.forEach((o) => {
            if (option == o) {
                o.GetInterface().classList.add("selected");
                this.selectedValue = o.id;
                this.selectedoption.innerHTML = o.name;
                alert("HUHU");
            } else {
                o.GetInterface().classList.remove("selected");
            }
        });
    }
    //-------------------------------------------------
    AddList(record) {
        //console.log("adding lijst", record)
        let opt = new List(this, record);
        this.options.push(opt);
        this.optionspanel.append(opt.GetInterface());
        if (record.id == parseInt(this.selectedValue)) {
            opt.Select();
        }
    }
    //-------------------------------------------------
    RemoveOption(event, option) {
        //console.log("RemoveOption ?", event, option);
        event.stopPropagation();

        if (option.id === this.GetSelectedValue()) {
            new TemporaryMessage("You cannot delete the Active List", {
                fcolor: "var(--color_error)",
                bcolor: "white",
            });
            return;
        }

        this.options.forEach((opt) => {
            if (opt.id === option.id) {
                if (confirm("Delete " + option.name + " from the database?")) {
                    // remove from DOM on the client
                    this.optionspanel.removeChild(option.GetInterface());
                    // remove from the DATABASE on the server
                    fetch(HOST+"deletelijst/" + option.id);
                }
            }
        });
    }
    //-------------------------------------------------
    ShowOptions(event) {
        this.itemlistcontainer.style.display = "flex";
        this.selectedoption.innerHTML = "Pick A List...";
    }
    //-------------------------------------------------
    HideOptions(event) {
        this.itemlistcontainer.style.display = "none";
        this.selectedoption.innerHTML = this.GetOptionTitle(this.GetSelectedValue());
    }
    //-------------------------------------------------
    ToggleOptions(event) {
        this.itemlistcontainer.style.display == "flex" ? this.HideOptions(event) : this.ShowOptions(event);
    }
    //-------------------------------------------------
    GetOptionTitle(id) {
        for (var i = 0; i < this.options.length; i++) {
            if (this.options[i].id == id) {
                return this.options[i].name;
            }
        }
        return ""; // no active list
    }
    //-------------------------------------------------
    GetSelectedValue() {
        return this.selectedValue;
    }
    //-------------------------------------------------
    SelectOption(event, value) {
        console.log("DROPDOWN > SelectedOption", value);
        // the user clicked another option than the currently selected option
        this.selectedValue = value;
        for (let i = 0; i < this.options.length; i++) {
            let option = this.options[i];
            let nodeui = option.GetInterface();
            if (this.selectedValue == option.id) {
                nodeui.classList.add("selected");
                this.selectedoption.innerHTML = option.caption;
                this.Owner.LoadList(option,this.selectedValue);
            } else {
                nodeui.classList.remove("selected");
                nodeui.onclick = (event) => {
                    this.SelectOption(event, option.id);
                };
            }
        }

        if (this.callback) {
            // call the owner's callback function and pass the selected value
            this.callback();
        }
        // localStorage,setItem(this.label, this.selectedValue);
        this.ToggleOptions(event);
    }
    //-------------------------------------------------
}
