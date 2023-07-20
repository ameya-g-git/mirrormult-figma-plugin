// This shows the HTML page in "ui.html".
figma.showUI(__html__);

figma.ui.resize(400, 500);

const selectedObjects = [figma.currentPage.selection];
const selectionRef = figma.currentPage.selection;

figma.ui.postMessage({mirrorObj: selectionRef})

figma.currentPage.selection = [];

figma.ui.onmessage = async(pluginMessage) => {

};