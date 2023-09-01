// This shows the HTML page in "ui.html".
figma.showUI(__html__);

figma.ui.resize(400, 500);

const toolObjs = [figma.currentPage.selection][0]; // saves the objects for the plugin to mirror in a separate list for later
let tempToolObjs = toolObjs; // holds toolObjs in a temp list to be used for parent testing

function properParent(obj) {
    let objParent = obj.parent;
    if (objParent.type === 'PAGE') {
        objParent = figma.currentPage;
    }
    else if (objParent.type != 'FRAME') {
        objParent = properParent(objParent) // will keep going up hierarchies until either a page or a frame is reached
    }

    return objParent
}

let goodParent = properParent(toolObjs[0]); // will hold the parent that all objects created via the plugin will be placed into

const toolObjNames = toolObjs.map(obj => obj.name); // maps items from a defined list and allows you to create a new list by taking properties of each item from that predefined list, woa!!!
figma.ui.postMessage({toolObjNames});

let cursorPosition = []; // see if this works lol
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

function TLtoC(obj) { // will take in a Rect object (or any object with x, y, width, and height) and return its coordinates from its center, rather than from its top left corner of its bounding box
    return ([obj.x + (obj.width / 2), obj.y + (obj.height / 2)])
}

// function getRelCoords(obj) {
//     return [obj.relativeTransform[0][2], obj.relativeTransform[1][2]];
// }

function rotateFromCenter(obj, angle) {
    return [
        [cos(angle), -sin(angle), obj.x], // TODO: rotation for RotSymm needs to be fixed, since the object won't necessarily be rotated by increments of a 
        [sin(angle), cos(angle), obj.y]
    ];
}

// function below makes each toolObj's components have the same coordinates and scale as the original object
function componentify(obj) {
    const objComp = figma.createComponent()
    objComp.appendChild(obj);
    goodParent.appendChild(objComp)
    objComp.name = obj.name;
    objComp.x = obj.x;
    objComp.y = obj.y;
    //objComp.resize(obj.width, obj.height); // nEED TO CONVERT ALL CODE TO WORK WITH RELATIVE TRANSFORMS INSTEAD OF GLOBAL TRANSFORM :SOB:
    objComp.resizeWithoutConstraints(obj.width, obj.height)

    obj.relativeTransform = [ // places the source obj (from toolObjs) directly at where the component frame is
        [0.5, 0, 0],
        [0, 1, 0] // STILL NEED TO FIGURE OUT HOW THE DAMN ROTATION WORK
    ];

    // objComp.relativeTransform = [
    //     [cos(objAngle), -sin(objAngle), objComp.x],
    //     [sin(objAngle), cos(objAngle), objComp.y]
    // ];

    
    
    return objComp;
}
/* ----------- */
// basic trig functions to make function calls easier

function sin(theta) {
    return (Math.sin(theta));
};

