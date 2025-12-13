<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
// Importamos componentes de Ionic
import {
  IonPage,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonImg,
  IonIcon,
  IonText
} from '@ionic/vue'
import { restaurantOutline, arrowForward } from 'ionicons/icons'

// Importar Pinia Store (Igual que antes)
import { useAppStore } from '@/stores/appStore'

// Si tienes un footer adaptado a Ionic, impórtalo, si no, puedes quitarlo o adaptarlo
import SiteFooter from '@/components/SiteFooter.vue' 

const recetasStore = useAppStore()
const router = useRouter()

onMounted(async () => {
  try {
    await recetasStore.loadRecetas()
  } catch (error) {
    console.error("Error cargando recetas desde Pinia:", error)
  }
})
</script>

<template>
  <ion-page>
    <ion-content :fullscreen="true">
      
      <div class="hero-slider">
        <div class="slider-images">
            <div class="slide" style="background-image: url('/assets/img/recipe1.jpg')"></div>
          <div class="slide" style="background-image: url('/assets/img/recipe2.jpg')"></div>
          <div class="slide" style="background-image: url('/assets/img/recipe3.jpg')"></div>
        </div>

        <div class="slider-overlay"></div>

        <div class="hero-content ion-text-center">
            <h1 class="hero-title">
              Bienvenido a <span class="highlight">Recetario</span>
            </h1>
            <p class="hero-subtitle">
              Descubre, guarda y comparte tus recetas favoritas desde tu móvil.
            </p>
        </div>
      </div>

      <ion-grid class="ion-padding-top">
        
        <ion-row class="ion-justify-content-center">
          <ion-col size="12" size-md="8">
            <ion-card class="intro-card">
              <ion-card-header>
                <ion-card-title class="ion-text-center color-primary">
                  <ion-icon :icon="restaurantOutline" style="vertical-align: middle;"></ion-icon> 
                  Nuestras recetas
                </ion-card-title>
              </ion-card-header>
              <ion-card-content class="ion-text-center">
                <p>Descubrirás platos únicos que despertarán tus sentidos.</p>
                <ion-button expand="block" router-link="/recetas" class="ion-margin-top" color="success">
                  Ver todas las recetas
                </ion-button>
              </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>

        <ion-row v-if="recetasStore.recetas.length > 0">
          <ion-col 
            size="12" 
            size-md="6" 
            v-for="receta in recetasStore.recetas.slice(0, 3)" 
            :key="receta.id"
          >
            <ion-card class="recipe-card">
              <div class="card-img-wrapper">
                  <img :src="receta.image || '/assets/img/default-recipe.jpg'" :alt="receta.titulo" />
              </div>
              
              <ion-card-header>
                <ion-card-title>{{ receta.titulo }}</ion-card-title>
              </ion-card-header>

              <ion-card-content>
                <p class="recipe-desc">
                  {{ receta.descripcion || 'Descubre esta deliciosa receta...' }}
                </p>
                <ion-button 
                  fill="outline" 
                  expand="block" 
                  color="success" 
                  :router-link="`/receta/${receta.id}`"
                >
                  Ver Receta
                  <ion-icon slot="end" :icon="arrowForward"></ion-icon>
                </ion-button>
              </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>

        <ion-row v-else>
          <ion-col size="12">
            <ion-card color="warning">
              <ion-card-header>
                <ion-card-title>¡Aún no hay recetas!</ion-card-title>
              </ion-card-header>
              <ion-card-content>
                Sé el primero en compartir una receta.
              </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>

      </ion-grid>

      <SiteFooter />
      
    </ion-content>
  </ion-page>
</template>

<style scoped>
/* --- HERO SLIDER (Adaptado para móvil) --- */
.hero-slider {
  position: relative;
  height: 50vh; /* Un poco menos alto para móvil */
  min-height: 300px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.slider-images {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 300%; /* 3 slides */
  display: flex;
  animation: slide-left 15s infinite linear;
  z-index: 0;
}

.slide {
  width: 100vw; /* Ancho de la ventana del dispositivo */
  height: 100%;
  background-size: cover;
  background-position: center;
}

.slider-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5); /* Un poco más oscuro para legibilidad móvil */
  z-index: 1;
}

.hero-content {
  position: relative;
  z-index: 2;
  color: white;
  padding: 20px;
}

.hero-title {
  font-weight: bold;
  font-size: 2.5rem;
  margin-bottom: 1rem;
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
}

.highlight {
  border-bottom: 3px solid var(--ion-color-success, #2dd36f);
}

/* --- ANIMACIÓN SLIDER --- */
@keyframes slide-left {
  0%, 30% { transform: translateX(0); }
  33%, 63% { transform: translateX(-100vw); }
  66%, 96% { transform: translateX(-200vw); }
  100% { transform: translateX(0); } /* Loop más suave */
}

/* --- CARDS --- */
.intro-card {
  border-top: 4px solid var(--ion-color-success);
}

.recipe-card {
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
}

.card-img-wrapper {
  height: 180px;
  overflow: hidden;
}

.card-img-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.recipe-desc {
  display: -webkit-box;
  -webkit-line-clamp: 2; /* Limita a 2 líneas */
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 1rem;
  color: var(--ion-color-medium);
}
</style>