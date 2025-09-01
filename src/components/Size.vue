<script setup lang="ts">
import { ref, useTemplateRef, watch } from "vue";
import { onClickOutside } from "@vueuse/core";
import { ChevronDown } from "lucide-vue-next";

import { usePaintStore } from "@/store/index";
import { Tools } from "@/utils/constants";

const paintStore = usePaintStore();

const dropdownRef = useTemplateRef("sizeRef");
const dropdown = ref(false);
const selectedSize = ref(8);

onClickOutside(dropdownRef, () => {
  if (dropdown.value) {
    dropdown.value = false;
  }
});

watch(
  () => paintStore.tool.name,
  (toolName) => {
    if (toolName === Tools.BRUSH) {
      selectedSize.value = paintStore.brushSize;
    } else if (toolName === Tools.PENCIL) {
      selectedSize.value = paintStore.pencilSize;
    } else {
      selectedSize.value = paintStore.shapeSize;
    }
  },
);

function handleSize(size: number) {
  selectedSize.value = size;
  dropdown.value = false;

  if (paintStore.tool.name === Tools.BRUSH) {
    paintStore.brushSize = size;
  } else if (paintStore.tool.name === Tools.PENCIL) {
    paintStore.pencilSize = size;
  } else {
    paintStore.shapeSize = size;
  }
}
</script>

<template>
  <div class="relative">
    <button
      type="button"
      class="w-14 border border-gray-100 p-1 hover:border-gray-300 hover:bg-gray-200"
      :class="{ '!border-gray-300 bg-gray-200': dropdown }"
      @click="dropdown = !dropdown"
    >
      <div class="border-b-2 bg-black"></div>
      <div class="mt-1 border-b-3 bg-black"></div>
      <div class="mt-1 border-b-4 bg-black"></div>
      <div class="mt-1 border-b-5 bg-black"></div>

      <div class="mt-2 text-xs text-gray-500">Size</div>

      <div class="mt-1 flex justify-center">
        <ChevronDown :size="16" />
      </div>
    </button>

    <Teleport to="body">
      <div v-show="dropdown">
        <div
          ref="sizeRef"
          class="absolute top-21 left-64 z-10 -translate-x-1/2 rounded border border-gray-300 bg-white shadow-lg"
        >
          <div class="p-0.5">
            <button
              type="button"
              class="block border border-white px-2 pt-3 pb-4 text-left hover:border-gray-300 hover:bg-gray-100"
              :class="{ '!border-gray-300 bg-gray-100': selectedSize === 1 }"
              @click="handleSize(1)"
            >
              <div class="mt-1.5 w-16 border-b border-black"></div>
            </button>

            <button
              type="button"
              class="block border border-white px-2 pt-3 pb-4 text-left hover:border-gray-300 hover:bg-gray-100"
              :class="{ '!border-gray-300 bg-gray-100': selectedSize === 2 }"
              @click="handleSize(2)"
            >
              <div class="mt-1.5 w-16 border-b-2 border-black"></div>
            </button>

            <button
              type="button"
              class="block border border-white px-2 pt-3 pb-4 text-left hover:border-gray-300 hover:bg-gray-100"
              :class="{ '!border-gray-300 bg-gray-100': selectedSize === 4 }"
              @click="handleSize(4)"
            >
              <div class="mt-1.5 w-16 border-b-4 border-black"></div>
            </button>

            <button
              type="button"
              class="block border border-white px-2 pt-3 pb-4 text-left hover:border-gray-300 hover:bg-gray-100"
              :class="{ '!border-gray-300 bg-gray-100': selectedSize === 8 }"
              @click="handleSize(8)"
            >
              <div class="mt-1.5 w-16 border-b-6 border-black"></div>
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
