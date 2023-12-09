class Page {
    constructor(owner, data, volgorde = null, pageperlijstID, isfavourite) {
        //console.log("P", data.id)
        this.Owner = owner;
        this.isfavourite = isfavourite ? true : false;

        this.id = data.id;
        this.pageperlijstID = pageperlijstID ? pageperlijstID : null;
        this.title = data.title;
        this.subtitle = data.subtitle;
        this.codetext = data.codetext;
        this.volgorde = volgorde;
        this.originalcodetext = data.codetext;

        this.HTMLnodes = null; //codetextanalyser sets this value
        this.UI = this.Create();
        //console.log(this.UI)
    }
    //-------------------------------------------------
    Create() {
        this.UI = document.createElement("DIV");
        this.UI.classList.add("item");

        this.UI.setAttribute("draggable", true);
        this.UI.ondragstart = (event) => {
            this.DragStart(event);
        };
        this.UI.ondragend = (event) => {
            this.DragEnd(event);
        };
        this.UI.ondragover = (event) => {
            this.DragOver(event);
        };
        this.UI.ondragleave = (event) => {
            this.DragLeave(event);
        };
        this.UI.ondrop = (event) => {
            this.Drop(event);
        };
        this.UI.onclick = (event) => {
            if (this.Owner instanceof Curriculum){
            this.Owner.LoadPage(this.id, true);
            }else{
                this.Owner.Owner.LoadPage(this.id, true);

            }
            this.ReflectFavourite();
        };
        this.UI.onmouseenter = (event) => {
            if (event) {
                new Tooltip(event, this.title, {
                    subtip: this.subtitle,
                    //subtip: "volgorde=" + this.volgorde,
                    //shortcut: this.author,
                });
                cancelEvent(event);
                this.Owner.sb.SetText(this.title + " · " + this.subtitle);
            }
            this.ShowFavIcon(event);
        };


        if (this.Owner instanceof Curriculum) {
            // this page is in the TABLE OF CONTENTS

            this.UI.onmouseleave = (event) => {
                this.HideFavIcon(event);
                this.Owner.sb.SetDefaultText(this.Owner.pages.length + " Pages");
            };
        } else {
            this.UI.onmouseleave = (event) => {
                this.Owner.sb?.SetDefaultText(this.Owner.items.length + " pages in this list");
            };
            this.UI.onmouseenter = (event) => {
                if (event) {
                    new Tooltip(event, this.title, {
                        shortcut: this.id,
                    });
                    cancelEvent(event);
                }
            };
        } 
         
        this.favToggle = document.createElement("DIV");
        this.favToggle.className = this.isfavourite ? "favourite-on" : "favourite-none";
        this.favToggle.onclick = (event) => {
            this.ToggleFav(event);
        };

        this.words = document.createTextNode(this.title);
        this.words.className = "text";

        this.hrefNode = document.createElement("DIV");
        this.hrefNode.className = "href";
        this.hrefNode.append(this.words);

        this.UI.append(this.favToggle);
        this.UI.append(this.hrefNode);

        this.UI.setAttribute("databaseid", this.id);
        this.AnalyseSourceText(this.codetext);

        return this.UI;
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
    ShowAndMatch(querystring) {
        if (this.useopacity) {
            this.UI.style.opacity = 1;
        } else {
            this.UI.style.display = "";
        }
        let reg = new RegExp("(" + querystring + ")", "gi");
        this.hrefNode.innerHTML = this.text.replace(reg, "<span class='highlight'>$1</span>");
    }
    //-------------------------------------------------
    AnalyseSourceText(text) {
        if (text != null) {
            let x = new CodetextAnalyser(this, text);
            // copy the properties from the analyser to this page
            this.HTMLnodes = x.pageHTMLparts || [];
            this.diagramsnode = x.tags["diagrams"] ? x.tags["diagrams"] : null;
        }
    }
    //-------------------------------------------------
    ShowFavIcon(event) {
        this.favToggle.className = this.isfavourite ? "favourite-on" : "favourite-off";
        this.hrefNode.style.width = this.isfavourite ? "calc(100% - 40px)" : "calc(100% - 40px)";
    }
    //-------------------------------------------------
    HideFavIcon(event) {
        this.favToggle.className = this.isfavourite ? "favourite-on" : "favourite-none";
        this.hrefNode.style.width = this.isfavourite ? "calc(100% - 40px)" : "calc(100% - 18px)";

        this.Owner.sb.ShowDefaultText();
    }
    //-------------------------------------------------
    ToggleFav(event) {
        event.preventDefault();
        cancelEvent(event);
        this.isfavourite = !this.isfavourite;
        this.ReflectFavourite();
        if (this.Owner.listmanager) {
        if (this.isfavourite) {
            let lijstid = this.Owner.listmanager.listdropdown.selectedValue;
            let position = 1000;
            this.Owner.listmanager.UpdatePaginaPerLijstTabel(lijstid, this.id, position, null, true);
        } else {
            this.Owner.listmanager.RemovePageFromList(event, this);
        }
        }
        this.favToggle.className = this.isfavourite ? "favourite-on" : "favourite-off";
    }
    //-------------------------------------------------
    ReflectFavourite() {
        this.favToggle.className = this.isfavourite ? "favourite-on" : "favourite-none";
        this.hrefNode.style.width = this.isfavourite ? "calc(100% - 40px)" : "calc(100% - 18px)";
    }
    //-------------------------------------------------
    Show(event) {
        this.UI.style.display = "";
        this.ShowFavIcon(event);
        this.ReflectFavourite();
    }
    //-------------------------------------------------
    Select(event) {
        this.Owner.SetSelectedSongEverywhere(this);
    }
    //-------------------------------------------------
    Mark(onoff) {
        onoff ? this.UI.classList.add("selected") : this.UI.classList.remove("selected");

        if (onoff) {
            this.UI.scrollIntoView({
                behavior: "auto",
                block: "center",
                inline: "center",
            });
        }
    }
    //-------------------------------------------------
    DragStart(event) {
        // set the .draggedlink to the dragged page
        if (this.Owner instanceof Curriculum) {
            this.Owner.draggedlink = this;
        } else if (this.Owner instanceof ListManager) {
            this.Owner.Owner.draggedlink = this;
        }
        this.Owner.DragStart(event);
    }
    //-------------------------------------------------
    DragOver(event) {
        if (this.Owner instanceof ListManager) {
            this.UI.classList.add("beingdraggedover");
            this.Owner.DragOver(event);
        }
    }
    //-------------------------------------------------
    DragLeave(event) {
        this.UI.classList.remove("beingdraggedover");
    }
    //-------------------------------------------------
    Drop(event) {
        //console.log("DROPPED ON", this.title, this.id);
        event.stopPropagation();

        this.UI.style.backgroundColor = "";
        this.UI.style.cursor = "";
        this.UI.classList.remove("beingdraggedover");

        if (this.Owner.draggedlink == this) {
            this.Owner.draggedlink = null;
            return;
        }

        var draggedlink;
        if (this.Owner instanceof Curriculum) {
            //console.log("DROP ON T.O.C. ????");
            draggedlink = this.Owner.draggedlink;
        } else if (this.Owner instanceof ListManager) {
            //console.log("DROP ON ITEMLIST OF LISTMANAGER");
            draggedlink = this.Owner.Owner.draggedlink;
            draggedlink.UI.style.display = "block";

            let draggedindex = this.Owner.DetermineIndex(draggedlink);
            let dropindex = this.Owner.DetermineIndex(this);

            if (draggedindex == -1) {
                console.log("DRAGGED FROM T.O.C. ONTO ITEM with index", dropindex);
                // the dragged page comes from the T.O.C.!
                // mark the draggedlink as favourite since it is now
                // added to the list
                let lijstid = this.Owner.Owner.listmanager.listdropdown.selectedValue;
                this.Owner.UpdatePaginaPerLijstTabel(lijstid, draggedlink.id, this.volgorde-1, null, true);
            } else {
                // the dragged page comes from the ListManager!
                console.log("DRAGGED FROM", draggedindex, "DROPPEDON", dropindex);
                // move the dragged link to the position before the dropindex
                this.Owner.items.splice(dropindex, 0, this.Owner.items.splice(draggedindex, 1)[0]);
                draggedlink.volgorde = dropindex;
                this.volgorde = draggedindex;
                this.Owner.items.forEach((item) => {
                    this.Owner.itemlist.append(item.GetInterface());
                });
                //save the new position (volgorde)
                //console.log(this.Owner.Owner.listmanager.listdropdown.selectedValue, this.id, dropindex);
                //alert("UPDATE POS "+this.Owner.Owner.listmanager.listdropdown.selectedValue)
                this.Owner.SaveReorderedList(this.Owner.Owner.listmanager.listdropdown.selectedValue);
                this.Owner.BouncePageLink(this.Owner.items[dropindex]);
                this.Owner.Owner.ShowSelectedSong();
                // if the itemlist in the listmanager ALSO processes the drop
                // the dropped item will be added TWICE. We don't want that, so:
                event.stopPropagation();
            }
        }
    }
    //-------------------------------------------------
    DragEnd(event) {
        this.Owner.DragEnd(event);
    }
    //-------------------------------------------------
}
