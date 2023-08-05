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



figma.ui.onmessage = (pluginMessage) => {
    const msgFor = pluginMessage.msgFor;
    console.log(msgFor)

    // CHANGE THIS TO MAKE A COMPONENT OF THE CURSOR AND USE AN SVG FILE AS THE CURSOR InsteAD OF CREATING IT MANUALLY

    if (msgFor === 1) { // empty object checkbox is checked
        const zoom = figma.viewport.zoom;
        const center = figma.viewport.center
        const size = 50; // holds a base size for the cursor at 100% zoom
        const sizeAdjusted = size / zoom; // keeps the cursor the same visual size no matter the zoom

        const pinkCircle = figma.createEllipse();
        pinkCircle.x = center.x;
        pinkCircle.y = center.y;
        pinkCircle.resize(sizeAdjusted, sizeAdjusted);
        pinkCircle.rotation = 135;
        pinkCircle.name = '💖';
        pinkCircle.fills = [{type: 'SOLID', color: {r: 1, g: 63/255, b: 190/255}}];;
        pinkCircle.arcData = {startingAngle: 0, endingAngle: Math.PI, innerRadius: (10/12)};

        const purpCircle = figma.createEllipse();
        purpCircle.x = center.x;
        purpCircle.y = center.y;
        purpCircle.resize(sizeAdjusted, sizeAdjusted);
        purpCircle.rotation = -45;
        purpCircle.name = '💜';
        purpCircle.fills = [{type: 'SOLID', color: {r: 175/225, g: 11/255, b: 1}}];;
        purpCircle.arcData = {startingAngle: 0, endingAngle: Math.PI, innerRadius: (10/12)};

        const yellCircle = figma.createEllipse();
        yellCircle.x = center.x;
        yellCircle.y = center.y;
        yellCircle.resize(sizeAdjusted, sizeAdjusted);
        yellCircle.name = '💛';
        yellCircle.fills = [{type: 'SOLID', color: {r: 1, g: 184/255, b: 0}}];
        yellCircle.opacity = 0.8;
        yellCircle.dashPattern = [sizeAdjusted * 8 / 39];
    }
};
