import { getMap } from './presets.js';

"use strict";

let canvas = document.getElementById("map");
canvas.width = (256 + 16); //window.innerWidth;
canvas.height = 224; //window.innerHeight;
let ctx = canvas.getContext("2d");

ctx.imageSmoothingEnabled = false;

canvas.style.width = "816px";

let blocks = document.getElementById("blocks");
let base = document.getElementById("base");

const TILE_SZ = 8;  // in px
const BLCK_SZ = 16; // in px
const FILD_SZ = 13; // in tiles

let curBlockIndex = 5;

let field = new Array(FILD_SZ * FILD_SZ + 1).fill(0);
let fieldOffset = { x: 4 * TILE_SZ, y: 1 * TILE_SZ };

ctx.fillStyle = "#747474";
ctx.fillRect(2 * TILE_SZ, 0, 256, 224);
ctx.fillStyle = "#000000";
ctx.fillRect(fieldOffset.x, fieldOffset.y, FILD_SZ * BLCK_SZ, FILD_SZ * BLCK_SZ);
drawStatic(ctx);

function mdToArray(str) {
  for (let i = 0; i < field.length && i < str.length; i++) {
    field[i] = parseInt(str[i ^ 1], 16);
  }
}

function nesToArray(str) {
  for (let i = 0, index = 0; i < FILD_SZ * FILD_SZ && index < str.length; i++, index++) {
    if (i%FILD_SZ == 0 && i != 0) {
      index++;
    }
    field[i] = (parseInt(str[index], 16) + 1) % 14;
  }
}

function arrayToMd(isCode) {
  let newStr = "";
  for (let i = 0; i < field.length; i++) {
    newStr = newStr.concat(field[i ^ 1].toString(16));
  }
  if (isCode)
    newStr = newStr.replace(/([0-9a-f]{2})/gi, '0x$1, ');
  return newStr;
}

function arrayToNes(isCode) {
  let newStr = "";
  for (let i = 0; i < FILD_SZ * FILD_SZ; i++) {
    let blockIndex = field[i] - 1;
    if (blockIndex == -1) {
      blockIndex = 14 - 1;
    }
    if (i%FILD_SZ == 0 && i != 0) {
      newStr += "d";
    }
    newStr = newStr.concat(blockIndex.toString(16));
  }
  newStr += "d";
  if (isCode)
    newStr = newStr.replace(/([0-9a-f]{2})/gi, '0x$1, ');
  return newStr;
}

function getFieldPos(posx, posy) {
  let x = posx - fieldOffset.x;
  let y = posy - fieldOffset.y;
  let ix = Math.floor(x / BLCK_SZ);
  let iy = Math.floor(y / BLCK_SZ);
  let ifield = iy * FILD_SZ + ix;
  return { x, y, ix, iy, ifield };
}

function inField(pos) {
  return (pos.x > 0 && pos.y > 0
    && pos.x < FILD_SZ * BLCK_SZ && pos.y < FILD_SZ * BLCK_SZ);
}

function inBase(pos) {
  return pos.ix >= 5 && pos.ix <= 7 && pos.iy >= FILD_SZ - 2;
}

function drawSelectRect(ctx, ifield) {
  ctx.beginPath();
  ctx.lineWidth = 1;
  ctx.strokeStyle = "red";
  ctx.rect((ifield%FILD_SZ) * BLCK_SZ + fieldOffset.x + 0.5, Math.floor(ifield/FILD_SZ) * BLCK_SZ + fieldOffset.y + 0.5, BLCK_SZ - 1, BLCK_SZ - 1);
  ctx.stroke();
}

