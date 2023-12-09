class ListManager {
    constructor(owner) {
        this.Owner = owner;
        this.items = [];

        this.UI = this.Create();
        this.LoadAllLists(this.listdropdown);

        this.UI.onmouseleave = (event) => {
            this.listdropdown.HideOptions(event);
        };

        addEventListener("listloaded", (event) => {
            this.Owner.AdjustEllipses();
            this.items.forEach((item) => {
                item.ReflectFavourite();
                // find the corresponding page in the T.O.C.
                this.Owner.MarkCorrespondingPageAsFavourite(item.id);
            });
            //this.Owner.UpdateFavButtonIcon();
            this.Owner.SetSelectedSongEverywhere(this.Owner.selectedpage);
        });
    }
    //-------------------------------------------------
    Create() {
        let content = document.createElement("DIV");
        content.classList.add("listmanager");
        this.toolbar = new ToolBar(this);

        this.addlistbutton = new Button(this, {
            //caption: "+",
            title: "Create A New List",
            classname: "add",
            func_click: (event) => {
                this.NewList(event);
            },
        });
        this.toolbar.panels[2].append(this.addlistbutton.UI);

        this.toolbar.panels[2].append(this.Owner.separator.cloneNode(true));
        // list MANAGER trigger
        this.listmanagertrigger = new Button(this, {
            classname: "listmanagerhide",
            title: "Hide Lists",
            func_click: (event) => {
                this.Hide(event);
            },
            shortcut: "Right Click, Backslash",
        });
        this.toolbar.panels[2].append(this.listmanagertrigger.GetInterface());

        this.itemlistcontainer = document.createElement("DIV");
        this.itemlistcontainer.className = "itemlistcontainer";

        this.itemlist = document.createElement("DIV");
        this.itemlist.classList.add("itemlist");
        //this.itemlist.classList.add("itemlist", "slide-in-top");

        this.itemlist.ondrop = (event) => {
            this.Drop(event);
        };
        this.itemlist.ondragover = (event) => {
            this.DragOver(event);
        };
        this.itemlist.ondragleave = (event) => {
            this.DragLeave(event);
        };

        this.itemlistcontainer.append(this.itemlist);

        content.append(this.itemlistcontainer);
        content.append(this.toolbar.UI);

        this.MakeListControl();

        this.sb = new StatusBar(this);
        content.append(this.sb.GetInterface());
        this.sb.GetInterface().onmouseover = null; // kill the default statusbar behaviour
        return content;
    }
    //-------------------------------------------------
    MakeListControl() {
        let defval = localStorage.getItem("identifier.list");
        this.listdropdown = new DropDown(this, {
            caption: "Lists",
            values: [],
            labels: [],
            defaultvalue: defval,
            //cssclass: "dropdowncontrol",
            tooltip: "Select A Quick List",
            //subtip: "SHIFT + CLICK To Save Current Favourites",
            callback: (event) => {
                //this.LoadList();
            },
        });
        this.toolbar.panels[0].insertBefore(this.listdropdown.GetInterface(), this.toolbar.panels[0].firstChild);
    }
    //-------------------------------------------------
    LoadList(pagesinlist, pageperlijstID) {
        pageperlijstID = parseInt(pageperlijstID);
        //console.log("LOADLIST", pagesinlist, pageperlijstID);
        this.ClearCurrentList();
        this.items = [];

        if (pageperlijstID) {
            this.listdropdown.Select(pageperlijstID);
            if (pagesinlist?.length > 0) {
                pagesinlist.forEach((page) => {
                    this.AddPage(page.pagina, page.volgorde, page.id);
                });
                window.dispatchEvent(new Event("listloaded"));
            }
        }
    }
    //-------------------------------------------------
    AddPage(pagedata, volgorde, pageperlijstID) {
        //console.log("LM::Add", this.itemlist, pagedata);
        if (pagedata != null) {
            let lnk = new Page(this, pagedata, volgorde, pageperlijstID, true);
            this.itemlist.append(lnk.GetInterface());

            lnk.ReflectFavourite();
            this.items.push(lnk);
            lnk.favToggle.onmouseenter = null;
            lnk.favToggle.onclick = (event) => {
                this.RemovePageFromList(event, lnk);
            };
            lnk.favToggle.onmouseenter = (event) => {
                this.sb.SetText("Remove " + lnk.title);
            };
            lnk.GetInterface().onmouseout = null;
            lnk.GetInterface().style.display = "block";

            lnk.GetInterface().scrollIntoView({
                behavior: "smooth",
                block: "center",
                inline: "nearest",
            });
        }
        this.Owner.UpdateFavButtonIcon();
        this.sb.SetText("(Shift +) Enter Navigates...");
    }
    //-------------------------------------------------
    LoadAllLists(dropdown) {
        let url = HOST + "allelijsten";
        console.log(url);
        fetch(url)
            .then((res) => res.json())
            .then((lijsten) => {
                if (lijsten.length > 0) {
                    lijsten.forEach((lijst) => {
                        //console.log("L", record);
                        dropdown.AddList(lijst);
                        return;
                    });
                } else {
                    // there are NO lists, creates one
                    alert("NO lists found.\nBlackboard creates one for you...");
                    this.CreateList("My List Of Pages");
                }
            });
    }
    //-------------------------------------------------
    async SaveReorderedList(paginaperlijstID) {
        console.log("SaveReorderedList", paginaperlijstID);
        // 1. delete eveything from the pagina_per_lijst-tabel
        // waar lijst_id = paginaperlijstID
        await fetch(HOST + "deletefrompagina_per_lijst/" + paginaperlijstID).then(
            this.AddPagesInOrder(paginaperlijstID)
        );
    }
    //-------------------------------------------------
    AddPagesInOrder(paginaperlijstID) {
        // 2. doorloop de items in de reordered list en voeg ze, op volgorde,
        // toe aan de pagina_per_lijst tabel
        for (let i = 0; i < this.items.length; i++) {
            //console.log(this.items[i]);
            console.log("Save " + this.items[i].title + ", set volgorde " + i);
            //update the pagina_per_lijst-tabel door alle rijen in die
            //tabel te updaten met de nieuwe volgorde
            console.log(
                "INSERT INTO pagina_per_lijst SET lijst_id=",
                this.listdropdown.selectedValue,
                " pagina_id=",
                this.items[i].id,
                "volgorde=",
                i
            );
            let refreshlist = i == this.items.length - 1; //refresh the list if it is the last item
            //console.log("lastitem?", refreshlist, i, this.items.length);
            this.UpdatePaginaPerLijstTabel(
                this.listdropdown.selectedValue,
                this.items[i].id,
                i + 1,
                paginaperlijstID,
                refreshlist
            );
        }
    }
    //-------------------------------------------------
    async UpdatePaginaPerLijstTabel(lijstid, pageid, volgorde, paginaperlijstID, refreshlist = false) {
        let endpoint = HOST + "updatepaginaperlijst";

        let ppl = {}; // new PaginaPerLijst object
        ppl.id = paginaperlijstID ? paginaperlijstID : null;
        ppl.volgorde = volgorde;
        ppl.pagina = {};
        ppl.pagina.id = pageid;
        ppl.lijst = {};
        ppl.lijst.id = lijstid;

        let ppl_json = JSON.stringify(ppl);

        let thepost = {
            method: "POST",
            headers: {
                Accept: "application/json;charset=utf-8",
                "Content-Type": "application/json",
                //"Cache-Control": "no-cache",
            },
            body: ppl_json,
        };
        //alert(ppl_json);
        const response = await fetch(endpoint, thepost);
        await response.json().then((data) => {
            if (refreshlist) {
                // refresh the list when the last item of the list has been updated
                this.Owner.selectedpage?.ReflectFavourite();
                this.GetPagesWithListId(this.listdropdown.selectedValue);
            }
        });
    }
    //-------------------------------------------------
    async NewList(event) {
        let numlists = this.listdropdown.options.length + 1;
        let listname = prompt("Enter A Name For Your New List", "List " + numlists);
        if (listname != null) {
            this.Owner.pages.forEach((item) => {
                item.isfavourite = false;
                item.ReflectFavourite();
            });
            while (this.itemlist.lastChild) {
                this.itemlist.removeChild(this.itemlist.lastChild);
            }
            this.items = [];
            this.Owner.FillSongList();

            this.listdropdown.selectedoption.innerHTML = listname;
            //todo : this.listdropdown.AddList(listname, ??????)

            this.CreateList(listname);
        }
    }
    //-------------------------------------------------
    async CreateList(title) {
        //alert('List ' + title + ' Created');
        let lijst = {};
        lijst.name = title;

        let lijstjson = JSON.stringify(lijst);

        // SAVE THE NEW LIST IN THE DATABASE (and automatically add current song to the new list)
        let thepost = {
            method: "POST",
            headers: {
                Accept: "application/json;charset=utf-8",
                "Content-Type": "application/json",
                //"Cache-Control": "no-cache",
            },
            body: lijstjson,
        };
        //console.log(thepost.body);
        //console.log("Adding New List " + listname);

        await fetch(HOST + "savelijst", thepost)
            .then((response) => response.json())
            .then((listdata) => {
                console.log("NEWLIST", listdata);
                localStorage.setItem("identifier.list", listdata.id);
                this.listdropdown.AddList(listdata);
                this.listdropdown.selectedValue = listdata.id;
                this.listdropdown.SelectOption(new Event("bogus"), listdata.id);
                this.listdropdown.HideOptions(new Event("bogus"));

                //fails when there are no pages in the database
                //this.UpdatePaginaPerLijstTabel(listdata.id, this.Owner.selectedpage?.id);
            });
    }
    //-------------------------------------------------
    GetInterface() {
        return this.UI;
    }
    //-------------------------------------------------
    async GetPagesWithListId(paginaperlijstID) {
        console.log(HOST + "getpaginasvanlijst/" + paginaperlijstID);
        await fetch(HOST + "getpaginasvanlijst/" + paginaperlijstID)
            .then((response) => response.json())
            .then((paginasivandezelijst) => {
                this.LoadList(paginasivandezelijst, paginaperlijstID);
                // store the current set identifier
                localStorage.setItem("identifier.list", paginaperlijstID);
            });
    }
    //-------------------------------------------------
    async RemovePageFromList(event, page) {
        event.stopPropagation(); // stop event propagation so it won't be handled by parentnode(s)!
        // remove this page from the this.items and
        // remove the node from the DOM
        for (let i = 0; i < this.items.length; i++) {
            if (page.id == this.items[i].id) {
                if (this.items[i].GetInterface().parentNode == this.itemlist) {
                    this.itemlist.removeChild(this.items[i].GetInterface());
                }
                this.items.splice(i, 1);
            }
        }
        // find the corresponding pagelink in the
        // curriculum.song(pages!) array and set its isfavourite to false
        for (let i = 0; i < this.Owner.pages.length; i++) {
            if (page.id == this.Owner.pages[i].id) {
                this.Owner.pages[i].isfavourite = false;
                this.Owner.pages[i].ReflectFavourite(); //in the TOC
                //
            }
        }
        this.Owner.selectedpage.isfavourite = false;
        this.Owner.toggleFavButton.SetChecked(this.Owner.selectedpage.isfavourite);
        let lijstid = this.listdropdown.selectedValue;

        let endpoint = HOST + "removepaginavanlijst/" + lijstid + "/" + page.id;
        const response = await fetch(endpoint);
        /* fawait response.json().then((data) => {
            //this.LoadList(data);
        }); */
    }
    //-------------------------------------------------
    Hide(event) {
        let listmanwidth = 0;
        this.UI.style.left = "calc(100vw - " + listmanwidth + "px)";
        this.Owner.TOCNode.style.width = "calc(100vw - " + listmanwidth + "px)";
        this.Owner.PAGENode.style.width = "calc(100vw - " + listmanwidth + "px)";
        this.isdisplayed = false;
        this.Owner.separator2.style.display = "block";
        this.Owner.listmanagertrigger.Show();
    }
    //-------------------------------------------------
    Show(event) {
        let listmanwidth = "324px";
        this.UI.style.left = "calc(100vw - " + listmanwidth + ")";
        this.Owner.TOCNode.style.width = "calc(100vw - " + listmanwidth + ")";
        this.Owner.PAGENode.style.width = "calc(100vw - " + listmanwidth + ")";
        this.UI.style.display = "flex";
        this.UI.style.flexDirection = "column";
        this.UI.style.width = listmanwidth;
        this.isdisplayed = true;
        this.Owner.separator2.style.display = "none";
        this.Owner.listmanagertrigger.Hide();
    }
    //-------------------------------------------------
    IsDisplayed() {
        return this.isdisplayed;
    }
    //-------------------------------------------------
    AllowDrop(event) {
        event.preventDefault();
    }
    //-------------------------------------------------
    DragLeave(event) {
        this.itemlist.style.backgroundColor = "";
    }
    //-------------------------------------------------
    DragOver(event) {
        event.preventDefault();
    }
    //-------------------------------------------------
    BouncePageLink(page) {
        if (page) {
            // briefly indicate the item that was dropped
            var cls = "bounce-top";
            page.GetInterface().classList.add(cls);
            setTimeout((event) => {
                page.GetInterface().classList.remove(cls);
            }, 2000);
        }
    }
    //-------------------------------------------------
    IsInList(id) {
        //console.log("isinlist", this.items.length, id);
        for (let i = 0; i < this.items.length; i++) {
            //console.log(i, this.items[i].id, id);
            if (this.items[i].id === id) {
                //console.log("Yes Is In List");
                return true;
            }
        }
        return false;
    }
    //-------------------------------------------------
    Drop(event) {
        //console.log("dropped on LIST AREA", this.Owner.draggedlink);
        let lijstid = this.listdropdown.selectedValue;
        let pageid = this.Owner.draggedlink.id;
        let position = 0;
        let refreshlist = true; //probably added at the end of the list
        this.UpdatePaginaPerLijstTabel(lijstid, pageid, position, this.Owner.draggedlink.pageperlijstID, refreshlist);
    }
    //-------------------------------------------------
    DetermineIndex(songlink) {
        // find the index of the item that was dropped on
        for (let i = 0; i < this.items.length; i++) {
            if (this.items[i] == songlink) {
                // console.log("determine index",i)
                return i;
            }
        }
        return -1;
    }
    //-------------------------------------------------
    ClearCurrentList() {
        this.Owner.ClearNode(this.itemlist);
        // console.clear();
        // console.log("Applying Favourites")
        this.Owner.pages.forEach((page) => {
            page.isfavourite = false;
            page.ReflectFavourite();
        });
    }
    //-------------------------------------------------
    SetSelectedSongEverywhere(pagelink) {
        this.Owner.SetSelectedSongEverywhere(pagelink);
        pagelink.GetInterface().scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "center",
        });
    }
    //-------------------------------------------------
    JumpToPrevFavouriteSong(currentsong) {
        //console.log("INPUT", currentsong.id)
        let index = -1;
        for (let i = 0; i < this.items.length; i++) {
            if (this.items[i].id == currentsong.id) {
                index = i - 1;
                if (index < 0) {
                    index = this.items.length - 1;
                }
                this.Owner.LoadPage(this.items[index].id);
                return; // found it!
            }
        }
        // go back from the currently .selectedpage and find the first
        // song before the currentsong in the .songs array that is marked favourite
        let currentindex = this.Owner.FindSongByTitle(this.Owner.selectedpage);
        for (let i = currentindex - 1; i > 0; i--) {
            if (this.Owner.pages[i].isfavourite) {
                this.Owner.LoadPage(this.Owner.pages[i].id);
                return; // found it!
            }
        }
        // if no previous favourite song has been found,
        // start searching from the end in the .songs array
        if (index == -1) {
            for (let i = this.Owner.pages.length - 1; i > currentindex; i--) {
                if (this.Owner.pages[i].isfavourite) {
                    this.Owner.LoadPage(this.Owner.pages[i].id);
                    return; // found it!
                }
            }
        }
        if (index == -1) {
            // console.log("currentsong not found in listmanager");
        }
    }
    //-------------------------------------------------
    JumpToNextFavouriteSong(currentsong) {
        let index = -1;
        for (let i = 0; i < this.items.length; i++) {
            if (this.items[i].id == currentsong.id) {
                index = i + 1;
                if (index >= this.items.length) {
                    index = 0;
                }
                this.Owner.LoadPage(this.items[index].id);
                return; // found it!
            }
        }
        // advance from the currently .selectedpage and find the first
        // song in the .songs array that is marked favourite
        let currentindex = this.Owner.FindSongByTitle(this.Owner.selectedpage);
        for (let i = currentindex + 1; i < this.Owner.pages.length; i++) {
            if (this.Owner.pages[i].isfavourite) {
                this.Owner.LoadPage(this.Owner.pages[i].id);
                return; // found it!
            }
        }
        // if no next favourite song has been found,
        // start searching from the beginning in the .songs array
        if (index == -1) {
            for (let i = 0; i < currentindex; i++) {
                if (this.Owner.pages[i].isfavourite) {
                    this.Owner.LoadPage(this.Owner.pages[i].id);
                    return; // found it!
                }
            }
        }
        if (index == -1) {
            // console.log("currentsong not found in listmanager");
        }
    }
    //-------------------------------------------------
    DragStart(event) {
        this.Owner.DragStart(event);
    }
    //-------------------------------------------------
    DragEnd(event) {
        this.Owner.DragEnd(event);
    }
    //-------------------------------------------------
}
