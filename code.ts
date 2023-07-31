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

figma.on("selectionchange", () => { // posts the name of the selected obj
    const selectedObjName = getSelectedObjName();

    figma.ui.postMessage({selectedObj: selectedObjName});
});

figma.ui.onmessage = (emptyObjMessage) => {
    console.log("empty eyah")

    const zoom = figma.viewport.zoom;
    const center = figma.viewport.center
    const size = 100; // holds a base size for the cursor at 100% zoom

    const circle = figma.createEllipse();
    circle.x = center.x;
    circle.y = center.y;
    circle.resize(size, size);
    circle.fills = [{type:'SOLID', color: {r:1, g:0, b:1}}];

    console.log(circle.x, circle.y);
    
};