function drawBlock(ctx, x, y, index) {
  const b = [
    0,0,0,0, // Blank
    0,1,0,1, 0,0,1,1, 1,0,1,0, 1,1,0,0, 1,1,1,1, // Brick
    0,2,0,2, 0,0,2,2, 2,0,2,0, 2,2,0,0, 2,2,2,2, // Bulletproof
    3,3,3,3, // River
    4,4,4,4, // Woods
    5,5,5,5, // Ice
  ];
  if (index >= 14)
    index = 0;
  index *= 4;
  let s = TILE_SZ;
  ctx.drawImage(blocks, b[index+0]*s, 0, s, s, x  , y  , s, s);
  ctx.drawImage(blocks, b[index+1]*s, 0, s, s, x+s, y  , s, s);
  ctx.drawImage(blocks, b[index+2]*s, 0, s, s, x  , y+s, s, s);
  ctx.drawImage(blocks, b[index+3]*s, 0, s, s, x+s, y+s, s, s);
}
function drawBlockArray(ctx, ix, iy, index) {
  field[iy * FILD_SZ + ix] = index;
  drawBlock(ctx, ix * BLCK_SZ + fieldOffset.x,
                 iy * BLCK_SZ + fieldOffset.y, index);
}
function drawStatic(ctx) {
  drawBlockArray(ctx, 5, 12, 1);
  drawBlockArray(ctx, 6, 11, 2);
  drawBlockArray(ctx, 7, 12, 3);

  drawBlockArray(ctx, 5, 11, 0);
  drawBlockArray(ctx, 7, 11, 0);
  ctx.drawImage(blocks, 1*TILE_SZ, 0, TILE_SZ, TILE_SZ, 11 * TILE_SZ + fieldOffset.x, 23 * TILE_SZ + fieldOffset.y, TILE_SZ, TILE_SZ);
  ctx.drawImage(blocks, 1*TILE_SZ, 0, TILE_SZ, TILE_SZ, 14 * TILE_SZ + fieldOffset.x, 23 * TILE_SZ + fieldOffset.y, TILE_SZ, TILE_SZ);

  ctx.drawImage(base, 0, 0, BLCK_SZ, BLCK_SZ, 6 * BLCK_SZ + fieldOffset.x, 12 * BLCK_SZ + fieldOffset.y, BLCK_SZ, BLCK_SZ);

  for (let i = 0; i < 14; i++) {
    drawBlock(ctx, 0, BLCK_SZ * i, i);

    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#DDDDDD";
    ctx.moveTo(0, 1/2 + BLCK_SZ * i);
    ctx.lineTo(BLCK_SZ, 1/2 + BLCK_SZ * i);
    ctx.stroke();
  }

  ctx.beginPath();
  ctx.lineWidth = 1;
  ctx.strokeStyle = "red";
  ctx.rect(0.5, curBlockIndex * BLCK_SZ + 0.5, BLCK_SZ - 1, BLCK_SZ - 1);
  ctx.stroke();
}

let hexdata = document.getElementById("hexdata");
let hexdataMD = document.getElementById("hexdataMD");
let ccode = document.getElementById("ccode");

let rom = {
  isLoaded: false,
  arr: new Uint8Array(),
  curOffset: -1,
  offset1: 0,
  offset2: 0,
  name: "",
};

function updateHexdata() {
  hexdata.value = arrayToNes(ccode.checked);
  hexdataMD.value = arrayToMd(ccode.checked);
  if (rom.isLoaded && rom.curOffset != -1) {
    arrayToRom(rom.curOffset, rom.arr);
  }
}

function drawField() {
  for (let i = 0; i < FILD_SZ * FILD_SZ; i++) {
    drawBlockArray(ctx, (i%FILD_SZ), Math.floor(i/FILD_SZ), field[i]);
  }
  drawStatic(ctx); // Для блоков базы
  updateHexdata();
}

ccode.addEventListener("change", function(e) {
  updateHexdata();
});

hexdata.addEventListener("input", function(e) {
  hexdata.value = hexdata.value.toLowerCase().replace(/0x/gi, '').replace(/[^0-9a-f]/gi, '');
  if (hexdata.value.length % 2 == 1)
    hexdata.value += "d"

  field.fill(0);
  nesToArray(hexdata.value);
  drawField();
});

hexdataMD.addEventListener("input", function(e) {
  hexdataMD.value = hexdataMD.value.toLowerCase().replace(/0x/gi, '').replace(/[^0-9a-f]/gi, '');
  if (hexdataMD.value.length % 2 == 1)
    hexdataMD.value = hexdataMD.value.slice(0, -1) + "0" + hexdataMD.value.slice(-1)

  field.fill(0);
  mdToArray(hexdataMD.value);
  drawField();
});

let selFieldIndex = -1;
let hoverFieldIndex = -1;

canvas.addEventListener("mousedown", function(e) {
  if (e.which != 1) return;

  let p = getMousePos(canvas, e);
  let pos = getFieldPos(p.x, p.y);

  if (p.x < BLCK_SZ && p.y < BLCK_SZ * 14) {
    curBlockIndex = Math.floor(p.y / BLCK_SZ);
    drawStatic(ctx); // Для выбора блоков
    return;
  }

  if (inField(pos) && !inBase(pos)) {
    drawBlockArray(ctx, pos.ix, pos.iy, curBlockIndex);
    updateHexdata();
    drawSelectRect(ctx, pos.ifield);
  }

  selFieldIndex = pos.ifield;
});