function cos(theta) {
    return (Math.cos(theta));
};


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
        const sizeAdjusted = Math.round(size / zoom); // keeps the cursor the same visual size no matter the zoom

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

        cursorGroup = figma.group([ring, yellCircle], goodParent); // initializes the group for the cursor's objects

        // consider making a component of all the toolObjs so that you only need to move instances to their respective place, not each objects instances
        // i still need to change everything to relative coordinates 
        // also i could just use the object from the option where you dont use the cursor to decide where the instances should go, should be easy enough

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
    else if (msgFor === 3 || msgFor === 4) { // plugin functionality
        let compGroup;
        let objInst;
        let origin;

        // mirrormult specific variables
       
        let mirrorList = []; // will hold all the reflected objects in their respective groups
        let groupList = []; // if toolObjs is greater than 1, this will hold all the group nodes to group altogether
        let mmGroup; // because figma doesnt let there be empty groups so i need a variable to hold the group

        // rotsymm specific variables
        const numCopies = pluginMessage.numCopies

        const cursorGroup = figma.root.findOne(node => node.type === 'GROUP' && node.name === preferredName);

        if (cursorGroup) {
            origin = cursorGroup;
        }
        else {
            origin = figma.root.findOne(node => node.name === getSelectedObjName());
        }        

        let originPosition = TLtoC(origin);


        if (msgFor === 3) { // mirrormult functionality
            const mirrorHori = pluginMessage.mirrorHori;
            const mirrorVert = pluginMessage.mirrorVert;

            const toolGroup = figma.group(toolObjs, goodParent);
            toolGroup.name = 'Source Group';
            const compGroup = componentify(toolGroup);
            compGroup.name = 'Source Component';
            
            mirrorList.push(compGroup);

            if (mirrorHori || mirrorVert) {
                if (mirrorHori) { // horizontal mirror
                    objInst = compGroup.createInstance();
                    goodParent.appendChild(objInst);
                    
                    objInst.x = compGroup.x + (-2) * (compGroup.x - originPosition[0]);
                    objInst.y = compGroup.y;
                    objInst.relativeTransform = [ // relative transform so that the instance is reflected, so that any adjustments to the source obj are horizontally reflected across the origin
                        [-1, 0, objInst.x],
                        [0, 1, objInst.y] 
                    ];

                    //objInst.relativeTransform = rotateFromCenter(objInst, objAngle)

                    objInst.name = 'Reflection-H';
                    mirrorList.push(objInst);
                };
                
                if (mirrorVert) { // vertical mirror
                    objInst = compGroup.createInstance();
                    goodParent.appendChild(objInst);
                                            
                    objInst.x = compGroup.x;
                    objInst.y = compGroup.y + (-2) * (compGroup.y - originPosition[1]); // same calculations but for y coord
                    objInst.relativeTransform = [ // relative transform so that the instance is reflected, so that any adjustments to the source obj are vertically reflected across the origin
                        [1, 0, objInst.x],
                        [0, -1, objInst.y] 
                    ];
                    
                    objInst.name = 'Reflection-V'
                    mirrorList.push(objInst)
                };

                if (mirrorHori && mirrorVert) { // if both are selected, there's gonna need to be one more reflected object at the remaining corner
                    if (!compGroup) { // unnecessary conditional, but to reduce errors im just gonna keep it lol
                        compGroup = componentify(obj);
                    };
                    objInst = compGroup.createInstance();
                    
                    objInst.x = compGroup.x + (-2) * (compGroup.x - originPosition[0]); // calculations but for both x and y!!!!!
                    objInst.y = compGroup.y + (-2) * (compGroup.y - originPosition[1]);
                    objInst.relativeTransform = [ // relative transform so that the instance is reflected, so that any adjustments to the source obj are diagonally reflected across the origin
                        [-1, 0, objInst.x],
                        [0, -1, objInst.y]
                    ];
                    
                    objInst.name = 'Reflection-HV'
                    mirrorList.push(objInst)
                };

                mmGroup = figma.group(mirrorList, goodParent);
                mmGroup.name = '🪞 '; // just adds a mirror emoji + the name of the object involved in mirroring

                for (let i = 0; i < toolGroup.children.length; i++) {
                    let obj = toolGroup.children[i];
                    let name = mmGroup.name
                    if (i < 3) {
                        name += obj.name + ', ';
                    }
                    else {
                        name = mmGroup.name.substring(0, mmGroup.name.length - 2) // removes the comma at the end
                        name += '...'
                        break
                    }

                    if (name[name.length - 1] === ',') {
                        name = name.substring(0, name.length - 2);
                    }
                }

                if (toolObjs.length > 1) { // if more than 1 object is selected, then another parent group is needed to hold all the individual mirror groups involved in the process
                    groupList.push(mmGroup);
                };
                
                
            };
        }

        else if (msgFor === 4) { // rotsymm functionality
            const numCopies = pluginMessage.numCopies;

            for (let obj of toolObjs) {                
                let objPosition = TLtoC(obj);

                let xDiff = objPosition[0] - originPosition[0];
                let yDiff = objPosition[1] - originPosition[1];
                console.log(xDiff, yDiff)

                console.log(originPosition)

                let radius = Math.sqrt(Math.pow(xDiff, 2) + Math.pow(yDiff,2))
                let angle = Math.acos(xDiff/radius) // returns the angle that the object makes with the origin as per the unit circle
                console.log(angle)
                const rotationAngle = 2 * Math.PI / numCopies;

                compGroup = componentify(obj);
                let objAngle // = objComp.rotation

                // TODO: same rotation problem from MirrorMult but for Rotsymm, fix this kid
                // componentify function needs to be adjusted since relativeTransform should not bring it back to default rotation

                for (let i = 1; i < numCopies; i++) {
                    angle += rotationAngle; // will hold the angle that the instance will be at on the unit circle
                    objAngle = -rotationAngle * i;

                    console.log(angle)
                    console.log(cos(angle), sin(angle))
                    // console.log(objComp.x, objComp.y)
                    console.log(cos(angle) * radius, sin(angle) * radius)
                    
                    objInst = compGroup.createInstance();
                    objInst.x = originPosition[0] + (cos(angle) * radius); // cursor position is the base position, x position varies based on unit circle (sin is vertical pos, cos is horizontal)
                    objInst.y = originPosition[1] - (sin(angle) * radius);
                    // console.log(objInst.x, objInst.y);
                    let objInstPosition = TLtoC(objInst);

                    objInst.relativeTransform = [
                        [cos(objAngle), -sin(objAngle), objInst.x], // TODO: rotation for RotSymm needs to be fixed, since the object won't necessarily be rotated by increments of a 
                        [sin(objAngle), cos(objAngle), objInst.y]
                    ];
                    let objBoxPosition = TLtoC(objInst.absoluteBoundingBox); // holds the bounding box's position from its center
                    
                    objInst.x += (objInstPosition[0] - objBoxPosition[0])
                    objInst.y += (objInstPosition[1] - objBoxPosition[1])
                    

                }

                // code is almost complete, maybe try working on only one instance first before all of them, makes it easier to understand
                // this angle will let you better determint eh coordinates
                // since you have the radius and the exact angle on the unit circle where the next instance should be, you can run a trig function, sin or cos, on both the x and y coords to designate where each instance should be
                // rotation will be another beast to figure out

                // console.log(xDiff);
                // console.log(radius);
            
                // console.log(angle);

                // function brainstorming
                /* 
                    
                */
            };
        }
    }
};

figma.on('close', () => {
    const cursors = figma.root.findAll(node => node.type === 'GROUP' && node.name === preferredName); // on the off chance someone has multiple cursors on screen accidentally
    if (cursors) {
        for (var cursorDup of cursors) {
            cursorDup.remove();
        }
    }
});