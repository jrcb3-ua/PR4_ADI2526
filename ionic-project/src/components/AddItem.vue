<script setup>
    import {
        IonItem,
        IonInput,
        IonButton,
        IonIcon,
        } from '@ionic/vue'
    import { addOutline } from 'ionicons/icons'
    import {ref} from 'vue'

    const emit = defineEmits(["add_item"])
    const newItem = ref("")

    function addItem() {
        emit('add_item', newItem.value)
        newItem.value = ""
    }

</script>

<template>
    <ion-item class="add-item">
          <ion-input
            placeholder="Añadir item"
            v-model="newItem"
            @keyup.enter="addItem"
          />
          <ion-button slot="end" @click="addItem">
            <ion-icon :icon="addOutline" />
          </ion-button>
    </ion-item>
</template>