canvas.addEventListener("mousemove", function(e) {
  let p = getMousePos(canvas, e);
  let pos = getFieldPos(p.x, p.y);

  if (selFieldIndex != -1 && selFieldIndex != pos.ifield) {
    selFieldIndex = pos.ifield;
    if (inField(pos) && !inBase(pos)) {
      drawBlockArray(ctx, pos.ix, pos.iy, curBlockIndex);
      updateHexdata();
    }
  }

  if (inField(pos) && !inBase(pos)) {
    if (hoverFieldIndex != pos.ifield) {
      drawBlockArray(ctx, hoverFieldIndex%FILD_SZ, Math.floor(hoverFieldIndex/FILD_SZ), field[hoverFieldIndex]);
      drawSelectRect(ctx, pos.ifield);
      hoverFieldIndex = pos.ifield;
    }
  }
});

let mouseUp = (e) => {
  selFieldIndex = -1;
};
canvas.addEventListener("mouseup", mouseUp);
canvas.addEventListener("mouseout", mouseUp);

let increasecanvas = document.getElementById("increasecanvas");
increasecanvas.addEventListener('click', function() {
  let width = parseInt(canvas.style.width) + 272;
  canvas.style.width = width.toString() + 'px';
});

let decreasecanvas = document.getElementById("decreasecanvas");
decreasecanvas.addEventListener('click', function() {
  let width = parseInt(canvas.style.width);
  if (width >= 272 * 2) {
    width -= 272;
  }
  canvas.style.width = width.toString() + 'px';
});

// let resize = (e) => {
//   if (window.innerWidth < window.innerHeight) {
//     canvas.style.width = (Math.floor(window.innerWidth/272)*272).toString() + "px";
//     canvas.style.height = "";
//   }
//   else {
//     canvas.style.height = (Math.floor(window.innerHeight/224)*224).toString() + "px";
//     canvas.style.width = "";
//   }
// };
// window.addEventListener('resize', resize);
// window.addEventListener('load', resize);


let presets = document.getElementById("presets");
for (let i = 0; i < 36; i++) {
  let option = new Option("Battle City - " + i.toString());
  presets.appendChild(option);
}
for (let i = 0; i < 105; i++) {
  let option = new Option("Tank 1990.2 - " + i.toString());
  presets.appendChild(option);
}
let option = new Option("Tank 1990.2 - 1 diff");
presets.appendChild(option);

presets.addEventListener("change", function(e) {
  nesToArray(getMap(e.target.selectedIndex));
  drawField();
});

//
// ROM editing
//

function romToArray(offset, arr) {
  for (let i = 0; i < field.length; i++) {
    let value = arr[offset + Math.floor(i/2)];
    if (i & 1) {
      value >>= 4;
    }
    else {
      value &= 0xF;
    }
    field[i] = value;
  }
}

function arrayToRom(offset, arr) {
  for (let i = 0; i < Math.floor(field.length/2); i++) {
    arr[offset + i] = field[i * 2] | (field[i * 2 + 1] << 4);
  }
}

function findRomOffset(arr, start) {
  // maps_data.c
  const battleCityPreLevel0 = [
    0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
    0x00,0x00,0x00,0x00,0x00,0x48,0x49,0x2D,0x53,0x43,0x4F,0x52,0x45,0x00,0x00,0x00,0x32,0x30,0x30,0x30,0x30,0x00,0x00,0x00,0x00,0x00,
    0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
    0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x53,0x54,0x41,0x47,0x45,0x00,0x00,0x31,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
    0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
    0x5E,0x2D,0x50,0x4C,0x41,0x59,0x45,0x52,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x5F,0x2D,0x50,0x4C,0x41,0x59,0x45,0x52,
    0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
    0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
    0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
    0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
    0x00,0x00,0x00,0x00,0x00,0x50,0x54,0x53,0x00,0x00,0x00,0x5B,0x00,0x00,0x5D,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x50,0x54,0x53,
    0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
    0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
    0x00,0x00,0x00,0x00,0x00,0x50,0x54,0x53,0x00,0x00,0x00,0x5B,0x00,0x00,0x5D,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x50,0x54,0x53,
    0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
    0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
    0x00,0x00,0x00,0x00,0x00,0x50,0x54,0x53,0x00,0x00,0x00,0x5B,0x00,0x00,0x5D,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x50,0x54,0x53,
    0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
    0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
    0x00,0x00,0x00,0x00,0x00,0x50,0x54,0x53,0x00,0x00,0x00,0x5B,0x00,0x00,0x5D,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x50,0x54,0x53,
    0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x5C,0x5C,0x5C,0x5C,0x5C,0x5C,0x5C,0x5C,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
    0x00,0x00,0x00,0x54,0x4F,0x54,0x41,0x4C,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
    0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
    0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
    0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
    0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
  ];
  for (let i = start; i < arr.length - battleCityPreLevel0.length; i++) {
    let j = 0;
    for (j = i; j < i + battleCityPreLevel0.length; j++) {
      if (arr[j] != battleCityPreLevel0[j - i]) {
        break;
      }
    }
    if (j - i == battleCityPreLevel0.length) {
      return j;
    }
  }
  return -1;
}

