ide.MakePlugin("Metro");
ui.script("Metro.js");
cfg.Portrait;

class Main extends App {
    constructor() {
        super();
        this.localize = $localize("en", {
            en: {
                greeting: "Hello, {name}!",
                farewell: "Goodbye!",
            },
            fr: {
                greeting: "Bonjour, {name}!",
                farewell: "Au revoir!",
            },
            tn: {
                greeting: "Dumela, {name}!",
                farewell: "Tsamaya sentle!",
            },
        });
        this.layMain = ui.addLayout("main", "linear", "fillxy,vcenter");
        this.txt = ui.addText(this.layMain);
        this.txt.localizedText(this.localize, "greeting", { name: "Oarabile" });
    }

    loadData() {
        // Simulate an async operation using a Promise
        return new Promise(function (resolve, reject) {
            setTimeout(function () {
                resolve("Data loaded successfully!");
            }, 1000);
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
        btn2.setOnTouch(() => {
            this.localize.setLanguage("fr");
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
        }`.on("click", (e) => {
            e.stopPropagation();
            this.localize.setLanguage("tn");
        });

        // Another Example Of Same Thing But Using addHTMLElemnt Fn

        let outlinebtnB = ui.addHTMLElement(this.layMain, "button", "", -1, -1);
        outlinebtnB.batch({
            textContent: "Button B",
        });
        outlinebtnB.css({
            border: "2px solid #6200ea",
            color: "#6200ea",
            "background-color": "transparent",
            "font-family": `"Archivo", sans-serif`,
            "font-weight": 500,
            "font-size": "1rem",
            "text-align": "center",
            cursor: "pointer",
            padding: "0.5rem 1rem",
            transition: "background-color 0.3s, color 0.3s",

            "&:hover": {
                "background-color": "#6200ea",
                color: "white",
            },

            "&:active": {
                "background-color": "#3700b3",
                "border-color": "#3700b3",
            },
        });

        outlinebtnB.on("click", (e) => {
            e.stopPropagation();
            ui.showPopup("Clicked Custom Button");
        });

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
