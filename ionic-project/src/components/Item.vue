<script setup>
    import {IonItem, IonButton, IonIcon, IonLabel} from '@ionic/vue'
    import { trashOutline } from 'ionicons/icons'
    
    defineProps(["nombre", "id"])
    defineEmits(["delete_item"])
</script>

<template>
    <ion-item>
        <ion-label>{{ nombre }}</ion-label>
        <ion-button
            slot="end"
            color="danger"
            @click="$emit('delete_item', id)">
            <ion-icon :icon="trashOutline" />
        </ion-button>
    </ion-item>    
</template>