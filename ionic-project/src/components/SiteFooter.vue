<script setup>
  import { IonFooter, IonToolbar, IonTitle } from '@ionic/vue';
</script>

<template>
  <ion-footer class="ion-no-border">
    <ion-toolbar>
      <ion-title class="ion-text-center footer-text">
        © 2025 – Recetario
      </ion-title>
    </ion-toolbar>
  </ion-footer>
</template>

<style scoped>
  ion-toolbar {
    --background: var(--ion-color-light, #f4f5f8);
    --min-height: 50px;
    --border-width: 0;
  }

  .footer-text {
    font-size: 0.8rem;
    color: var(--ion-color-medium, #666);
  }
</style>