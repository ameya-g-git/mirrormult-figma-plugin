// This shows the HTML page in "ui.html".
figma.showUI(__html__);

figma.ui.resize(400, 500);

const toolObjs = [figma.currentPage.selection]; // saves the objects for the plugin to mirror in a separate list for later

figma.currentPage.selection = []; // deselects all the objects as they are no longer needed

// add an outline to the objects to make it clear for later reference

function getSelectedObjName() { // returns different messages depending on how many objs are selected
    const selection = figma.currentPage.selection;

    if (selection.length > 1) {
        return "Too many objects selected!"
    }
    else if (selection.length === 1) {
        return selection[0].name; // selection is a list, so we need this notation to get the name of the selected obj
    }
    return "No object selected";

};

figma.on("selectionchange", () => { // posts the name of the selected o
    const selectedObjName = getSelectedObjName();

    

    figma.ui.postMessage({selectedObj: selectedObjName});
});

figma.ui.onmessage = async(pluginMessage) => {

};