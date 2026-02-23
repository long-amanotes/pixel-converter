/* ================= CONFIG & STATE ================= */

// Configuration
let SIZE = 64;
const ALPHA_CUTOFF = 10;
let ZOOM_SCALE = 10;
const MAX_UNDO = 50;

// Canvas
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

// State
let pixels = [];
let palette = [];
let groups = [];
let activeColorGroup = -1;
let selectedPixels = new Set();
let undoStack = [];

let dataGroups = [{ id: 0, name: 'None' }];
let activeDataGroupId = 0;

let colorTypeGroups = [];
let activeColorTypeId = 0;

let originalImage = null;

// Drag state
let isDragging = false;
let dragStart = null;
let dragEnd = null;

// Preset palette
const PRESET = [
    '#FFFFFF', '#000000', '#FFD700', '#00C853',
    '#2196F3', '#F48FB1', '#E53935', '#8E24AA', '#FB8C00'
];

// Common colors for quick selection
const commonColors = [
    '#FFFFFF', '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00',
    '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#008000', '#FFC0CB',
    '#FFD700', '#C0C0C0', '#808080', '#A52A2A', '#FF6347', '#4169E1'
];