let tempField = new Array(field.length).fill(0);

let yourmaps = document.getElementById("yourmaps");
yourmaps.addEventListener("change", function(e) {
  let sel = e.target.selectedIndex;
  if (sel == 0) {
    if (rom.curOffset != -1) {
      field = tempField.slice();
      rom.curOffset = -1;
    }
  }
  else {
    if (rom.curOffset == -1) {
      tempField = field.slice();
    }

    sel--;
    if (sel < 35) {
      rom.curOffset = rom.offset1 + sel * 85;
    }
    else {
      rom.curOffset = rom.offset2 + (sel - 35) * 85;
    }
    romToArray(rom.curOffset, rom.arr);
  }
  drawField();
});

let inputElement = document.getElementById("input");
inputElement.addEventListener("change", handleFiles);
function handleFiles() {
  let file = this.files[0];
  let reader = new FileReader();
  reader.onload = function(event) {
    rom.arr = new Uint8Array(event.target.result);
    rom.name = file.name;
    rom.offset1 = findRomOffset(rom.arr, 0);
    rom.offset2 = findRomOffset(rom.arr, rom.offset1);

    if (!rom.isLoaded) {
      rom.isLoaded = true;
      for (let i = 0; i < 35; i++) {
        let option = new Option("ROM: Set 1 - " + i.toString());
        yourmaps.appendChild(option);
      }
      for (let i = 0; i < 35; i++) {
        let option = new Option("ROM: Set 2 - " + i.toString());
        yourmaps.appendChild(option);
      }
    }
    // Bad ROM
    if (rom.offset1 == -1 || rom.offset2 == -1) {
      rom.isLoaded = false;
      for (let i = 0; i < 35 + 35; i++)
        yourmaps.removeChild(yourmaps.lastChild);
    }

    yourmaps.selectedIndex = -1; // Reset to Default
    if (rom.curOffset != -1) {
      rom.curOffset = -1;
      field = tempField.slice();
      drawField();
    }
  };
  reader.readAsArrayBuffer(file);
}

let saveRomElement = document.getElementById("saverom");
saveRomElement.addEventListener("click", function () {
  if (rom.isLoaded) {
    saveFile(rom.name);
  }
});

function saveFile(fileName) {
  saveAs(new Blob([rom.arr], {type: 'application/octet-stream'}), fileName);
}

// https://stackoverflow.com/q/23451726
function saveAs(blob, fileName) {
  var url = window.URL.createObjectURL(blob);
  var anchorElem = document.createElement("a");
  anchorElem.style = "display: none";
  anchorElem.href = url;
  anchorElem.download = fileName;
  document.body.appendChild(anchorElem);
  anchorElem.click();
  document.body.removeChild(anchorElem);
  // On Edge, revokeObjectURL should be called only after
  // a.click() has completed, atleast on EdgeHTML 15.15048
  setTimeout(function() {
    window.URL.revokeObjectURL(url);
  }, 1000);
}

function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect(), // abs. size of element
      scaleX = canvas.width / rect.width,    // relationship bitmap vs. element for X
      scaleY = canvas.height / rect.height;  // relationship bitmap vs. element for Y

  return {
    x: (evt.clientX - rect.left) * scaleX,   // scale mouse coordinates after they have
    y: (evt.clientY - rect.top) * scaleY     // been adjusted to be relative to element
  }
}