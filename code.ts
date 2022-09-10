/**
 * This plugin will create tints of a chose color
 * The elements will be placed in a frame with auto layout
 * The UI will allow the users to pick the original color, give the color a name, how many tints to generate, the distances between copies, the dimensions of a copy and the frame orientation.
 */

// Show the plugin UI
const SUCCESS_MESSAGE: string = `Tints generated successfully!`;
const options: ShowUIOptions = {
  width: 320,
  height: 640,
  title: 'Color Tint Generator',
};
figma.showUI(__html__, options);
// figma.closePlugin();
figma.ui.onmessage = (msg) => {
  switch (msg.type) {
    case 'GENERATE':
      generateTints(msg.payload);
      break;
    case 'CANCEL':
      closePlugin(`Operation canceled`);
      break;
    default:
      closePlugin(
        `Something went wrong. The action '${msg.type}' is not supported`
      );
      break;
  }
};

const generateTints = (payload: any): void => {
  const {
    circleSize,
    circleSpacing,
    colorCode,
    colorName,
    frameDirection,
    tintNumber,
  } = payload;

  // Create parentFrame and name it
  const parentFrame = figma.createFrame();
  parentFrame.name = `Tints for the ${colorName}`;

  // Add auto layout to the frame and set the direction, padding, spacing and the sizing mode
  parentFrame.layoutMode = frameDirection.toUpperCase();

  parentFrame.paddingBottom = 64;
  parentFrame.paddingRight = 64;
  parentFrame.paddingTop = 64;
  parentFrame.paddingLeft = 64;

  parentFrame.itemSpacing = parseInt(circleSpacing);

  parentFrame.primaryAxisSizingMode = 'AUTO';
  parentFrame.counterAxisSizingMode = 'AUTO';
  // Generate tints as rectangles
  for (let i = 0; i < tintNumber; i++) {
    const tintNode = figma.createEllipse();
    // Name of the layer
    tintNode.name = `${colorName.toLowerCase()}-${100 - i * 10}`;
    // Size of the layer
    tintNode.resize(parseInt(circleSize), parseInt(circleSize));
    // Color of the layer
    const { r: colorR, g: colorG, b: colorB } = hexToRgb(colorCode)!;
    tintNode.fills = [
      {
        type: 'SOLID',
        color: { r: colorR / 255, g: colorG / 255, b: colorB / 255 },
      },
    ];
    // Set layer opacity
    tintNode.opacity = (100 - i * 10) / 100;

    // Add generated nodes to the parent frame
    parentFrame.appendChild(tintNode);

    // Select and zoom to the generated frame
    const selectedFrame: FrameNode[] = [];
    selectedFrame.push(parentFrame);

    figma.currentPage.selection = selectedFrame;
    figma.viewport.scrollAndZoomIntoView(selectedFrame);
  }
  closePlugin(SUCCESS_MESSAGE);
};
const closePlugin = (message: string = ''): void => {
  figma.closePlugin(message);
};
const hexToRgb = (
  hex: string
): { r: number; g: number; b: number } | undefined => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : undefined;
};
