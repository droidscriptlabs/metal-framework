ide.MakePlugin("Metro");
ui.script("Metro.js");
cfg.Portrait;

class Main extends App {
    constructor() {
        super();
        this.layMain = ui.addLayout("main", "linear", "fillxy,vcenter");
        this.txt = ui.addText(this.layMain, "My Hybrid app");
    }

    loadData() {
        // Simulate an async operation using a Promise
        return new Promise(function (resolve, reject) {
            setTimeout(function () {
                resolve("Data loaded successfully!");
            }, 100);
        });
    }

    onStart() {
        this.layMain.setChildMargins(0.02, 0.02, 0.02, 0.02);

        let prog = ui.addProgress(
            this.layMain,
            null,
            "Linear,Secondary,indeterminate",
            0.7
        );

        let btn = ui.addButton(this.layMain, "My Button", "primary");

        let theme = $signal("light");

        theme.subscribe((output) => {
            ui.setTheme(output);
        });

        let btn2 = ui.addButton(this.layMain, "My Second Button", "outlined");
        btn2.setOnTouch(function () {
            btn2.createAnimSequence()
                .move(250, 350, 1500, 0)
                .then()
                .rotate(50, 1500, 3000)
                .start();
        });

        let outlinebtn = $component(this.layMain, "button", -1, -1, {
            textContent: "Hello World",
        }).css`
        border: 2px solid #6200ea;
        color: #6200ea;
        background-color: transparent; 
        font-family: "Archivo", sans-serif;
        font-weight: 500; 
        font-size: 1rem;
        text-align: center;
        cursor: pointer;
        padding: 0.5rem 1rem; 
        transition: background-color 0.3s, color 0.3s;
    
        &:hover {
            background-color: #6200ea; 
            color: white; 
        }

        &:active {
            background-color: #3700b3; 
            border-color: #3700b3; 
        }`.on("click", function (e) {
            e.stopPropagation();
            ui.showPopup("Clicked Custom Button");
        });

        // Another Example Of Same Thing But Using addHTMLElemnt Fn

        // let outlinebtn = ui.addHTMLElement(this.layMain, 'button', '', -1, -1);
        // outlinebtn.batch({
        //     textContent: 'Hello World'
        // })
        // outlinebtn.css`
        // border: 2px solid #6200ea;
        // color: #6200ea;
        // background-color: transparent;
        // font-family: "Archivo", sans-serif;
        // font-weight: 500;
        // font-size: 1rem;
        // text-align: center;
        // cursor: pointer;
        // padding: 0.5rem 1rem;
        // transition: background-color 0.3s, color 0.3s;

        // &:hover {
        //     background-color: #6200ea;
        //     color: white;
        // }

        // &:active {
        //     background-color: #3700b3;
        //     border-color: #3700b3;
        // }
        // `

        // outlinebtn.on('click', (e)=>{
        //     e.stopPropagation();
        //     ui.showPopup("Clicked Custom Button");
        // })

        $suspense(this.loadData, prog, this.layMain).effects(() => {
            //Effects like showIF must always be wrapped in this function to make
            //Them work
            $showIF(true, outlinebtn, btn);
        });

        $on("visibilitychange", () => {
            document.hidden
                ? (this.txt.text = "You Fired an OnPause Like Event 🔥")
                : null;
        });
    }
}
