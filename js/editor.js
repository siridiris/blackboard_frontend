class Editor {
    constructor(owner, trigger) {
        this.Owner = owner;
        this.trigger = trigger;
        this.caption = "Editor";
        this.page = null;
        this.edited = false;
        this.UI = this.Create();
    }
    //-------------------------------------------------
    GetInterface() {
        return this.UI;
    }
    //-------------------------------------------------
    Create() {
        let ui = document.createElement("DIV");
        ui.onmousedown = (event) => {
            this.SetTopZIndex(event);
        };

        ui.classList.add("dialogwindow");

        // retrieve coodinates, if they are stored
        ui.style.left = localStorage.getItem(this.ID + ".x") + "px" || "100px";
        ui.style.top = localStorage.getItem(this.ID + ".y") + "px" || "100px";

        this.titlebar = document.createElement("DIV");
        this.titlebar.className = "titlebar"; // css
        this.titlebar.append(document.createTextNode(this.caption));
        this.titlebar.onmousedown = (event) => {
            this.DragStart(event);
        };

        this.closecross = document.createElement("DIV");
        this.closecross.className = "closecross";

        this.closecross.onclick = (event) => {
            if (this.edited) {
                if (confirm("Discard Your Edits?")) {
                    this.ReadPageFromDatabase(event);
                    this.Hide(event);
                    this.UpdateEditedState(false);
                }
            } else {
                this.Hide(event);
            }
        };
        this.closecross.append(document.createTextNode(""));

        this.titlebar.append(this.closecross);
        ui.append(this.titlebar);

        let node = document.createElement("DIV");
        node.classList.add("editor");

        this.idlabel = document.createElement("SPAN");
        this.idlabel.classList.add("idlabel");
        this.idlabel.setAttribute("readonly", true);

        node.append(this.idlabel);

        this.idbox = document.createElement("INPUT");
        this.idbox.setAttribute("readonly", true);

        this.subtitlebox = document.createElement("INPUT");
        this.subtitlebox.placeholder = "Subtitle";
        this.subtitlebox.onbeforeinput = (event) => {
            this.ProcessKey(event);
        };
        this.subtitlebox.onkeyup = (event) => {
            this.FormatPage(event);
        };
        this.subtitlebox.onmouseover = (event) => {
            new Tooltip(event, event.target.placeholder);
        };

        //this.authorbox = document.createElement("INPUT");
        //this.authorbox.placeholder = "Author";
        //this.authorbox.onbeforeinput = (event) => {
        //    this.ProcessKey(event);
        //};
        //this.authorbox.onkeyup = (event) => {
        //    this.FormatPage(event);
        //};
        //this.authorbox.onmouseover = (event) => {
        //    new Tooltip(event, event.target.placeholder);
        //};

        this.titlebox = document.createElement("INPUT");
        this.titlebox.placeholder = "Title";
        this.titlebox.onbeforeinput = (event) => {
            this.ProcessKey(event);
        };
        this.titlebox.onkeyup = (event) => {
            this.FormatPage(event);
        };
        this.titlebox.onmouseover = (event) => {
            new Tooltip(event, event.target.placeholder);
        };

        this.textbox = document.createElement("textarea");
        this.textbox.setAttribute("autofocus", true);
        this.textbox.setAttribute("contentEditable", true);
        this.textbox.placeholder = "Page Content";
        this.textbox.onbeforeinput = (event) => {
            this.ProcessKey(event);
        };
        this.textbox.onkeyup = (event) => {
            this.FormatPage(event);
        };

        node.newpagebutton = new Button(this, {
            //caption: "New...",
            classname: "add",
            title: "Create A New Page",
            //subtip: "",
            func_click: (event) => {
                this.NewPage(event);
            },
        });

        this.revertcancelbutton = new Button(this, {
            //caption: "Cancel",
            classname: "revert",
            //title: "Revert / Cancel",
            func_click: (event) => {
                this.ReadPageFromDatabase(event);
            },
        });

        this.saveclosebutton = new Button(this, {
            //caption: "Save",
            //title: "Save",
            classname: "close",
            func_click: (event) => {
                this.DoPostPage(event);
            },
        });

        node.append(this.idbox);
        node.append(this.titlebox);
        node.append(this.subtitlebox);
        //node.append(this.authorbox);
        node.append(this.textbox);

        let tb = new ToolBar(this);
        //tb.panels[0].append(node.tablinebutton.UI);
        tb.panels[0].append(node.newpagebutton.UI);
        tb.panels[2].append(this.revertcancelbutton.UI);
        tb.panels[2].append(this.saveclosebutton.UI);
        node.append(tb.UI);
        ui.append(node);

        return ui;
    }
    //-------------------------------------------------
    SetTopZIndex() {
        let topZ = findHighestZ(); // external function call
        this.UI.style.zIndex == topZ ? topZ : topZ + 1;
    }
    //-------------------------------------------------
    FlashButtons(event) {
        //
        new TemporaryMessage("You Need To Save Or Discard Your Changes First!", {
            fcolor: "var(--color_error)",
            bcolor: "white",
        });
        let effectcss = "ping";
        this.revertcancelbutton.GetInterface().classList.add(effectcss);
        this.saveclosebutton.GetInterface().classList.add(effectcss);

        setTimeout((event) => {
            this.revertcancelbutton.GetInterface().classList.remove(effectcss);
            this.saveclosebutton.GetInterface().classList.remove(effectcss);
        }, 500);
    }
    //-------------------------------------------------
    IsContentEdited() {
        return this.edited;
    }
    //-------------------------------------------------
    LoadPage(page) {
        if (page == null) {
            console.error("Editor", "No Such Page ...");
            return;
        }
        //console.log("EDITOR : LOAD PAGE ", page.id);
        this.page = page;
        this.PutDataInBoxes();

        this.textbox.scrollTop = 0;
        this.textbox.setSelectionRange(0, 0);
        this.UpdateEditedState(false);
    }
    //-------------------------------------------------
    insertAtCursor(event, myField, myValue) {
        if (document.selection) {
            myField.focus();
            sel = document.selection.createRange();
            sel.text = myValue;
            //IE support
        } else if (myField.selectionStart || myField.selectionStart == "0") {
            //MOZILLA and others
            let startPos = myField.selectionStart;
            let endPos = myField.selectionEnd;
            myField.value =
                myField.value.substring(0, startPos) + myValue + myField.value.substring(endPos, myField.value.length);
            myField.selectionEnd = startPos + myValue.length;
        } else {
            myField.value += myValue;
        }
        myField.focus();
        this.FormatPage(event);
    }
    //-------------------------------------------------
    NewPage(event) {
        this.idbox.value = 0;
        this.titlebox.value = "";
        this.subtitlebox.value = "";
        this.textbox.value = "NOTES\n";
        //create a new song object client side
        let newpage = {};
        newpage.id = this.idbox.value;
        newpage.title = this.titlebox.value;
        newpage.subtitle = this.subtitlebox.value;
        newpage.codetext = this.textbox.value;
        this.page = newpage;
        this.edited = false;
        this.UpdateCaption(this.idbox.value);
    }
    //-------------------------------------------------
    DoPostPage(event) {
        if (this.edited) {
            // save or update the page
            this.PostPage(event);
        } else {
            // just close the editor
            this.Owner.HideEditor(event);
        }
    }
    //-------------------------------------------------
    async PostPage(event) {
        this.page.id = this.idbox.value;
        this.page.subtitle = this.subtitlebox.value;
        this.page.title = this.titlebox.value;
        //this.page.author = this.authorbox.value;

        this.page.codetext = this.textbox.value;

        let PAGEDATA = {}; //WAAROM FAALT E.E.A. ALS IK GEEN NIEUW OBJECT AANMAAK, MAAR this.page GEBRUIK???
        PAGEDATA.id = this.page.id;
        PAGEDATA.title = this.page.title;
        PAGEDATA.subtitle = this.page.subtitle;
        PAGEDATA.codetext = this.page.codetext;

        let PAGEDATA_JSON = JSON.stringify(PAGEDATA);

        let thepost = {
            method: "POST",
            headers: {
                Accept: "application/json;charset=utf-8",
                "Content-Type": "application/json",
                //"Cache-Control": "no-cache",
            },
            body: PAGEDATA_JSON,
        };

        // SAVE PAGE
        if (this.page.id == 0) {
            await fetch(HOST + "updatepagina", thepost)
                .then((response) => response.json())
                .then((data) => {
                    new TemporaryMessage("Saved New Page " + this.page.id, {
                        fcolor: "black",
                        bcolor: "white",
                    });
                    let lijstid = this.Owner.listmanager.listdropdown.GetSelectedValue();
                    //alert(lijstid)
                    // add this new page to the current list
                    this.Owner.listmanager.UpdatePaginaPerLijstTabel(lijstid, data.id, 0, 0, true);
                    this.Hide(event);
                    let np = new Page(this, data, 0, lijstid, true);
                    /* np.GetInterface().onclick=(event)=>{
                        //alert("SPECIALCLICK")
                        this.Owner.LoadPage(np.id);
                    } */
                    this.Owner.InsertIntoSongList(
                        // insert a another instance of this new page into the Table Of Contents (TOC)
                        np
                    );
                    this.ReadPageFromDatabase(event);
                });
        } else {
            // UPDATE EXISTING PAGE
            await fetch(HOST + "updatepagina", thepost)
                .then((response) => response.json())
                .then((data) => {
                    this.Owner.UpdateCurrentSong(data);
                    new TemporaryMessage("Updated Page " + this.page.id, {
                        fcolor: "green",
                        bcolor: "silver",
                        align: "left",
                    });
                    this.ReadPageFromDatabase(event);
                });
        }
        this.UpdateEditedState(false);
    }
    //-------------------------------------------------
    async ReadPageFromDatabase(event) {
        const response = await fetch(HOST + "getpagina/" + this.page.id);
        await response.json().then((data) => {
            // console.log("REVERT SONG", songdata.id);
            for (let p in data) {
                //console.log(p, this.page[p], data[p]);
                this.page[p] = data[p];
            }
            /*
                this.page.id = data.id;
                this.page.title = data.title;
                this.page.subtitle = data.subtitle;
                this.page.codetext = data.codetext;
                */

            this.PutDataInBoxes();
            this.FormatPage(new Event("bogus"));
        });

        this.UpdateEditedState(false);
    }
    //-------------------------------------------------
    IsDisplayed() {
        return this.GetInterface().style.display == "flex";
    }
    //-------------------------------------------------
    UpdateCaption(text) {
        //console.log("UPDATECAPTION", text)
        this.titlebar.childNodes[0].nodeValue = this.caption + " · " + text;
    }
    //-------------------------------------------------
    PutDataInBoxes() {
        this.UpdateCaption(this.page.id);
        this.idlabel.innerHTML = this.page.id;
        this.idbox.value = this.page.id;
        this.titlebox.value = this.page.title;
        this.subtitlebox.value = this.page.subtitle;
        //this.authorbox.value = this.page.author;
        this.textbox.value = this.page.codetext;
    }
    //-------------------------------------------------
    UpdateEditedState(edited) {
        this.edited = edited;

        let cancelbutton = this.revertcancelbutton.GetInterface();
        let savebutton = this.saveclosebutton.GetInterface();
        cancelbutton.style.display = this.edited ? "flex" : "none";
        if (this.page.id == 0) {
            // newly created song
            cancelbutton.onmouseenter = (event) => {
                new Tooltip(event, "Cancel");
            };
        } else {
            cancelbutton.style.backgroundColor = this.edited ? "color-mix(in oklab, var(--color_error), white 5%)" : "";
            cancelbutton.style.color = this.edited ? "white" : "";
            cancelbutton.onmouseenter = (event) => {
                new Tooltip(event, "Revert");
            };
        }

        savebutton.style.backgroundColor = this.edited ? "color-mix(in oklab, var(--color_error), white 5%)" : "";
        savebutton.style.filter = this.edited ? "hue-rotate(120deg)" : "";
        savebutton.style.color = this.edited ? "white" : "";
        savebutton.classList.replace("close", "save_to_database");
        //savebutton.innerHTML = this.edited ? "Save" : "Close";
        this.edited
            ? savebutton.classList.replace("close", "save_to_database")
            : savebutton.classList.replace("save_to_database", "close");

        this.edited
            ? (savebutton.onmouseenter = (event) => {
                  new Tooltip(event, "Save");
              })
            : (savebutton.onmouseenter = (event) => {
                  new Tooltip(event, "Close");
              });

        this.edited ? this.trigger.Disable() : this.trigger.Enable();
        this.edited ? this.Owner.listtrigger_down.Disable() : this.Owner.listtrigger_down.Enable();

        this.edited
            ? savebutton.parentNode.classList.add("attention")
            : savebutton.parentNode.classList.remove("attention");

        this.closecross.style.backgroundColor = this.edited ? "var(--color_error)" : "";
    }
    //-------------------------------------------------
    IgnoreKey(key) {
        return (
            key === "Shift" ||
            key === "CapsLock" ||
            key === "Meta" ||
            key === "Control" ||
            key === "UpArrow" ||
            key === "DownArrow" ||
            key === "LeftArrow" ||
            key === "RightArrow" ||
            key === "Alt"
        );
    }
    //-------------------------------------------------
    ProcessKey(event) {
        let key = event.key;
        if (
            key === "ArrowUp" ||
            key === "ArrowDown" ||
            key === "ArrowLeft" ||
            key === "ArrowRight" ||
            this.IgnoreKey(event.key)
        ) {
            event.stopPropagation();
            event.stopImmediatePropagation();
            //console.log("ignore");
            return false;
        }
        this.UpdateEditedState(true);
    }
    //-------------------------------------------------
    FormatPage(event) {
        if (event && this.IgnoreKey(event.key)) {
            event.preventDefault();
            return false;
        }
        let edited = this.IsContentEdited();
        // console.log("edited", edited);
        if (edited) {
            this.page.title = this.titlebox.value;
            this.page.subtitle = this.subtitlebox.value;
            this.page.codetext = this.textbox.value;
            this.Owner.DisplaySelectedSong();
            // autosave ???? --> this.PostPage(event);
        }
        this.UpdateEditedState(edited);
    }
    //-------------------------------------------------
    DragStart(e) {
        e.preventDefault();
        // get the mouse cursor position at startup:
        this.pos3 = e.clientX;
        this.pos4 = e.clientY;
        e.target.onmouseup = (event) => {
            this.DragStop(event);
        };
        this.titlebar.style.cursor = "grabbing";

        this.SetTopZIndex();

        this.previouseDocumentOnMouseMoveHandler = document.onmousemove;
        // call a function whenever the cursor moves on the DOCUMENT!
        document.onmousemove = (event) => {
            this.Drag(event);
        };
    }
    //-------------------------------------------------
    Drag(e) {
        e.preventDefault();
        // calculate the new cursor position:
        this.pos1 = this.pos3 - e.clientX;
        this.pos2 = this.pos4 - e.clientY;
        this.pos3 = e.clientX;
        this.pos4 = e.clientY;

        let x = this.UI.offsetLeft - this.pos1;
        let y = this.UI.offsetTop - this.pos2;
        this.UI.style.left = x + "px";
        this.UI.style.top = y + "px";
    }
    //-------------------------------------------------
    DragStop(e) {
        // stop moving when mouse button is released
        e.target.onmouseup = null;
        document.onmousemove = this.previousDocumentOnMouseMoveHandler;
        //document.onmouseup = this.previousDocumentOnMouseUpHandler;
        this.titlebar.style.cursor = "grab";

        let x = this.UI.offsetLeft;
        let y = this.UI.offsetTop;

        // store the coordinates
        localStorage.setItem(this.ID + ".x", x);
        localStorage.setItem(this.ID + ".y", y);
    }
    //-------------------------------------------------
    Hide(event) {
        this.GetInterface().style.display = "none";
        this.trigger.SetChecked(0);
        //localStorage.setItem(this.title + "_visible", 0);
    }
    //-------------------------------------------------
    Show(event) {
        this.GetInterface().style.display = "flex";
        this.trigger.SetChecked(1);
        //localStorage.setItem(this.title + "_visible", 1);
    }
    //-------------------------------------------------
}
