class List {
    constructor(owner, record) {
        //for(let p in record){console.log("LIST>RECORD",p, record[p])}
        this.record = record;
        this.Owner = owner;
        this.name = record.name;
        this.id = record.id;

        this.UI = this.Create();
    }
    //-------------------------------------------------
    Create() {
        let opt = document.createElement("DIV");
        opt.classList.add("item");
        opt.setAttribute("draggable", true);
        //opt.append(document.createTextNode(this.name + " (" + this.id + ")"));
        opt.onclick = (event) => {
            this.Select(event);
        };
        opt.ondragstart = (event) => {
            this.DragStart(event);
        };
        opt.ondragend = (event) => {
            this.DragEnd(event);
        };

        let caption = document.createElement("DIV");
        caption.classList.add("href");
        // caption.append(this.record.id + " · " + this.record.name);
        caption.append(this.record.name);

        opt.append(caption);
        return opt;
    }
    //-------------------------------------------------
    GetInterface() {
        return this.UI;
    }
    //-------------------------------------------------
    Select() {
        this.Owner.selectedValue = this.id; //update the selected value in the dropdown
        //alert("SELECT")
        this.Owner.selectedoption.innerHTML = this.name;
        this.Owner.Owner.GetPagesWithListId(this.record.id);
        this.Owner.HideOptions();
        this.UI.classList.add("selected");
    }
    //-------------------------------------------------
    Deselect() {
        this.UI.classList.remove("selected");
    }
    //-------------------------------------------------
    Remove(event) {
        this.Owner.RemoveOption(event, this);
    }
    //-------------------------------------------------
    DragStart(event) {
        /*  if (this.istheselectedlist) {
            this.UI.style.backgroundColor = "var(--color_error)";
            return false;😄
        } */
        if (this.Owner.Owner.Owner instanceof Curriculum) {
            //set the draggedlink of the curriculum to this list
            this.Owner.Owner.Owner.draggedlink = this;
        }
        this.Owner.Owner.Owner.DragStart(event);
    }
    //-------------------------------------------------
    DragEnd(event) {
        this.Owner.Owner.Owner.DragEnd(event);
    }
    //-------------------------------------------------
}
