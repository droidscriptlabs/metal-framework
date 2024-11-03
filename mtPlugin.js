app.LoadPlugin("Metro");
cfg.Portrait;

class Main extends App {
    constructor() {
        super();
        this.layMain = ui.addLayout("main", "linear", "fillxy,vcenter");
        this.txt = ui.addText(this.layMain, null, "body1, Left", 0.9);
        this.txt.backColor = "#e0e0e0";
        this.txt2 = ui.addText(this.layMain, null, "body1, Left", 0.9);
        this.txt2.backColor = "#e0e0e0";
    }

    async loadData() {
        try {
            await $localize(
                "en",
                "https://raw.githubusercontent.com/oarabiledev/metro/main/translations.json"
            );
        } catch (error) {
            console.log("Failed to load translation data:", error);
        }
    }

    onStart() {
        this.layMain.setChildMargins(0.02, 0.02, 0.02, 0.02);

        let prog = ui.addProgress(
            this.layMain,
            null,
            "Linear,Secondary,indeterminate",
            0.7
        );

        let btn2 = ui.addButton(this.layMain, "Change To French", "outlined");
        btn2.setOnTouch(() => {
            $setLanguage("fr");
            ui.showPopup("Changed Language To French");
        });

        let outlinebtn = $component(this.layMain, "button", -1, -1, {
            textContent: "Change To Setswana",
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
            $setLanguage("tn");
            ui.showPopup("Changed Language To Setswana");
        });

        $suspense(this.loadData, prog, this.layMain).effects(() => {
            this.txt.localizedText("greeting", { name: "Oarabile" });
            this.txt2.localizedText("speech");
        });
    }
}
