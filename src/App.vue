<script setup lang="ts">
import { onMounted, onUnmounted, ref, useTemplateRef } from "vue";
import { useMouseInElement } from "@vueuse/core";

import { usePaintStore } from "@/store/index";
import { Tools } from "@/utils/constants";
import type { Tool as ITool, Position } from "@/utils/types";

import { Move, Maximize } from "lucide-vue-next";

import Appbar from "./components/Appbar.vue";

const paintStore = usePaintStore();

const canvasDimension = ref({
  width: 0,
  height: 0,
});
const canvasContainerRef = useTemplateRef("canvasContainerRef");
const canvasRef = useTemplateRef("canvasRef");

let dpr = Math.max(window.devicePixelRatio || 1, 1);
let ctx: CanvasRenderingContext2D | null = null;

const { elementX, elementY, isOutside } = useMouseInElement(canvasRef, {
  handleOutside: false,
});

onMounted(() => {
  resizeCanvas();

  window.addEventListener("resize", resizeCanvas);
});

onUnmounted(() => {
  window.removeEventListener("resize", resizeCanvas);
});

function getCanvasContext() {
  if (!ctx && canvasRef.value) {
    ctx = canvasRef.value.getContext("2d", { willReadFrequently: true });
  }

  return ctx;
}

function resizeCanvas() {
  if (!canvasContainerRef.value || !canvasRef.value) {
    return;
  }

  const rect = canvasContainerRef.value.getBoundingClientRect();

  const cssW = Math.floor(rect.width);
  const cssH = Math.floor(rect.height);

  dpr = Math.max(window.devicePixelRatio || 1, 1);

  canvasRef.value.style.width = cssW + "px";
  canvasRef.value.style.height = cssH + "px";
  canvasRef.value.width = Math.floor(cssW * dpr);
  canvasRef.value.height = Math.floor(cssH * dpr);

  canvasDimension.value = {
    width: canvasRef.value.width,
    height: canvasRef.value.height,
  };

  const ctx = getCanvasContext();

  if (!ctx) return;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvasRef.value.width, canvasRef.value.height);
  ctx.restore();
}

function getCanvasPointer(e: PointerEvent) {
  if (!canvasRef.value) {
    return {
      desktop: { x: 0, y: 0 },
      mobile: { x: 0, y: 0 },
    };
  }

  const rect = canvasRef.value.getBoundingClientRect();

  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  /*
    Use CSS pixels for drawing (because the canvas context is scaled).
    Use device pixels for pixel-level operations (like flood fill).
    This prevents misalignment and ensures your app works on all screens.
  */
  return {
    desktop: { x, y },
    mobile: { x: x * dpr, y: y * dpr },
  };
}

function onPointerDown(e: PointerEvent) {
  if (paintStore.tool.name === "") {
    return;
  }

  const currentPos = getCanvasPointer(e);

  if (!canvasRef.value) {
    return;
  }

  canvasRef.value.setPointerCapture(e.pointerId);

  if (paintStore.tool.name === Tools.FILL) {
    floodFill(currentPos.mobile, paintStore.tool.color);
    return;
  }

  paintStore.tool.drawing = true;
  paintStore.tool.lastPos = currentPos.desktop;

  if (
    paintStore.tool.name === Tools.LINE ||
    paintStore.tool.name === Tools.RECTANGLE ||
    paintStore.tool.name === Tools.TRIANGLE ||
    paintStore.tool.name === Tools.CIRCLE ||
    paintStore.tool.name === Tools.DIAMOND ||
    paintStore.tool.name === Tools.PARALLELOGRAM ||
    paintStore.tool.name === Tools.HEXAGON ||
    paintStore.tool.name === Tools.HEART ||
    paintStore.tool.name === Tools.STAR
  ) {
    const ctx = getCanvasContext();

    if (!ctx) {
      return;
    }

    paintStore.tool.shapeStart = currentPos.desktop;
    paintStore.tool.snapshot = ctx.getImageData(
      0,
      0,
      canvasRef.value.width,
      canvasRef.value.height,
    );
  }
}

