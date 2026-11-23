<script setup lang="ts">
import { useChat } from "@ai-sdk/vue";
import { computed, ref } from "vue";

const input = ref("");
const { messages, sendMessage, status, error, stop, regenerate, clearError } =
  useChat();

const isBusy = computed(
  () => status.value === "submitted" || status.value === "streaming",
);
const canSend = computed(() => status.value === "ready" && !!input.value.trim());

const handleSubmit = () => {
  if (!canSend.value) return;
  sendMessage({ text: input.value.trim() });
  input.value = "";
};

const retry = () => {
  clearError();
  regenerate();
};
</script>

<template>
  <div>
    <div v-for="m in messages" :key="m.id">
      {{ m.role === "user" ? "User: " : "AI: " }}
      <div v-for="(part, partIndex) in m.parts" :key="`${m.id}-${partIndex}`">
        <div v-if="part.type === 'text'">{{ part.text }}</div>
      </div>
    </div>

    <p v-if="status === 'submitted'">Thinking…</p>

    <div v-if="error" role="alert">
      <p>Something went wrong: {{ error.message }}</p>
      <button type="button" @click="retry">Retry</button>
    </div>

    <form @submit.prevent="handleSubmit">
      <input
        v-model="input"
        placeholder="Say something..."
        :disabled="isBusy"
      />
      <button v-if="isBusy" type="button" @click="stop">Stop</button>
      <button v-else type="submit" :disabled="!canSend">Send</button>
    </form>
  </div>
</template>
