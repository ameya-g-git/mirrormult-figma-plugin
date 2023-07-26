// This shows the HTML page in "ui.html".
figma.showUI(__html__);

figma.ui.resize(400, 500);

const selectedObjects = [figma.currentPage.selection];

figma.currentPage.selection = [];

function getSelectedObjName() {
    const selection = figma.currentPage.selection;

    if (selection.length > 1) {
        return "Too many objects selected!"
    }
    else if (selection.length === 1) {
        return selection[0].name; // Assuming you want the name of the first selected object
    }
    return "No object selected";

};

figma.on("selectionchange", () => {
   const selectedObjName = getSelectedObjName();

    figma.ui.postMessage({selectedObj: selectedObjName});
});

figma.ui.onmessage = async(pluginMessage) => {

};