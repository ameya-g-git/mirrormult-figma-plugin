// This shows the HTML page in "ui.html".
figma.showUI(__html__);

figma.ui.resize(400, 500);

const toolObjs = [figma.currentPage.selection][0]; // saves the objects for the plugin to mirror in a separate list for later
let cursorPosition = [0]; // see if this works lol
let cursorGroup; // so that cursorGroup has a type, allowing it to work as a condition within the msgFor === 2 statement
const preferredName = '🪞/🔅 Cursor'; // holds the name of the cursor

figma.currentPage.selection = []; // deselects all the objects as they are no longer needed

// code below updates ui with the currently selected object

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
/* ----------- */

// function below makes each toolObj's components have the same coordinates and scale as the original object
function componentify(obj) {
    const objComp = figma.createComponent()
    objComp.appendChild(obj);
    objComp.x = obj.x;
    objComp.y = obj.y;
    objComp.resize(obj.width, obj.height);

    obj.relativeTransform = [ // places the source obj (from toolObjs) directly at where the component frame is
        [1, 0, 0],
        [0, 1, 0]
    ];

    return objComp;
}
/* ----------- */


// function below checks if cursor is on current page
function findCursor() {
    const cursor = figma.root.findOne(node => node.type === 'GROUP' && node.name === preferredName);

    return cursor;
}

figma.ui.onmessage = async(pluginMessage) => {
    const msgFor = pluginMessage.msgFor; // allows for easy designation of which pluginMessage is received

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
        }

        cursorGroup.name = preferredName;
        figma.currentPage.selection = [cursorGroup];
    }
    else if (msgFor === 2) { // empty object checkbox is deselected
        const cursorFound = findCursor();
        if (cursorFound) {
            cursorFound.remove();
        }
    }
    else if (msgFor === 3) { // mirrormult functionality
        const mirrorHori = pluginMessage.mirrorHori;
        const mirrorVert = pluginMessage.mirrorVert;
        let obj;
        let objComp;
        let objInst;
        let origin;
        let originPosition = [0, 0];

        const cursorGroup = figma.root.findOne(node => node.type === 'GROUP' && node.name === preferredName);

        if (cursorGroup) {
            origin = cursorGroup
        }
        else {
            origin = figma.root.findOne(node => node.name === getSelectedObjName());
        }
        originPosition = [origin.x + (origin.width / 2), origin.y + (origin.height / 2)]


        for (let i = 0; i < toolObjs.length; i++) {
            obj = toolObjs[i];

            if (mirrorHori || mirrorVert) {
                if (mirrorHori) { // horizontal mirror
                    if (!objComp) { 
                        objComp = componentify(obj);
                    };
                    objInst = objComp.createInstance();
                    
                    objInst.x = objComp.x + (-2) * (objComp.x - originPosition[0]); // uses calculations to determine the object's horizontal position based on origin position
                    objInst.y = objComp.y;
                    objInst.relativeTransform = [ // relative transform so that the instance is reflected, so that any adjustments to the source obj are horizontally reflected across the origin
                        [-1, 0, objInst.x],
                        [0, 1, objInst.y] 
                    ];
                };
                
                if (mirrorVert) { // vertical mirror
                    if (!objComp) { 
                        objComp = componentify(obj);
                    };
                    objInst = objComp.createInstance();
                    
                    objInst.x = objComp.x;
                    objInst.y = objComp.y + (-2) * (objComp.y - originPosition[1]); // same calculations but for y coord
                    objInst.relativeTransform = [ // relative transform so that the instance is reflected, so that any adjustments to the source obj are vertically reflected across the origin
                        [1, 0, objInst.x],
                        [0, -1, objInst.y] 
                    ];
                }

                if (mirrorHori && mirrorVert) { // if both are selected, there's gonna need to be one at the remaining corner
                    if (!objComp) { 
                        objComp = componentify(obj);
                    };
                    objInst = objComp.createInstance();
                    
                    objInst.x = objComp.x + (-2) * (objComp.x - originPosition[0]); // calculations but for both x and y!!!!!
                    objInst.y = objComp.y + (-2) * (objComp.y - originPosition[1]);
                    objInst.relativeTransform = [ // relative transform so that the instance is reflected, so that any adjustments to the source obj are diagonally reflected across the origin
                        [-1, 0, objInst.x],
                        [0, -1, objInst.y]
                    ];
                }
            }
        }
    }

    figma.on('close', () => {
        const cursors = figma.root.findAll(node => node.type === 'GROUP' && node.name === preferredName); // on the off chance someone has multiple cursors on screen accidentally
        if (cursors) {
            for (var cursorDup of cursors) {
                cursorDup.remove();
            }
        }
    });
};
