<script setup lang="ts">
import { useTemplateRef } from "vue";
import { onClickOutside } from "@vueuse/core";

import { X } from "lucide-vue-next";

const modalRef = useTemplateRef("modalRef");
const modal = defineModel<boolean>();

onClickOutside(modalRef, () => {
  modal.value = false;
});
</script>

<template>
  <div v-show="modal">
    <div class="fixed top-0 left-0 h-full w-full bg-black/30"></div>

    <div
      ref="modalRef"
      class="absolute top-1/2 left-1/2 z-10 w-10/12 -translate-1/2 rounded-md border border-gray-300 bg-white p-3 shadow-lg md:w-[503px]"
    >
      <div class="flex items-center justify-between">
        <div class="text-lg font-medium">About</div>

        <div class="flex items-center">
          <button
            type="button"
            class="rounded p-0.5 text-gray-600 hover:bg-gray-100 hover:text-black"
            @click="modal = false"
          >
            <X />
          </button>
        </div>
      </div>

      <div class="mt-1.5 border-t border-gray-300 pt-2 text-gray-600">
        Pincel (<span class="italic">Spanish word for Paintbrush</span>) is a
        simple, lightweight drawing app inspired by the classic Microsoft Paint.
        It recreates the nostalgic MS Paint experience with a modern touch,
        focusing on a curated set of its most loved features in a clean,
        easy-to-use interface.
      </div>

      <div class="mt-2 text-center text-gray-600">
        - Pincel, {{ new Date().getFullYear() }}
      </div>
    </div>
  </div>
</template>
