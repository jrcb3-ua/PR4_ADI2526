<script setup>
    import { reactive } from 'vue'
    import {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonButton,
    IonButtons,
    IonIcon
    } from '@ionic/vue'
    import { logOutOutline } from 'ionicons/icons'
    import {getItems, addItem, deleteItem} from '@/backend/repositories/listaRepository'
    import { logout } from '@/backend/services/authService'

    import { onIonViewDidEnter } from '@ionic/vue'
    import AddItem from '@/components/AddItem.vue'
    import Lista from '@/components/Lista.vue'
    import {useRouter} from "vue-router"
    

    const router = useRouter()


    
    const estado = reactive({items:[]})

    onIonViewDidEnter(async function(){
      console.log("descargando items...")
      estado.items = await getItems()  
      console.log("descargados items")
      
    })

    async function do_addItem(nombre) {
      const nuevo = await addItem(nombre)
      estado.items.push(nuevo)
      console.log(estado.items)
    }

    async function do_deleteItem(id) {
      console.log("eliminar item ", id)
      const pos = estado.items.findIndex(item => item.id==id)
      if (pos>-1) {
        await deleteItem(id)
        estado.items.splice(pos,1)
      }
      
    }

    async function do_logout() {
      await logout()
      router.push('/login')
    }



</script>


<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Lista de la compra</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="do_logout">
            <ion-icon :icon="logOutOutline" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-list>
        <add-item @add_item="do_addItem"/>
        <lista :items="estado.items"  @delete_item="do_deleteItem"/>
      </ion-list>
    </ion-content>
  </ion-page>
</template>