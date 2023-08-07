// This shows the HTML page in "ui.html".
figma.showUI(__html__);

figma.ui.resize(400, 500);

const toolObjs = [figma.currentPage.selection]; // saves the objects for the plugin to mirror in a separate list for later
let cursorPosition;
let cursorGroup; // so that cursorGroup has a type, allowing it to work as a condition within the msgFor === 2 statement
const preferredName = '🪞/🔅 Cursor'; // holds the name of the cursor


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

    if (msgFor === 1) { // empty object checkbox is checked
        const zoom = figma.viewport.zoom;
        const center = figma.viewport.center
        const size = 36; // holds a base size for the cursor at 100% zoom
        const sizeAdjusted = size / zoom; // keeps the cursor the same visual size no matter the zoom

        const pinkCircle = figma.createEllipse(); // pink half of the ring
        pinkCircle.x = center.x;
        pinkCircle.y = center.y + (Math.sqrt(2) * sizeAdjusted); // figma considers the bounding box of the object to be its size, so the translation accounts for how the circle's bounding box is sqrt(2) bigger than the object's selection box
        pinkCircle.resize(sizeAdjusted, sizeAdjusted);
        pinkCircle.name = '💖';
        pinkCircle.fills = [{type: 'SOLID', color: {r: 1, g: 63/255, b: 190/255}}];;
        pinkCircle.arcData = {startingAngle: 0, endingAngle: Math.PI, innerRadius: (10/12)};
        pinkCircle.rotation = 135;

        const purpCircle = figma.createEllipse(); // purple half of the ring
        purpCircle.rotation = -45;
        purpCircle.x = center.x;
        purpCircle.y = center.y;
        purpCircle.resize(sizeAdjusted, sizeAdjusted);
        purpCircle.name = '💜';
        purpCircle.fills = [{type: 'SOLID', color: {r: 175/225, g: 11/255, b: 1}}];;
        purpCircle.arcData = {startingAngle: 0, endingAngle: Math.PI, innerRadius: (10/12)};
        const ring = figma.flatten([pinkCircle, purpCircle]); // makes the two semicircles into one object as to get a more useful coordinate for alignment later on
        ring.name = '💖/💜';

        const yellCircle = figma.createEllipse(); // yellow dashed border circle generation
        yellCircle.x = ring.x + (1/24 * ring.width);
        yellCircle.y = ring.y + (1/24 * ring.height);
        yellCircle.resize(sizeAdjusted * (11/12), sizeAdjusted * (11/12));
        yellCircle.name = '💛';
        yellCircle.strokes = [{type: 'SOLID', color: {r: 1, g: 184/255, b: 0}}];
        yellCircle.strokeWeight = sizeAdjusted * (1/12);
        yellCircle.fills = [];
        yellCircle.opacity = 0.8;
        yellCircle.dashPattern = [sizeAdjusted * (1/6), sizeAdjusted * (1/6)];
        yellCircle.strokeCap = 'ROUND';
        yellCircle.strokeAlign = 'CENTER';

        cursorGroup = figma.group([ring, yellCircle], figma.currentPage); // initializes the group for the cursor's objects

        for (let i = 0; i < 4; i++) { // axis generation
            const axisLine = figma.createLine();
            axisLine.strokes = [{type: 'SOLID', color: {r: 102/255, g: 102/255, b: 102/255}}]
            axisLine.strokeWeight = sizeAdjusted / 12;
            axisLine.resize(sizeAdjusted / 2, 0);
            axisLine.strokeCap = 'ROUND';
            
            switch (i) {
                case 0: // top line generation
                    axisLine.rotation = 90;
                    axisLine.x = ring.x + (sizeAdjusted / 2) + (sizeAdjusted / 24);
                    axisLine.y = ring.y + (sizeAdjusted / 4);
                    axisLine.name = 'Top';
                    break;
                case 1: // right line generation
                    axisLine.x = ring.x + ((3 * sizeAdjusted) / 4);
                    axisLine.y = ring.y + (sizeAdjusted / 2) + (sizeAdjusted / 24);
                    axisLine.name = 'Right';
                    break;    
                case 2: // bottom line generation
                    axisLine.rotation = 90;
                    axisLine.x = ring.x + (sizeAdjusted / 2) + (sizeAdjusted / 24);
                    axisLine.y = ring.y + ((5 * sizeAdjusted) / 4);
                    axisLine.name = 'Bottom';
                    break
                case 3: // left line generation
                    axisLine.x = ring.x - (sizeAdjusted / 4);
                    axisLine.y = ring.y + (sizeAdjusted / 2) + (sizeAdjusted / 24);
                    axisLine.name = 'Left';
                    break;                
                default:
                    break;
            }

            axisLine.name += ' Axis'

            cursorGroup.insertChild(cursorGroup.children.length - 2, axisLine); // adds the line to the cursor group
            cursorGroup.name = preferredName;

            cursorPosition = [cursorGroup.x + (cursorGroup.width / 2), cursorGroup.y + (cursorGroup.height / 2)];
        }
    }
    else if (msgFor === 2) { // empty object checkbox is deselected
        const cursorFound = figma.root.findOne(node => node.type === 'GROUP' && node.name === preferredName);
        if (cursorFound) {
            cursorFound.remove();
        }
    }
};