function onPointerMove(e: PointerEvent) {
  if (!paintStore.tool.drawing) {
    return;
  }

  if (paintStore.tool.name === Tools.BRUSH) {
    paintStore.tool.size = paintStore.brushSize;
  } else if (paintStore.tool.name === Tools.PENCIL) {
    paintStore.tool.size = paintStore.pencilSize;
  } else if (paintStore.tool.name === Tools.ERASER) {
    paintStore.tool.size = paintStore.eraserSize;
  }

  const { desktop: currentPos } = getCanvasPointer(e);

  drawOnCanvas(paintStore.tool.lastPos, currentPos, paintStore.tool);

  paintStore.tool.lastPos = currentPos;

  if (
    paintStore.tool.name === Tools.LINE ||
    paintStore.tool.name === Tools.RECTANGLE ||
    paintStore.tool.name === Tools.TRIANGLE ||
    paintStore.tool.name === Tools.CIRCLE ||
    paintStore.tool.name === Tools.DIAMOND ||
    paintStore.tool.name === Tools.PARALLELOGRAM ||
    paintStore.tool.name === Tools.HEXAGON ||
    paintStore.tool.name === Tools.HEART ||
    paintStore.tool.name === Tools.STAR
  ) {
    const ctx = getCanvasContext();

    if (
      !ctx ||
      !canvasRef.value ||
      !paintStore.tool.snapshot ||
      !paintStore.tool.shapeStart
    ) {
      return;
    }

    paintStore.tool.size = paintStore.shapeSize;

    ctx.putImageData(paintStore.tool.snapshot, 0, 0);
    ctx.strokeStyle = paintStore.tool.color;
    ctx.lineWidth = paintStore.shapeSize;

    if (paintStore.tool.name === Tools.LINE) {
      ctx.beginPath();
      ctx.moveTo(paintStore.tool.shapeStart.x, paintStore.tool.shapeStart.y);
      ctx.lineTo(currentPos.x, currentPos.y);
      ctx.stroke();
    } else if (paintStore.tool.name === Tools.RECTANGLE) {
      const w = currentPos.x - paintStore.tool.shapeStart.x;
      const h = currentPos.y - paintStore.tool.shapeStart.y;
      ctx.strokeRect(
        paintStore.tool.shapeStart.x,
        paintStore.tool.shapeStart.y,
        w,
        h,
      );
    } else if (paintStore.tool.name === Tools.TRIANGLE) {
      const x1 = paintStore.tool.shapeStart.x;
      const y1 = paintStore.tool.shapeStart.y;
      const x2 = currentPos.x;
      const y2 = currentPos.y;

      ctx.beginPath();
      ctx.moveTo((x1 + x2) / 2, y1);
      ctx.lineTo(x2, y2);
      ctx.lineTo(x1, y2);
      ctx.closePath();
      ctx.stroke();
    } else if (paintStore.tool.name === Tools.CIRCLE) {
      const x = Math.min(paintStore.tool.shapeStart.x, currentPos.x);
      const y = Math.min(paintStore.tool.shapeStart.y, currentPos.y);
      const w = Math.abs(currentPos.x - paintStore.tool.shapeStart.x);
      const h = Math.abs(currentPos.y - paintStore.tool.shapeStart.y);

      ctx.beginPath();
      ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else if (paintStore.tool.name === Tools.DIAMOND) {
      const x1 = paintStore.tool.shapeStart.x;
      const y1 = paintStore.tool.shapeStart.y;
      const x2 = currentPos.x;
      const y2 = currentPos.y;

      const cx = (x1 + x2) / 2;
      const cy = (y1 + y2) / 2;

      ctx.beginPath();
      ctx.moveTo(cx, y1);
      ctx.lineTo(x2, cy);
      ctx.lineTo(cx, y2);
      ctx.lineTo(x1, cy);
      ctx.closePath();
      ctx.stroke();
    } else if (paintStore.tool.name === Tools.PARALLELOGRAM) {
      const x1 = paintStore.tool.shapeStart.x;
      const y1 = paintStore.tool.shapeStart.y;
      const x2 = currentPos.x;
      const y2 = currentPos.y;

      const offset = Math.abs(x2 - x1) / 4;

      ctx.beginPath();
      ctx.moveTo(x1 + offset, y1);
      ctx.lineTo(x2 + offset, y1);
      ctx.lineTo(x2 - offset, y2);
      ctx.lineTo(x1 - offset, y2);
      ctx.closePath();
      ctx.stroke();
    } else if (paintStore.tool.name === Tools.HEXAGON) {
      const x1 = paintStore.tool.shapeStart.x;
      const y1 = paintStore.tool.shapeStart.y;
      const x2 = currentPos.x;
      const y2 = currentPos.y;

      const cx = (x1 + x2) / 2;
      const cy = (y1 + y2) / 2;
      const rx = Math.abs(x2 - x1) / 2;
      const ry = Math.abs(y2 - y1) / 2;
      const r = Math.min(rx, ry);

      ctx.beginPath();

      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 6;
        const px = cx + r * Math.cos(angle);
        const py = cy + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }

      ctx.closePath();
      ctx.stroke();
    } else if (paintStore.tool.name === Tools.HEART) {
      const x1 = paintStore.tool.shapeStart.x;
      const y1 = paintStore.tool.shapeStart.y;
      const x2 = currentPos.x;
      const y2 = currentPos.y;

      const w = Math.abs(x2 - x1);
      const h = Math.abs(y2 - y1);
      const cx = (x1 + x2) / 2;
      const cy = (y1 + y2) / 2;

      ctx.beginPath();
      ctx.moveTo(cx, cy + h / 4);
      ctx.bezierCurveTo(
        cx + w / 2,
        cy - h / 4,
        cx + w / 2,
        cy + h / 1.5,
        cx,
        cy + h,
      );
      ctx.bezierCurveTo(
        cx - w / 2,
        cy + h / 1.5,
        cx - w / 2,
        cy - h / 4,
        cx,
        cy + h / 4,
      );
      ctx.closePath();
      ctx.stroke();
    } else if (paintStore.tool.name === Tools.STAR) {
      const x1 = paintStore.tool.shapeStart.x;
      const y1 = paintStore.tool.shapeStart.y;
      const x2 = currentPos.x;
      const y2 = currentPos.y;

      const cx = (x1 + x2) / 2;
      const cy = (y1 + y2) / 2;
      const rx = Math.abs(x2 - x1) / 2;
      const ry = Math.abs(y2 - y1) / 2;
      const r = Math.min(rx, ry);

      const spikes = 5;
      const outerRadius = r;
      const innerRadius = r / 2;

      ctx.beginPath();

      for (let i = 0; i < spikes * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = (Math.PI / spikes) * i - Math.PI / 2;
        const px = cx + radius * Math.cos(angle);
        const py = cy + radius * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
    }
  }
}

function onPointerUp() {
  paintStore.tool.drawing = false;
}

function drawOnCanvas(from: Position, to: Position, tool: ITool) {
  const ctx = getCanvasContext();

  if (!ctx) {
    return;
  }

  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  ctx.globalCompositeOperation =
    tool.name === Tools.ERASER ? "destination-out" : "source-over";

  ctx.strokeStyle = tool.color;
  ctx.lineWidth = tool.size;

  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();
}

function floodFill(startPos: Position, fillColor: string) {
  const ctx = getCanvasContext();

  if (!ctx || !canvasRef.value) {
    return;
  }

  const imageData = ctx.getImageData(
    0,
    0,
    canvasRef.value.width,
    canvasRef.value.height,
  );
  const data = imageData.data;

  const width = imageData.width;
  const height = imageData.height;

  const stack: Position[] = [startPos];

  const startIdx =
    (Math.floor(startPos.y) * width + Math.floor(startPos.x)) * 4;

  const targetColor = [
    data[startIdx],
    data[startIdx + 1],
    data[startIdx + 2],
    data[startIdx + 3],
  ];

  const fillR = parseInt(fillColor.slice(1, 3), 16);
  const fillG = parseInt(fillColor.slice(3, 5), 16);
  const fillB = parseInt(fillColor.slice(5, 7), 16);
  const fillA = 255;

  if (
    targetColor[0] === fillR &&
    targetColor[1] === fillG &&
    targetColor[2] === fillB &&
    targetColor[3] === fillA
  ) {
    return; // already same color
  }

  function matchColor(idx: number) {
    return (
      data[idx] === targetColor[0] &&
      data[idx + 1] === targetColor[1] &&
      data[idx + 2] === targetColor[2] &&
      data[idx + 3] === targetColor[3]
    );
  }

  function setColor(idx: number) {
    data[idx] = fillR;
    data[idx + 1] = fillG;
    data[idx + 2] = fillB;
    data[idx + 3] = fillA;
  }

  while (stack.length > 0) {
    const { x, y } = stack.pop()!;

    if (x < 0 || y < 0 || x >= width || y >= height) continue;

    let idx = (Math.floor(y) * width + Math.floor(x)) * 4;

    if (matchColor(idx)) {
      setColor(idx);

      stack.push({ x: x + 1, y });
      stack.push({ x: x - 1, y });
      stack.push({ x, y: y + 1 });
      stack.push({ x, y: y - 1 });
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

function clearCanvas() {
  const ctx = getCanvasContext();

  if (!ctx || !canvasRef.value) {
    return;
  }

  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvasRef.value.width, canvasRef.value.height);
  ctx.restore();
}

function saveImage() {
  if (!canvasRef.value) {
    return;
  }

  const exportCanvas = document.createElement("canvas");
  exportCanvas.width = canvasRef.value.width;
  exportCanvas.height = canvasRef.value.height;

  const ctx = exportCanvas.getContext("2d");

  if (!ctx) {
    return;
  }

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
  ctx.drawImage(canvasRef.value, 0, 0);

  const d = new Date();
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const date = d.getDate();
  const time = d.getTime();

  const link = document.createElement("a");
  link.download = `paint_app_${year}_${month}_${date}_${time}.png`;

  link.href = exportCanvas.toDataURL("image/png");
  link.click();
}
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <Appbar @reset="clearCanvas" @save="saveImage" />

    <main class="flex grow flex-col">
      <div ref="canvasContainerRef" class="grow">
        <canvas
          ref="canvasRef"
          class="touch-none border-y-4 border-gray-200"
          @pointerdown.prevent="onPointerDown"
          @pointermove.prevent="onPointerMove"
          @pointerup.prevent="onPointerUp"
          @pointerleave.prevent="onPointerUp"
          @pointercancel.prevent="onPointerUp"
        ></canvas>
      </div>
    </main>

    <footer class="flex items-center justify-between bg-gray-100 p-2 text-xs">
      <div>
        <div class="flex items-center gap-x-1" v-show="!isOutside">
          <Move :size="16" />
          {{ elementX.toFixed() }}, {{ elementY.toFixed() }}px
        </div>
      </div>

      <div class="flex items-center gap-x-1">
        <Maximize :size="16" />
        {{ canvasDimension.width }} x {{ canvasDimension.height }} px
      </div>
    </footer>
  </div>
</template>
