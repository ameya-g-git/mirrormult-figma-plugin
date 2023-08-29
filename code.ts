// This shows the HTML page in "ui.html".
figma.showUI(__html__);

figma.ui.resize(400, 500);

const toolObjs = [figma.currentPage.selection][0]; // saves the objects for the plugin to mirror in a separate list for later

const toolObjNames = toolObjs.map(obj => obj.name); // maps items from a defined list and allows you to create a new list by taking properties of each item from that predefined list, woa!!!
figma.ui.postMessage({toolObjNames});

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

function TLtoC(obj) { // will take in a Rect object (or any object with x, y, width, and height) and return its coordinates from its center, rather than from its top left corner of its bounding box
    return ([obj.x + (obj.width / 2), obj.y + (obj.height / 2)])
}

function rotateFromCenter(obj, angle) {
    
    return [
        [cos(angle), -sin(angle), obj.x], // TODO: rotation for RotSymm needs to be fixed, since the object won't necessarily be rotated by increments of a 
        [sin(angle), cos(angle), obj.y]
    ];
}

// function below makes each toolObj's components have the same coordinates and scale as the original object
function componentify(obj) {
    const objComp = figma.createComponent()
    const objAngle = obj.rotation;
    objComp.name = obj.name;
    objComp.appendChild(obj);
    objComp.x = obj.x;
    objComp.y = obj.y;
    objComp.resize(obj.width, obj.height); // nEED TO CONVERT ALL CODE TO WORK WITH RELATIVE TRANSFORMS INSTEAD OF GLOBAL TRANSFORM :SOB:

    obj.relativeTransform = [ // places the source obj (from toolObjs) directly at where the component frame is
        [1, 0, 0],
        [0, 1, 0] // STILL NEED TO FIGURE OUT HOW THE DAMN ROTATION WORK
    ];

    objComp.relativeTransform = [
        [cos(objAngle), -sin(objAngle), objComp.x],
        [sin(objAngle), cos(objAngle), objComp.y]
    ];

    let objBoxPosition = TLtoC(objComp.absoluteBoundingBox)
    
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
    else if (msgFor === 3 || msgFor === 4) { // plugin functionality
        let objComp;
        let objInst;
        let origin;
        let originPosition = [0, 0];

        // mirrormult specific variables
       
        let mirrorList = []; // will hold all the reflected objects in their respective groups
        let groupList = []; // if toolObjs is greater than 1, this will hold all the group nodes to group altogether
        let mmGroup; // because figma doesnt let there be empty groups so i need a variable to hold the group

        // rotsymm specific variables
        const numCopies = pluginMessage.numCopies

        const cursorGroup = figma.root.findOne(node => node.type === 'GROUP' && node.name === preferredName);

        if (cursorGroup) {
            let cursorRelCoord = [cursorGroup.relativeTransform[0][2], cursorGroup.relativeTransform[1][2]];
            originPosition = [cursorRelCoord[0] + (cursorGroup.width / 2), cursorRelCoord[1] + (cursorGroup.height / 2)];
        }
        else {
            origin = figma.root.findOne(node => node.name === getSelectedObjName());
            originPosition = TLtoC(origin)
        }        


        if (msgFor === 3) { // mirrormult functionality
            const mirrorHori = pluginMessage.mirrorHori;
            const mirrorVert = pluginMessage.mirrorVert;

            // TODO: potential error when objects are rotated in MirrorMult, need to adjust matrices to fix this

            let parentTest = true; // holds true until one of the objects in toolObjs no longer shares the same parent as the rest
            let firstParent = toolObjs[0].parent;

            for (let obj of toolObjs) {
                console.log(obj.parent)
                if (obj.parent != firstParent) {
                    parentTest = false;
                    break;
                }
            }

            for (let obj of toolObjs) {
                let objAngle = obj.rotation;
                let objParent = obj.parent;
                let objRelX = obj.relativeTransform[0][2]; // holds the obj's relative x-coord to its parent
                let objRelY = obj.relativeTransform[1][2]; // holds the obj's relative x-coord to its parent

                console.log(objRelX, objRelY)

                if (mirrorHori || mirrorVert) {
                    if (mirrorHori) { // horizontal mirror
                        if (!objComp) { 
                            objComp = componentify(obj);
                            mirrorList.push(objComp)
                        };
                        objInst = objComp.createInstance();
                        objParent.appendChild(objInst)
                        
                        objInst.relativeTransform = [ // relative transform so that the instance is reflected, so that any adjustments to the source obj are horizontally reflected across the origin
                            [-1, 0, objRelX + ((-2) * (objRelY - originPosition[0]))],
                            [0, 1, objRelY] 
                        ];
                        //objInst.relativeTransform = rotateFromCenter(objInst, objAngle)

                        objInst.name = objComp.name + '-H'
                        mirrorList.push(objInst)
                    };
                    
                    if (mirrorVert) { // vertical mirror
                        if (!objComp) { 
                            objComp = componentify(obj);
                            mirrorList.push(objComp)
                        };
                        
                        objInst = objComp.createInstance();
                        
                        objInst.x = objComp.x;
                        objInst.y = objComp.y + (-2) * (objComp.y - originPosition[1]); // same calculations but for y coord
                        objInst.relativeTransform = [ // relative transform so that the instance is reflected, so that any adjustments to the source obj are vertically reflected across the origin
                            [1, 0, objRelX],
                            [0, -1, objInst.y] 
                        ];
                        
                        objInst.name = objComp.name + '-V'
                        mirrorList.push(objInst)
                    };

                    if (mirrorHori && mirrorVert) { // if both are selected, there's gonna need to be one more reflected object at the remaining corner
                        if (!objComp) { // unnecessary conditional, but to reduce errors im just gonna keep it lol
                            objComp = componentify(obj);
                        };
                        objInst = objComp.createInstance();
                        
                        objInst.x = objComp.x + (-2) * (objComp.x - originPosition[0]); // calculations but for both x and y!!!!!
                        objInst.y = objComp.y + (-2) * (objComp.y - originPosition[1]);
                        objInst.relativeTransform = [ // relative transform so that the instance is reflected, so that any adjustments to the source obj are diagonally reflected across the origin
                            [-1, 0, objRelX],
                            [0, -1, objInst.y]
                        ];
                        
                        objInst.name = objComp.name + '-HV'
                        mirrorList.push(objInst)
                    };

                    mmGroup = figma.group(mirrorList, firstParent);
                    mmGroup.name = '🪞 ' + obj.name; // just adds a mirror emoji + the name of the object involved in mirroring

                    if (toolObjs.length > 1) { // if more than 1 object is selected, then another parent group is needed to hold all the individual mirror groups involved in the process
                        groupList.push(mmGroup);
                    };

                    objComp = null; // resets objComp so the componentify functions work for the next obj in toolObjs
                    mirrorList = []; // resets mirrorList for next obj in toolObjs
                };
            };

            if (groupList) { // code below names the entire mirror group the names of the respective objects involved, if more than 3 objects are selected, the name just does the first 3 and adds elipses after
                if (parentTest) {
                    mmGroup = figma.group(groupList, firstParent);
                }
                else {
                    mmGroup = figma.group(groupList, figma.currentPage);
                }
                mmGroup.name = '🪞 ';
                for (let i = 0; i < toolObjs.length; i++) {
                    let obj = toolObjs[i];
                    mmGroup.name += obj.name + ', ';   
                    
                    if (i >= 3) { // more than 3 objects selected
                        mmGroup.name += '...';
                    }
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

                objComp = componentify(obj);
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
                    
                    objInst = objComp.createInstance();
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