class AppShell {
    constructor(data) {
        //console.log(data)
        this.columnwidth = 360; // pixels, default
        //d.classList.add("unselectable");
        
        this.fullscreentoggle = new Button(this, {
            caption: "",
            checked: 0,
            classname: "fullscreenbutton",
            title: "Full Screen Toggle",
            //shortcut: "Shift + Space",
            func_click: (event)=>{
                this.ToggleFullscreen(event);
            }
        });
        
        this.CalculateNumberOfColumns();
        let d = document.body;
        d.append(new Curriculum(this, data).GetInterface());
        d.onkeydown = (event) => {
            switch (event.key) {
                case "Escape":
                    // catch escape keypress and prevent browser going out of maximized screen mode
                    event.preventDefault();
                    event.stopPropagation();
                    break;
            }
        };
    }
    //-------------------------------------------------
    ToggleFullscreen(event) {
        // this event is fired after going into or coming out of full screen
        let elem = document.documentElement;
        //elem.onfullscreenchange = this.HandleFullscreenChange.bindEventListener(this);
        if (!document.fullscreenElement) {
            this.fullscreentoggle.SetChecked(1);
            elem.requestFullscreen()
                .then({})
                .catch((err) => {
                    alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
                    this.fullscreentoggle.SetChecked(0);
                });
        } else {
            document.exitFullscreen();
            this.fullscreentoggle.SetChecked(0);
        }
    }
    //-------------------------------------------------
    CalculateNumberOfColumns() {
        let c = this.columnwidth;
        let node = document.body;
        if (node) {
            let w = node.clientWidth;
            let colcount = parseInt((w - (w % c)) / c);
            // keep between 1 and 7 columns
            // colcount = Math.min(7, Math.max(colcount, 1));
            root.style.setProperty("--numberofcolumns", colcount);
        } else {
            console.error("app.shell.js >> Can't calc cols!");
        }
    }
    //-------------------------------------------------
}
