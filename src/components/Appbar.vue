<script setup lang="ts">
import { ref, watch } from "vue";

import { usePaintStore } from "@/store/index";
import { Tools, Colors } from "@/utils/constants";

import {
  Star,
  Info,
  Minus,
  Heart,
  Pencil,
  Eraser,
  Circle,
  Diamond,
  Palette,
  Hexagon,
  Triangle,
  Download,
  RotateCcw,
  Paintbrush,
  PaintBucket,
  RectangleHorizontal,
} from "lucide-vue-next";

import Size from "./Size.vue";
import About from "./About.vue";

const emit = defineEmits(["reset", "save"]);

const paintStore = usePaintStore();

const selectedTool = ref(paintStore.tool.name);
const selectedColor = ref(paintStore.tool.color);
const colorList = ref(Colors);
const modal = ref(false);

watch(selectedColor, (color) => {
  paintStore.tool.color = color;
});

function handleToolSelection(toolName: string) {
  if (toolName === selectedTool.value) {
    selectedTool.value = "";
    paintStore.tool.name = "";
    return;
  } else if (toolName === Tools.RESET) {
    emit("reset");
    return;
  } else if (toolName === Tools.SAVE) {
    emit("save");
    return;
  }

  selectedTool.value = toolName;
  paintStore.tool.name = toolName;
}

function handleColorFromPicker(color: string) {
  selectedColor.value = color;
  paintStore.tool.color = color;
}

function openColorPicker() {
  const el = document.getElementById("color-picker");
  el?.click();
}
</script>

