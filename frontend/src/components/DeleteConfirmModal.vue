<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  isVisible: boolean;
  itemCount: number;
  itemName?: string;
}>();

const emit = defineEmits(['close', 'confirm']);

const actionWord = computed(() => props.itemName === 'order' ? 'cancel' : 'delete');
const actionWordCapitalized = computed(() => actionWord.value.charAt(0).toUpperCase() + actionWord.value.slice(1));
</script>

<template>
  <div v-if="isVisible" class="modal-overlay">
    <div class="modal-content" style="max-width: 400px; padding: 20px;">
      <h3 style="margin-top: 0;">Confirm {{ actionWordCapitalized }}</h3>
      <p>Are you sure you want to {{ actionWord }} {{ itemCount }} selected {{ itemName || 'item' }}(s)?</p>
      <div class="confirm-container" style="margin-top: 20px; display: flex; justify-content: flex-end; gap: 10px;">
        <button class="btn cancel-btn" @click="emit('close')">{{ actionWord === 'cancel' ? 'Close' : 'Cancel' }}</button>
        <button class="btn confirm-btn" style="background-color: #dc3545; color: white; border-color: #dc3545;" @click="emit('confirm')">{{ actionWordCapitalized }}</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import '../styles/product.css';
</style>
