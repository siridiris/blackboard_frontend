class Curriculum {
    constructor(owner, data) {
        this.Owner = owner;
        this.selectedfontsize = parseInt(localStorage.getItem("fontsize")) || 14;

        this.selectedpage = null;

        this.SetFontSize(this.selectedfontsize);
        this.CreateUI();
        this.CreateEditor(this.editpagebutton);
        this.InitEventListeners();

        // get the last selected id from the localStorage
        let lastid = parseInt(localStorage.getItem("identifier.page"));
        this.pages = this.CreatePagesFromDatabase(data, lastid);
        this.ShowPages();

        if (lastid && this.selectedpage) {
            this.selectedpage.horSnapCoords = [];
            this.LoadPage(this.selectedpage.id);
        } else {
            this.ShowList(new Event("resize"));
            this.SelectRandomPage();
        }
        this.RestoreInterface();
        this.About();
    }
    //-------------------------------------------------
    About() {
        let copyright = "BLACK BOARD © Ivo Diris";
        new TemporaryMessage(copyright, {
            fcolor: "white",
            bcolor: "black",
        });
    }
    //-------------------------------------------------
    CreatePagesFromDatabase(data, lastid) {
        let arr = [];
        data.forEach((item) => {
            let s = new Page(this, item, 0, null); //pages loaded from database have NO order (volgorde)
            if (item.id == lastid) {
                this.selectedpage = s;
            }
            arr.push(s);
        });
        return arr;
    }
    //-------------------------------------------------
    RestoreInterface(event) {
        // restore the interface from last time
        localStorage.getItem("show.listmanager") == 1 ? this.listmanager.Show(event) : this.listmanager.Hide(event);
        localStorage.getItem("show.toc") == 1 ? this.ShowList(event) : this.HideList(event);
        this.UI.classList.add("fade-in-slow");
    }
    //-------------------------------------------------
    async LoadPage(id, hidelist = false) {
        if (this.editor.IsContentEdited()) {
            this.editor.FlashButtons();
            return;
        } else if (id) {
            // console.log("CURRICULUM : Load Page ", id);
            const response = await fetch(HOST + "getpagina/" + id);
            await response.json().then((data) => {
                this.selectedpage = new Page(this, data);
                this.selectedpage.Select(new Event("bogus"));
                localStorage.setItem("identifier.page", this.selectedpage.id);

                this.editpagebutton.Enable();
                this.editor.LoadPage(this.selectedpage);

                if (hidelist) {
                    this.HideList(new Event("bogus"));
                }
                // if this page's id is mentioned in the listmanager's active list
                // it needs to be marked favourite
                if (this.listmanager.IsInList(this.selectedpage.id)) {
                    this.selectedpage.isfavourite = true;
                    this.selectedpage.ReflectFavourite();
                }
                this.UpdateFavButtonIcon();
            });
        }
    }
    //-------------------------------------------------
    ChangeFontSize(d) {
        this.selectedfontsize = Math.max(12, Math.min(20, this.selectedfontsize + d));
        this.SetFontSize(this.selectedfontsize);
        this.fontsizecontrol.SetRadioButton(this.selectedfontsize);
    }
    //-------------------------------------------------
    GetInterface() {
        return this.UI;
    }
    //-------------------------------------------------
    CreateUI() {
        this.separator = document.createElement("DIV");
        this.separator.classList.add("separator");

        this.UI = document.createElement("DIV");
        this.UI.id = "blackboard";

        this.pagelisting = document.createElement("DIV");
        this.pagelisting.classList.add("itemlist");

        this.itemlistcontainer = document.createElement("DIV");
        this.itemlistcontainer.classList.add("itemlistcontainer");
        this.itemlistcontainer.append(this.pagelisting);

        this.sb = new StatusBar(this);

        this.TOCNode = document.createElement("DIV");
        this.TOCNode.id = "TOC";
        this.TOCNode.classList.add("unselectable");
        this.TOCNode.append(this.itemlistcontainer);
        this.TOCNode.append(this.sb.UI);

        this.toolbarTOC = new ToolBar(this);

        this.title = document.createElement("DIV");
        this.title.append(document.createTextNode("..."));
        this.title.classList.add("title");

        this.toolbarTOC.panels[0].append(this.title);


        this.displaywhat = new RadioControl(this, {
            //caption: "by",
            values: [0, 1],
            labels: ["Titles", "SUBTITLES"],
            defaultvalue: 0,
            tooltip: "Display By",
            cssclass: "searchby",
            subtip: "Display Titles Or SUBTITLES",
            callback: () => this.DisplayWhat(this.displaywhat.selectedValue),
        });
        this.toolbarTOC.panels[2].append(this.displaywhat.UI);

        this.searchcontrol = new SearchControl(this);
        this.toolbarTOC.panels[2].append(this.searchcontrol.GetInterface());

        this.toolbarTOC.panels[2].append(this.separator.cloneNode(true));

        this.addpagebutton = new Button(this, {
            title: "New Page",
            classname: "add",
            func_click: (event) => {
                this.CreateNewPage(event);
            },
        });
        this.toolbarTOC.panels[2].append(this.addpagebutton.GetInterface());

        //this.toolbarTOC.panels[2].append(this.separator.cloneNode(true));

        this.listtrigger_up = new Button(this, {
            classname: "triggerup",
            //checked : 1,
            title: "Exit Library Of Lessons ...",
            subtip: "... Back To The Current Lesson",
            shortcut: "Tab",
            func_click: (event) => {
                this.HideList(event);
            },
        });
        this.toolbarTOC.panels[2].append(this.listtrigger_up.UI);

        this.toolbarTOC.panels[2].append(this.separator);

        let backgroundtoolbar = document.createElement("DIV");
        backgroundtoolbar.style.backgroundColor = "var(--color_body_back)";
        backgroundtoolbar.append(this.toolbarTOC.UI);
        this.TOCNode.append(backgroundtoolbar);

        //---------
        this.PAGENode = document.createElement("DIV");
        this.PAGENode.id = "PAGE";

        this.UI.append(this.PAGENode);
        this.UI.append(this.TOCNode);

        // Page TOOLBAR
        this.toolbarPage = new ToolBar(this);
        this.UI.append(this.toolbarPage.UI);

        this.pageinfo = document.createElement("DIV");
        this.pageinfo.classList.add("info");

        this.toggleFavButton = new Button(this, {
            classname: "togglefavstate",
            checked: "1",
        });
        this.toggleFavButton.UI.onclick = (event) => {
            this.ToggleFavState(event);
        };
        this.toolbarPage.panels[0].append(this.toggleFavButton.UI);
        this.toolbarPage.panels[0].append(this.pageinfo);

        // middle panel (nothing)
        this.toolbarPage.panels[2].append(this.separator.cloneNode(true));

        // font sizes
        this.fontsizecontrol = new RadioControl(this, {
            //caption: "Font Size",
            cssclass: "fontsizecontrol",
            values: [12, 14, 16, 18, 20],
            labels: ["S", "M", "N", "L", "X"],
            defaultvalue: this.selectedfontsize,
            tooltip: "Font Size",
            subtip: "Select Font size",
            shortcut: "[ & ]",
            callback: () => this.SetFontSize(this.fontsizecontrol.selectedValue),
        });
        this.toolbarPage.panels[2].append(this.fontsizecontrol.UI);
        this.toolbarPage.panels[2].append(this.separator.cloneNode(true));

        this.editpagebutton = new Button(this, {
            id: "editdialogtrigger",
            //title: "Edit",
            classname: "edit",
            checked: 0,
            func_click: (event) => {
                this.ToggleEditor(event);
            },
        });
        this.editpagebutton.GetInterface().onmouseenter = (event) => {
            new Tooltip(event, "Edit");
        };

        this.toolbarPage.panels[2].append(this.editpagebutton.GetInterface());
        this.toolbarPage.panels[2].append(this.separator.cloneNode(true));

        // list trigger
        this.listtrigger_down = new Button(this, {
            classname: "triggerdown",
            title: "Library Of Lessons",
            //subtip: "... And Close Current Song",
            func_click: (event) => {
                this.ShowList(event);
            },
            shortcut: "Tab",
        });
        this.toolbarPage.panels[2].append(this.listtrigger_down.UI);

        this.separator2 = document.createElement("DIV");
        this.separator2.classList.add("separator");
        this.toolbarPage.panels[2].append(this.separator2);

        // list MANAGER trigger
        this.listmanagertrigger = new Button(this, {
            classname: "listmanagershow",
            title: "Show Lists",
            //checked: 1,
            //subtip: "... And Show Library Of Lessons",
            func_click: (event) => {
                this.ToggleListmanager(event);
            },
            shortcut: 'Right Click, "\\"',
        });
        this.toolbarPage.panels[2].append(this.listmanagertrigger.UI);

        this.separator3 = document.createElement("DIV");
        this.separator3.classList.add("separator");
        this.toolbarPage.panels[2].append(this.separator3);

        this.SetTitle("Black Board");

        this.PAGENode.append(this.toolbarPage.UI);

        this.songNode = document.createElement("DIV");
        this.songNode.className = "song flex";

        this.PAGENode.append(this.songNode);
        this.UI.append(this.PAGENode);

        this.listmanager = new ListManager(this, this.pages);
        this.UI.append(this.listmanager.GetInterface());
        this.listmanager.Show(new Event("bogus"));

        this.UI.oncontextmenu = (event) => {
            this.ToggleListmanager(event);
            return false;
        };

        this.bin = new Bin(this);
        this.UI.appendChild(this.bin.GetInterface());
        return this.UI;
    }
    //-------------------------------------------------
    EmptyPageList() {
        while (this.pagelisting.childNodes.length > 0) {
            this.pagelisting.removeChild(this.pagelisting.childNodes[0]);
        }
    }
    //-------------------------------------------------
    SetTitle(text) {
        this.ClearNode(this.title);
        this.title.append(document.createTextNode(text));
    }
    //-------------------------------------------------
    FillSongList() {
        this.ShowPages();
        if (this.displaywhat.selectedValue == 0) {
            this.DisplaySongsByAlphabet();
        } else if (this.displaywhat.selectedValue == 1) {
            this.DisplayBySubtitles();
        }
        if (this.searchcontrol.GetInterface().field.value.length > 0) {
            this.ProcessQuery(this.searchcontrol.GetInterface().field.value, this.displaywhat.GetSelectedValue());
        }
    }
    //-------------------------------------------------
    ShowPages() {
        this.pages.forEach((song) => {
            song.GetInterface().style.display = "flex";
        });
    }
    //-------------------------------------------------
    CancelArtist(event, subtitle) {
        this.FilterOnSubtitle(null);
    }
    //-------------------------------------------------
    FilterOnSubtitle(event, subtitle) {
        console.log(subtitle);
        let pages = this.pages.sort((a, b) => (a.subtitle > b.subtitle ? 1 : -1));
        this.ClearNode(this.pagelisting);

        let currentsubtitle,
            lastsubtitle = "";
        let focusnode;
        pages.forEach((page) => {
            currentsubtitle = page.subtitle;
            if (lastsubtitle != currentsubtitle) {
                lastsubtitle = currentsubtitle;
                let art = document.createElement("DIV");
                art.classList.add("subtitle", "item");
                art.append(document.createTextNode(page.subtitle));
                art.onclick = (event) => {
                    this.FilterOnSubtitle(event, page.subtitle);
                };
                if (currentsubtitle == subtitle) {
                    art.onclick = null;
                    art.style.cursor = "default";
                    let cross = document.createElement("DIV");
                    cross.classList.add("closecross");
                    cross.onclick = (event) => {
                        this.CancelArtist(event, page.subtitle);
                    };
                    cross.onmouseenter = (event) => {
                        new Tooltip(event, "Hide " + subtitle + " pages");
                    };
                    art.append(cross);
                    art.style.fontWeight = "bold";
                    art.style.opacity = 1;
                    focusnode = art;
                } else {
                    art.style.opacity = subtitle ? 0.33 : 1;
                }
                this.pagelisting.append(art);
            }
            if (page.subtitle == subtitle) {
                this.pagelisting.append(page.GetInterface());
            }
        });
        this.ScrollNodeIntoView(event, focusnode);
    }
    //-------------------------------------------------
    DisplayBySubtitles() {
        this.ClearNode(this.pagelisting);
        // clear the search field
        this.searchcontrol.Hide();
        this.searchcontrol.Clear();

        let pages = this.pages.sort((a, b) => (a.subtitle > b.subtitle ? 1 : -1));
        let currentsubtitle,
            previoussubtitle = "";
        pages.forEach((page) => {
            currentsubtitle = page.subtitle;
            if (previoussubtitle != currentsubtitle) {
                previoussubtitle = currentsubtitle;
                let art = document.createElement("DIV");
                art.classList.add("artist", "item");
                art.append(document.createTextNode(previoussubtitle));
                art.onclick = (event) => {
                    this.FilterOnSubtitle(event, page.subtitle);
                };
                //art.setAttribute("artist", currentsubtitle);
                this.pagelisting.append(art);
            }
        });
    }
    //-------------------------------------------------
    DisplaySongsByAlphabet() {
        this.searchcontrol.Show();
        this.ClearNode(this.pagelisting);
        let songs = this.pages.sort((a, b) => (a.title > b.title ? 1 : -1));
        songs.forEach((song) => {
            this.pagelisting.append(song.GetInterface());
        });
        this.ProcessQuery(this.searchcontrol.GetInterface().field.value);
    }
    //-------------------------------------------------
    DisplayWhat(value) {
        switch (value) {
            case 0: // search by song title
                this.searchcontrol.GetInterface().field.value = this.lastsearchstring;
                this.DisplaySongsByAlphabet();
                this.ProcessQuery(this.searchcontrol.GetInterface().field.value);
                break;
            case 1: // on subtitle
                this.lastsearchstring = this.searchcontrol.GetInterface().field.value;
                this.DisplayBySubtitles();
                //this.ProcessQuery(this.searchcontrol.GetInterface().field.value);
                //this.FilterOnSubtitle(this, this.selectedpage.subtitle);
                break;
        }
    }
    //-------------------------------------------------
    FilterNoLinkSongs() {
        this.pages.forEach((song) => {
            song.link == "0" ? song.Show() : song.Hide();
        });
    }
    //-------------------------------------------------
    ProcessQuery(string) {
        switch (string) {
            default:
                let count = 0;
                //  let value = this.displaywhat.GetSelectedValue();
                // process the song titles for the query string
                if (string != null) {
                    string = string.trim();
                    for (let i = 0; i < this.pages.length; i++) {
                        this.pages[i].hrefNode.innerHTML = this.pages[i].title;
                        // match song titles
                        if (this.pages[i].title) {
                            let match = this.pages[i].title.toLowerCase().match(string.toLowerCase());
                            this.pages[i].GetInterface().style.display = match ? "" : "none";
                            count = match ? count : count++;
                            if (match) {
                                this.ShowAndMatch(this.pages[i], string.toLocaleLowerCase());
                                count++;
                            }
                        }
                    }
                }
                this.UpdateStatusbarText(string, count);
                break;
        }
    }
    //-------------------------------------------------
    UpdateStatusbarText(string, count) {
        let tip = "";
        let k = "";
        if (this.selectedpage) {
            k =
                this.selectedpage && this.selectedpage.isfavourite == true
                    ? ""
                    : ' + 1 ("' + this.selectedpage.title + '")';
        }
        let matchingstring_tippart = string.length > 0 ? 'match "' + string + '"' : "";
        tip = count + " songs " + matchingstring_tippart;
        this.sb.SetDefaultText(tip);
    }
    //-------------------------------------------------
    ShowAndMatch(pageDOM, querystring) {
        if (querystring.length > 0) {
            let reg = new RegExp("(" + querystring + ")", "gi");
            if (pageDOM.title.match(reg)) {
                pageDOM.hrefNode.innerHTML = pageDOM.title.replace(reg, "<span class='highlight'>$1</span>");
            }
        } else {
            pageDOM.hrefNode.innerHTML = pageDOM.title;
        }
    }
    //-------------------------------------------------
    GetColumnCount() {
        let compStyles = window.getComputedStyle(this.pagelisting);
        let cmp = compStyles.getPropertyValue("column-count");
        return parseInt(cmp);
    }
    //-------------------------------------------------
    CapitaliseWords(str) {
        let splitStr = str.toLowerCase().split(/(\S|\.)/g);
        for (let i = 0; i < splitStr.length; i++) {
            splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
        }
        return splitStr.join(" ");
    }
    //-------------------------------------------------
    DemarkAllSongs() {
        this.pages.forEach((item) => {
            if (item.id == this.id) {
                item.UI.style.backgroundColor = "";
                item.UI.style.color = "";
            }
        });
    }
    //-------------------------------------------------
    SetFontSize(value) {
        this.selectedfontsize = value;
        root.style.setProperty("--fontsize", value / 15 + "rem");
        // Font Size
        localStorage.setItem("fontsize", this.selectedfontsize);
        //localStorage.setItem("fretboardsize", this.cddb.fretboardsize)
    }
    //-------------------------------------------------
    ProcessFile(event) {
        this.UpdateSong(event.target.result);
    }
    //-------------------------------------------------
    ClearNode(domNode) {
        while (domNode && domNode.firstChild) {
            domNode.removeChild(domNode.firstChild);
        }
    }
    //-------------------------------------------------
    CancelEvent(event) {
        event.cancelBubble = true;
        cancelEvent(event);
    }
    //-------------------------------------------------
    DisplaySelectedSong() {
        this.ClearUI();
        if (this.selectedpage) {
            // set title & artist
            let ttl = document.createElement("DIV");
            ttl.append(document.createTextNode(this.selectedpage.title));
            ttl.classList.add("title");
            this.pageinfo.append(ttl);
            let art = document.createElement("DIV");
            art.append(document.createTextNode(this.selectedpage.subtitle));
            art.classList.add("subtitle");
            this.pageinfo.append(art);

            // create the parts of the song
            this.selectedpage.HTMLnodes?.forEach((part) => {
                this.songNode.append(part);
            });
            this.songNode.style.bottom = 0;
        }
    }
    //-------------------------------------------------
    UpdateFavButtonIcon() {
        if (this.selectedpage) {
            this.toggleFavButton.SetChecked(this.selectedpage.isfavourite);
        }
    }
    //-------------------------------------------------
    ToggleFavState(event) {
        if (this.selectedpage) {
            this.selectedpage.ToggleFav(event);
            this.selectedpage.GetInterface().style.display = "block";
            this.UpdateFavButtonIcon();
        }
    }
    //-------------------------------------------------
    ScrollSelectedSongIntoView(event) {
        if (this.selectedpage) {
            this.selectedpage.GetInterface().scrollIntoView({
                behavior: "auto",
                block: "nearest",
                inline: "nearest",
            });
        }
    }
    //-------------------------------------------------
    ScrollNodeIntoView(event, node) {
        if (node) {
            node.scrollIntoView({
                behavior: "smooth",
                block: "center",
                inline: "center",
            });
        }
    }
    //-------------------------------------------------
    ClearUI(event) {
        this.ClearNode(this.songNode);
        this.ClearNode(this.UI.header);
        this.ClearNode(this.pageinfo);
    }
    //-------------------------------------------------
    MoveGlobalFunctionButtonsTo(toolbar) {
        if (toolbar) {
            toolbar.AddElements([
                this.separator3,
                this.addpagebutton.GetInterface(),
                this.separator,
                this.Owner.fullscreentoggle.UI,
                this.separator2,
                this.listmanagertrigger.GetInterface(),
            ]);
        }
    }
    //-------------------------------------------------
    ToggleList(event) {
        let shown = this.TableOfContentsIsDisplayed() ? 1 : 0;
        shown ? this.HideList(event) : this.ShowList(event);
    }
    //-------------------------------------------------
    ShowList(event) {
        if (this.editor) {
            this.editor.Hide();
        }
        this.ResortPageList();
        this.TOCNode.style.display = "block";
        this.MoveGlobalFunctionButtonsTo(this.toolbarTOC);

        if (this.selectedpage) {
            this.selectedpage.Mark(1);
        }
        localStorage.setItem("show.toc", 1);
        //window.dispatchEvent(new Event('resize'));
    }
    //-------------------------------------------------
    HideList(event) {
        if (this.editorwasactive) {
            this.editor.Show();
        }
        if (event) {
            event.preventDefault();
        }
        this.TOCNode.style.display = "none";
        localStorage.setItem("show.toc", 0);
        this.MoveGlobalFunctionButtonsTo(this.toolbarPage);
        this.DisplaySelectedSong();
    }
    //-------------------------------------------------
    AdjustEllipses() {
        this.pages.forEach((song) => {
            song.hrefNode.style.width = song.isfavourite ? "calc(100% - 40px)" : "calc(100% - 18px)";
            song.favToggle.className = song.isfavourite ? "favourite-on" : "favourite-none";
        });
    }
    //-------------------------------------------------
    CreateEditor(trigger) {
        this.editor = new Editor(this, trigger);
        //this.UI.append(this.editor.GetInterface());
        document.body.appendChild(this.editor.GetInterface());
    }
    //-------------------------------------------------
    ShowEditor(event) {
        this.editor.Show();
    }
    //-------------------------------------------------
    HideEditor(event) {
        this.editor.Hide();
    }
    //-------------------------------------------------
    UpdateCurrentSong(data) {
        let wasfav = this.selectedpage.isfavourite;
        this.selectedpage = new Page(this, data);
        this.selectedpage.isfavourite = wasfav;
        this.LoadPage(this.selectedpage.id);
        if (this.selectedpage) {
            this.selectedpage.Mark(1);
        }
        this.FillSongList();
        this.ToggleEditor(new Event("bogus"));

        this.SetSelectedSongEverywhere(this.selectedpage);
    }
    //-------------------------------------------------
    async AddNewPage(data) {
        alert("AddNewPage");
        // "data" is the data that the server returns
        // after a song has been newly added to the database
        console.log("ADDNEWPAGE", data);
        this.ToggleEditor(new Event("bogus"));

        let s = new Page(this, data, null, null, true);
        s.isfavourite = true;
        s.ReflectFavourite();
        this.selectedpage = s;
        this.pages.push(s);
        this.selectedpage.Mark(1); //

        // SAVE THE NEW LIST IN THE DATABASE
        let pagina = {};
        pagina.title = s.title;
        pagina.subtitle = s.subtitle;
        //pagina.author = s.author;
        pagina.codetext = s.codetext;

        let paginaJSON = JSON.stringify(pagina);

        let thepost = {
            method: "POST",
            headers: {
                Accept: "application/json;charset=utf-8",
                "Content-Type": "application/json",
                //"Cache-Control": "no-cache",
            },
            body: paginaJSON,
        };

        const response = await fetch(HOST + "updatepagina", thepost);
        await response.json().then((data) => {
            new TemporaryMessage("New File Saved · " + data.id);
            this.SetSelectedSongEverywhere(this.selectedpage);
            alert("insertintoTOC");
            this.FillSongList();
        });
    }
    //-------------------------------------------------
    CreateNewPage(event) {
        this.ShowEditor(event);
        this.editor.NewPage(event);
    }
    //-------------------------------------------------
    ToggleEditor(event) {
        if (this.editor.IsDisplayed()) {
            this.HideEditor(event);
        } else {
            if (!this.editor.IsContentEdited()) {
                this.editor.LoadPage(this.selectedpage);
            }
            this.ShowEditor(event);
        }
    }
    //-------------------------------------------------
    ToggleListmanager(event) {
        if (this.listmanager.IsDisplayed()) {
            this.listmanager.Hide(event);
            localStorage.setItem("show.listmanager", 0);
        } else {
            this.listmanager.Show(event);
            localStorage.setItem("show.listmanager", 1);
        }
        return false;
    }
    //-------------------------------------------------
    ShowSelectedSong() {
        this.SetSelectedSongEverywhere(this.selectedpage);
    }
    //-------------------------------------------------
    MarkSelectedSongEverywhere() {
        if (this.selectedpage) {
            // find in this.pages array
            this.pages.forEach((page) => {
                page.Mark(page.id === this.selectedpage.id);
            });
            // find in this.listmanager.items array
            this.listmanager.items.forEach((page) => {
                page.Mark(page.id === this.selectedpage.id);
            });
            // display the song's artist
            if (this.displaywhat.GetSelectedValue() == 1) {
                this.FilterOnSubtitle(new Event("bogus"), this.selectedpage.subtitle);
            }
        }
    }
    //-------------------------------------------------
    SelectRandomPage() {
        let page = this.pages[Math.floor(Math.random() * this.pages.length)];
        if (page) {
            this.selectedpage = page;
            new TemporaryMessage("Randomly Selected " + this.selectedpage.title, {
                fcolor: "var(--color_error)",
                bcolor: "white",
                align: "left",
            });
            this.DisplaySelectedSong();
        }
    }
    //-------------------------------------------------
    SetSelectedSongEverywhere(page) {
        if (page) {
            this.selectedpage = page;
            this.MarkSelectedSongEverywhere();

            // find the corresponding node in the this.pages and
            // scroll that one into view
            for (let i = 0; i < this.pages.length; i++) {
                if (this.pages[i].id == page.id) {
                    this.pages[i].GetInterface().scrollIntoView({
                        behavior: "auto",
                        block: "nearest",
                        inline: "nearest",
                    });
                    // update its title
                    this.pages[i].hrefNode.innerHTML = page.title;
                    break;
                }
            }
            // find a corresponding node in this.listmanager.items (if any)
            // and update its title
            for (let i = 0; i < this.listmanager.items.length; i++) {
                if (this.listmanager.items[i].id == page.id) {
                    this.listmanager.items[i].hrefNode.innerHTML = page.title;
                    break;
                }
            }
        } else {
            this.ShowList(new Event("bogus"));
            //select a random song
            this.SelectRandomPage();
        }
    }
    //-------------------------------------------------
    FindSong(id) {
        for (let i = 0; i < this.pages.length; i++) {
            if (this.pages[i].id === id) {
                return this.pages[i];
            }
        }
        return null; // not found
    }
    //-------------------------------------------------
    FindSongByTitle(song) {
        this.pages.sort((a, b) => (a.title > b.title ? 1 : -1));
        for (let i = 0; i < this.pages.length && song; i++) {
            if (this.pages[i].title === song.title && this.pages[i].id == song.id) {
                return i;
            }
        }
        console.error("Error: NO SONG SELECTED");
        return null; // not found
    }
    //-------------------------------------------------
    TableOfContentsIsDisplayed() {
        return this.TOCNode.style.display != "none";
    }
    //-------------------------------------------------
    NextPage(event) {
        if (this.TableOfContentsIsDisplayed()) {
            let index = this.FindSongByTitle(this.selectedpage);
            index = index >= this.pages.length - 1 ? 0 : index + 1;
            this.selectedpage = this.pages[index];
            this.LoadPage(this.selectedpage.id, false);
        }
    }
    //-------------------------------------------------
    PrevPage(event) {
        if (this.TableOfContentsIsDisplayed()) {
            let index = this.FindSongByTitle(this.selectedpage);
            index = index <= 0 ? this.pages.length - 1 : index - 1;
            this.selectedpage = this.pages[index];
            this.LoadPage(this.selectedpage.id, false);
        }
    }
    //-------------------------------------------------
    GoRight(event) {
        if (this.TableOfContentsIsDisplayed()) {
            let currentindex = this.FindSongByTitle(this.selectedpage);
            let jump = Math.floor(this.pagelisting.childNodes.length / this.GetColumnCount());
            let newindex = currentindex + jump;
            if (newindex >= this.pages.length) {
                // hitting right side of the list
                return;
            }
            this.pages[newindex].Select();
            this.LoadPage(this.selectedpage.id, false);
        }
    }
    //-------------------------------------------------
    GoLeft(event) {
        if (this.TableOfContentsIsDisplayed()) {
            let currentindex = this.FindSongByTitle(this.selectedpage);
            let jump = Math.floor(this.pagelisting.childNodes.length / this.GetColumnCount());
            let newindex = currentindex - jump;
            if (newindex < 0) {
                // hitting left side of the list
                return;
            }
            this.pages[newindex].Select();
            this.LoadPage(this.selectedpage.id, false);
        }
    }
    //-------------------------------------------------
    InsertIntoSongList(song) {
        //console.log("InsertIntoSongList", this.selectedpage);
        this.pages.push(song);
        this.pagelisting.append(song.GetInterface().cloneNode(true));
        // sort the list again ...
        this.ResortPageList();
    }
    //-------------------------------------------------
    ResortPageList() {
        this.pages.sort((a, b) => (a.title > b.title ? 1 : -1));
        // ... empty ...
        this.EmptyPageList();
        // ... and re-fill
        this.FillSongList();
    }
    //-------------------------------------------------
    FindInAllSongLyrics(string) {
        let lastlyricssearchstring = localStorage.getItem("lastlyricssearchstring")
            ? localStorage.getItem("lastlyricssearchstring")
            : "Georgia";
        let string2 = prompt("Search all lyrics in the Song Book for ...", lastlyricssearchstring);
        // process the song titles for the query string
        if (!string2) {
            // used cancelled
            this.pages.forEach((song) => {
                song.Show();
            });
        } else {
            lastlyricssearchstring = localStorage.setItem("lastlyricssearchstring", string2);
            for (let i = 0; i < this.pages.length; i++) {
                this.pages[i].GetInterface().style.display = "none";
                //let match = this.pages[i].lyrics.toLowerCase().match(string2.toLowerCase());
                let match = this.pages[i].lyrics.match(string2);
                if (match) {
                    // this.pages[i].GetInterface().title = this.pages[i].lyrics;
                    this.pages[i].GetInterface().style.display = "block";
                    continue;
                }
            }
        }
    }
    //-------------------------------------------------
    MakeTrailingChars(str, length) {
        let space = "";
        for (let i = 0; i < length - str.length; i++) {
            space += " ";
        }
        return str + space;
    }
    //-------------------------------------------------
    DetermineIndex(page) {
        console.log("DETERMINEINDEX", page);
        // find the index of the item that was dropped on
        for (let i = 0; i < this.pages.length; i++) {
            if (this.pages[i] == page) {
                console.log("determine index", i);
                return i;
            }
        }
        return -1;
    }
    //-------------------------------------------------
    DragStart(event) {
        //console.log("CURRICULUM DRAGSTART", this.draggedlink);
        this.draggedlink.GetInterface().style.cursor = "grabbing";
        this.listmanager.Show(event);
        this.bin.Show(event);
    }
    //-------------------------------------------------
    DragEnd(event) {
        //console.log("CURRICULUM DRAGEND");
        this.draggedlink.GetInterface().style.cursor = "pointer";
        this.bin.Hide(event);
    }
    //-------------------------------------------------
    InitEventListeners() {
        window.addEventListener("resize", (event) => {
            this.AdjustEllipses();
            this.MarkSelectedSongEverywhere();
        });

        document.addEventListener("adjustellipses", (event) => {
            window.setTimeout(() => this.AdjustEllipses(event), 1000);
        });

        document.body.addEventListener("keydown", (event) => {
            if (this.editor == null || (this.editor && this.editor.IsDisplayed() == false)) {
                // console.log(event.key)
                switch (event.key) {
                    case "E":
                    case "e":
                        if (event.ctrlKey) {
                            this.editor.Show(event);
                        }
                        break;
                    case "L":
                    case "l":
                        this.listmanager.listdropdown.ToggleOptions(event);
                        break;
                    case "ArrowDown":
                        if (this.TableOfContentsIsDisplayed()) {
                            this.NextPage(event);
                        } else {
                            this.listmanager.JumpToNextFavouriteSong(this.selectedpage);
                        }
                        break;
                    case "ArrowUp":
                        if (this.TableOfContentsIsDisplayed()) {
                            this.PrevPage(event);
                        } else {
                            this.listmanager.JumpToPrevFavouriteSong(this.selectedpage);
                        }
                        break;
                    case ".":
                        this.songNode.scrollBy(10, 0); // horizontal scolling
                        break;
                    case "\\":
                        this.ToggleListmanager(event);
                        break;
                    case "Tab":
                        event.preventDefault();
                        this.ToggleList(event);
                        break;
                    case "[":
                        this.ChangeFontSize(-2);
                        break;
                    case "]":
                        this.ChangeFontSize(+2);
                        break;
                    case "*":
                        this.selectedpage.ToggleFav(event);
                        break;
                    case "Enter":
                        if (event.shiftKey) {
                            this.listmanager.JumpToPrevFavouriteSong(this.selectedpage);
                        } else {
                            this.listmanager.JumpToNextFavouriteSong(this.selectedpage);
                        }
                        break;
                    case "ArrowLeft":
                        if (this.TableOfContentsIsDisplayed()) {
                            // navigate to the left if T.O.C. is shown
                            this.GoLeft();
                        }
                        break;
                    case "ArrowRight":
                        if (this.TableOfContentsIsDisplayed()) {
                            // navigate to the right if T.O.C. is shown
                            this.GoRight();
                        }
                        break;
                }
            }
        });
    }
    //-------------------------------------------------
    RemoveSongEverywhereFromDOM(page) {
        // find in this.listmanager.items array
        for (let i = 0; i < this.listmanager.items.length; i++) {
            let p = this.listmanager.items[i];
            if (p.id == page.id) {
                p.GetInterface().style.backgroundColor = "red";
                p.GetInterface().parentNode.removeChild(p.GetInterface());
                this.listmanager.items.splice(i, 1);
                // is this the selectedpage? if so,
                // randomly choose another song to be the selected song
                if (page.id == this.selectedpage.id) {
                    this.SelectRandomPage();
                }
            }
        }
        // find in this.pages array
        for (let i = 0; i < this.pages.length; i++) {
            let p = this.pages[i];
            if (p.id == page.id) {
                p.GetInterface().style.backgroundColor = "green";
                p.GetInterface().parentNode.removeChild(p.GetInterface());
                this.pages.splice(i, 1);
            }
        }
    }
    //-------------------------------------------------
    DeletePage(item) {
        if (item instanceof Page) {
            //console.log("DELETE Song", item.id, item.title);
            if (confirm("Delete " + item.title + " from the database?")) {
                // remove from DOM & this.pages on the client
                this.RemoveSongEverywhereFromDOM(item);
                // remove from the DATABASE on the server
                // HOW TO PROPERLY CASCADE ON DELETE
                // 1. if the currentpage is mentioned in the paginas_per_lijst table
                // it should be removed from that table FIRST
                // TODO

                // 2. then it should be ALSO deleted from the pagina-table
                fetch(HOST + "deletepagina/" + item.id);
            }
        }
    }
    //-------------------------------------------------
    MarkCorrespondingPageAsFavourite(id) {
        // find the corresponding node in the TOC and mark it as favourite
        for (let i = 0; i < this.pages.length; i++) {
            if (this.pages[i].id === id) {
                this.pages[i].isfavourite = true;
                this.pages[i].ReflectFavourite();
            }
        }
    }
    //-------------------------------------------------
}