<template>
  <Teleport to="body">
    <About v-model="modal" />
  </Teleport>

  <header class="overflow-x-auto bg-gray-100 px-5">
    <div class="my-1 flex min-w-[800px] gap-x-1">
      <div class="self-center px-3">
        <div class="flex justify-center">
          <Palette :size="32" />
        </div>

        <h1 class="text-2xl font-medium">Pintura</h1>
      </div>

      <div class="border border-gray-200"></div>

      <div class="flex flex-col">
        <div class="grow">
          <div class="grid grid-cols-3 gap-1">
            <button
              type="button"
              class="border border-gray-100 p-0.5 hover:border-gray-300 hover:bg-gray-200"
              :class="{
                '!border-blue-700 bg-gray-200 text-blue-700':
                  selectedTool === Tools.BRUSH,
              }"
              @click="handleToolSelection(Tools.BRUSH)"
            >
              <Paintbrush :size="20" />
            </button>

            <button
              type="button"
              class="border border-gray-100 p-0.5 hover:border-gray-300 hover:bg-gray-200"
              :class="{
                '!border-blue-700 bg-gray-200 text-blue-700':
                  selectedTool === Tools.PENCIL,
              }"
              @click="handleToolSelection(Tools.PENCIL)"
            >
              <Pencil :size="20" />
            </button>

            <button
              type="button"
              class="border border-gray-100 p-0.5 hover:border-gray-300 hover:bg-gray-200"
              :class="{
                '!border-blue-700 bg-gray-200 text-blue-700':
                  selectedTool === Tools.FILL,
              }"
              @click="handleToolSelection(Tools.FILL)"
            >
              <PaintBucket :size="20" />
            </button>

            <button
              type="button"
              class="border border-gray-100 p-0.5 hover:border-gray-300 hover:bg-gray-200"
              @click="handleToolSelection(Tools.ERASER)"
              :class="{
                '!border-blue-700 bg-gray-200 text-blue-700':
                  selectedTool === Tools.ERASER,
              }"
            >
              <Eraser :size="20" />
            </button>

            <button
              type="button"
              class="border border-gray-100 p-0.5 hover:border-gray-300 hover:bg-gray-200"
              @click="handleToolSelection(Tools.RESET)"
            >
              <RotateCcw :size="20" />
            </button>
          </div>
        </div>

        <div class="text-center text-xs text-gray-500">Tools</div>
      </div>

      <div class="border border-gray-200"></div>

      <Size />

      <div class="border border-gray-200"></div>

      <div class="flex flex-col">
        <div class="grow">
          <div class="grid grid-cols-3 items-start gap-1">
            <button
              type="button"
              class="border border-gray-100 p-0.5 hover:border-gray-300 hover:bg-gray-200"
              :class="{
                '!border-blue-700 bg-gray-200 text-blue-700':
                  selectedTool === Tools.LINE,
              }"
              @click="handleToolSelection(Tools.LINE)"
            >
              <Minus :size="20" class="rotate-45" />
            </button>

            <button
              type="button"
              class="border border-gray-100 p-0.5 hover:border-gray-300 hover:bg-gray-200"
              :class="{
                '!border-blue-700 bg-gray-200 text-blue-700':
                  selectedTool === Tools.RECTANGLE,
              }"
              @click="handleToolSelection(Tools.RECTANGLE)"
            >
              <RectangleHorizontal :size="20" />
            </button>

            <button
              type="button"
              class="border border-gray-100 p-0.5 hover:border-gray-300 hover:bg-gray-200"
              :class="{
                '!border-blue-700 bg-gray-200 text-blue-700':
                  selectedTool === Tools.TRIANGLE,
              }"
              @click="handleToolSelection(Tools.TRIANGLE)"
            >
              <Triangle :size="20" />
            </button>

            <button
              type="button"
              class="border border-gray-100 p-0.5 hover:border-gray-300 hover:bg-gray-200"
              :class="{
                '!border-blue-700 bg-gray-200 text-blue-700':
                  selectedTool === Tools.CIRCLE,
              }"
              @click="handleToolSelection(Tools.CIRCLE)"
            >
              <Circle :size="20" />
            </button>

            <button
              type="button"
              class="border border-gray-100 p-0.5 hover:border-gray-300 hover:bg-gray-200"
              :class="{
                '!border-blue-700 bg-gray-200 text-blue-700':
                  selectedTool === Tools.DIAMOND,
              }"
              @click="handleToolSelection(Tools.DIAMOND)"
            >
              <Diamond :size="20" />
            </button>

            <button
              type="button"
              class="border border-gray-100 p-0.5 hover:border-gray-300 hover:bg-gray-200"
              :class="{
                '!border-blue-700 bg-gray-200 text-blue-700':
                  selectedTool === Tools.PARALLELOGRAM,
              }"
              @click="handleToolSelection(Tools.PARALLELOGRAM)"
            >
              <RectangleHorizontal :size="20" class="rotate-20" />
            </button>

            <button
              type="button"
              class="border border-gray-100 p-0.5 hover:border-gray-300 hover:bg-gray-200"
              :class="{
                '!border-blue-700 bg-gray-200 text-blue-700':
                  selectedTool === Tools.HEXAGON,
              }"
              @click="handleToolSelection(Tools.HEXAGON)"
            >
              <Hexagon :size="20" />
            </button>

            <button
              type="button"
              class="border border-gray-100 p-0.5 hover:border-gray-300 hover:bg-gray-200"
              :class="{
                '!border-blue-700 bg-gray-200 text-blue-700':
                  selectedTool === Tools.HEART,
              }"
              @click="handleToolSelection(Tools.HEART)"
            >
              <Heart :size="20" />
            </button>

            <button
              type="button"
              class="border border-gray-100 p-0.5 hover:border-gray-300 hover:bg-gray-200"
              :class="{
                '!border-blue-700 bg-gray-200 text-blue-700':
                  selectedTool === Tools.STAR,
              }"
              @click="handleToolSelection(Tools.STAR)"
            >
              <Star :size="20" />
            </button>
          </div>
        </div>

        <div class="mt-1 text-center text-xs text-gray-500">Shapes</div>
      </div>

      <div class="border border-gray-200"></div>

      <div class="flex gap-x-1">
        <div class="flex flex-col">
          <div class="grow">
            <div class="grid grid-cols-10 gap-0.5">
              <div
                class="border border-gray-400 p-[1px] hover:border-blue-700"
                :class="{ '!border-blue-700': color === selectedColor }"
                v-for="color in colorList"
                :key="color"
                @click="handleColorFromPicker(color)"
              >
                <div class="h-5 w-5" :style="{ backgroundColor: color }"></div>
              </div>
            </div>
          </div>

          <div class="mt-2 text-center text-xs text-gray-500">Colors</div>
        </div>

        <div role="button" @click="openColorPicker">
          <div
            class="border border-gray-100 p-1 hover:cursor-default hover:border-gray-300 hover:bg-gray-200"
          >
            <div>
              <div class="relative border border-gray-400 p-[1px]">
                <div
                  class="h-7 w-7"
                  :style="{ backgroundColor: selectedColor }"
                ></div>

                <input
                  type="color"
                  id="color-picker"
                  class="absolute top-0 left-0 h-full w-full opacity-0"
                  v-model="selectedColor"
                />
              </div>
            </div>

            <div class="mt-2 text-center text-xs text-gray-500">
              Edit
              <div>Color</div>
            </div>
          </div>
        </div>
      </div>

      <div class="border border-gray-200"></div>

      <div>
        <button
          type="button"
          class="border border-gray-100 p-1 hover:border-gray-300 hover:bg-gray-200"
          @click="handleToolSelection(Tools.SAVE)"
        >
          <div class="flex justify-center">
            <Download />
          </div>

          <div class="mt-2 text-xs text-gray-500">
            <div>Save</div>
            Image
          </div>
        </button>
      </div>

      <div class="border border-gray-200"></div>

      <div>
        <button
          type="button"
          class="border border-gray-100 p-1 hover:border-gray-300 hover:bg-gray-200"
          @click="modal = true"
        >
          <div class="flex justify-center">
            <Info />
          </div>

          <div class="mt-2 text-xs text-gray-500">About</div>
        </button>
      </div>
    </div>
  </header>
</template>
