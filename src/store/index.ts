import { ref } from "vue";
import { defineStore } from "pinia";

import { Tools } from "@/utils/constants";
import type { Tool as ITool } from "@/utils/types";

export const usePaintStore = defineStore("paint", () => {
  const tool = ref<ITool>({
    name: Tools.BRUSH,
    color: "#0000ff",
    size: 8,
    drawing: false,
    lastPos: { x: 0, y: 0 },
    shapeStart: null,
    snapshot: null,
  });
  const brushSize = ref(8);
  const pencilSize = ref(2);
  const shapeSize = ref(4);
  const eraserSize = ref(24);

  return {
    tool,
    brushSize,
    pencilSize,
    shapeSize,
    eraserSize,
  };
});
