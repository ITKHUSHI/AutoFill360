// Auto-word-wrap text for pdf-lib
function drawWrappedAmount(page, text, x, y, maxWidth, font, fontSize, lineHeight = fontSize + 2, color) {
  const words = text.split(" ");
  let line = "";
  let currentY = y;
  let currentX=x;

  words.forEach((word) => {
    const testLine = line + word + " ";
    const textWidth = font.widthOfTextAtSize(testLine, fontSize);

    if (textWidth > maxWidth) {
      // Draw previous line
      page.drawText(line.trim(), {
        x:currentX,
        y: currentY,
        size: fontSize,
        font,
        color,
      });

      // Move to new line
      line = word + " ";
      currentY -= lineHeight; // shift downward
	  currentX-=290
    } else {
      line = testLine;
    }
  });

  // Draw the last line
  if (line.trim()) {
    page.drawText(line.trim(), {
      x:currentX,
      y: currentY,
      size: fontSize,
      font,
      color,
    });
  }

  return currentY; // returns last Y position if needed
}

function drawWrappedAddress(page, text, x, y, maxWidth, font, fontSize, lineHeight = fontSize + 4, color) {
  const words = text.split(" ");
  let line = "";
  let currentY = y;
  let currentX=x;

  words.forEach((word) => {
    const testLine = line + word + " ";
    const textWidth = font.widthOfTextAtSize(testLine, fontSize);

    if (textWidth > maxWidth) {
      // Draw previous line
      page.drawText(line.trim(), {
        x:currentX,
        y: currentY,
        size: fontSize,
        font,
        color,
      });

      // Move to new line
      line = word + " ";
      currentY -= lineHeight+5; // shift downward
	  currentX-=130
    maxWidth+=120
    } else {
      line = testLine;
    }
  });

  // Draw the last line
  if (line.trim()) {
    page.drawText(line.trim(), {
      x:currentX,
      y: currentY,
      size: fontSize,
      font,
      color,
    });
  }

  return currentY; // returns last Y position if needed
}
function drawWrappedEAddress(page, text, x, y, maxWidth, font, fontSize, lineHeight = fontSize + 4, color) {
  const words = text.split(" ");
  let line = "";
  let currentY = y;
  let currentX=x;

  words.forEach((word) => {
    const testLine = line + word + " ";
    const textWidth = font.widthOfTextAtSize(testLine, fontSize);

    if (textWidth > maxWidth) {
      // Draw previous line
      page.drawText(line.trim(), {
        x:currentX,
        y: currentY,
        size: fontSize,
        font,
        color,
      });

      // Move to new line
      line = word + " ";
      currentY -= lineHeight+5; // shift downward
	  currentX-=10
    } else {
      line = testLine;
    }
  });

  // Draw the last line
  if (line.trim()) {
    page.drawText(line.trim(), {
      x:currentX,
      y: currentY,
      size: fontSize,
      font,
      color,
    });
  }

  return currentY; // returns last Y position if needed
}


export {drawWrappedAmount,drawWrappedAddress,drawWrappedEAddress}