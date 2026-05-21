<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
  isVisible: boolean;
  itemCount: number;
  currentStatus: string;
}>();

const emit = defineEmits(['close', 'confirm']);

const targetStatus = ref('');

// Watch currentStatus to set an appropriate default targetStatus
watch(() => props.currentStatus, (newVal) => {
  if (newVal === 'draft') targetStatus.value = 'processing';
  else if (newVal === 'processing') targetStatus.value = 'on delivery';
  else if (newVal === 'on delivery') targetStatus.value = 'success';
  else targetStatus.value = '';
}, { immediate: true });

const allowedTransitions: Record<string, string[]> = {
  'draft': ['processing'],
  'processing': ['draft', 'on delivery'],
  'on delivery': ['processing', 'success', 'package problem'],
  'package problem': ['on delivery', 'bounce back'],
};

const getAvailableTargets = () => {
  return allowedTransitions[props.currentStatus] || [];
};

const confirm = () => {
  if (targetStatus.value) {
    emit('confirm', targetStatus.value);
  }
}
</script>

<template>
  <div v-if="isVisible" class="modal-overlay">
    <div class="modal-content" style="max-width: 400px; padding: 20px;">
      <h3 style="margin-top: 0;">Change Status</h3>
      <p>Change status of {{ itemCount }} selected orders from <strong>{{ currentStatus }}</strong> to:</p>
      
      <select v-model="targetStatus" class="form-select" style="width: 100%; padding: 8px; margin-bottom: 20px; border-radius: 4px; border: 1px solid #ddd;">
        <option v-for="status in getAvailableTargets()" :key="status" :value="status">{{ status }}</option>
      </select>

      <div class="confirm-container" style="margin-top: 20px; display: flex; justify-content: flex-end; gap: 10px;">
        <button class="btn cancel-btn" @click="emit('close')">Cancel</button>
        <button class="btn confirm-btn" style="background-color: #28a745; color: white; border-color: #28a745;" @click="confirm" :disabled="!targetStatus">Change Status</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import '../styles/product.css';
</style>
