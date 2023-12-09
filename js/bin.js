class Bin {
    constructor(owner) {
        this.Owner = owner;
        this.UI = this.CreateUI();
        return this;
    }
    //-------------------------------------------------
    CreateUI() {
        let ui = document.createElement("DIV");
        ui.classList.add("bin", "disappear");
        ui.ondragover = (event) => {
            this.DragOver(event);
        };
        ui.ondragleave = (event) => {
            this.DragLeave(event);
        };
        ui.ondragover = (event) => {
            this.DragOver(event);
        };
        ui.ondrop = (event) => {
            this.Drop(event);
        };
        return ui;
    }
    //-------------------------------------------------
    GetInterface() {
        return this.UI;
    }
    //-------------------------------------------------
    Show(event) {
        this.UI.style.display = "block";
        this.UI.classList.add("appear");
        this.UI.classList.remove("disappear");
    }
    //-------------------------------------------------
    Hide(event) {
        this.UI.classList.remove("appear");
        this.UI.classList.add("disappear");
        setTimeout((event) => {
            this.UI.style.display = "none";
        }, 1000);
    }
    //-------------------------------------------------
    DragOver(event) {
        //console.log("OVER")
        event.preventDefault(); //important!!!
        this.UI.classList.add("dragover");
    }
    //-------------------------------------------------
    DragLeave(event) {
        //console.log("LEAVE")
        this.UI.classList.remove("dragover");
    }
    //-------------------------------------------------
    Drop(event) {
        this.UI.classList.remove("dragover");

        //console.log("DROP")
        let droppeditemofclasstype =
            this.Owner.draggedlink instanceof List ? "LIST" : this.Owner.draggedlink instanceof Page ? "PAGE" : null;

        switch (droppeditemofclasstype) {
            case "LIST": // console.log("DELETE LIST");
                if (this.Owner.draggedlink.id == this.Owner.listmanager.listdropdown.GetSelectedValue()) {
                    new TemporaryMessage("You cannot delete the Active List", {
                        fcolor: "var(--color_error)",
                        bcolor: "white",
                    });
                    return;
                } else {
                    this.Owner.listmanager.listdropdown.RemoveOption(new Event("bogus"), this.Owner.draggedlink);
                }
                this.Owner.About();
                break;
            case "PAGE": // user deletes the selected page
                if (this.Owner.draggedlink == this.Owner.selectedpage) {
                    this.Owner.SelectRandomPage();
                }
                this.Owner.DeletePage(this.Owner.draggedlink);

                this.Owner.About();
                break;
           default:
                new TemporaryMessage("UNHANDLED DROP CASE");
                console.error("UNHANDLED DROP CASE");
                break;
        }
    }
    //-------------------------------------------------
}
