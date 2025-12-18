<script setup>
import { onMounted } from 'vue'
import {
  IonPage,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonIcon,
  IonText
} from '@ionic/vue'
import { arrowForward, restaurantOutline } from 'ionicons/icons'
import { useAppStore } from '@/stores/appStore'

// COMPONENTES
import SiteHeader from '@/components/SiteHeader.vue'
import SiteFooter from '@/components/SiteFooter.vue'

import img1 from '@/assets/img/recipe1.jpg';
import img2 from '@/assets/img/recipe2.jpg';
import img3 from '@/assets/img/recipe3.jpg';

const recetasStore = useAppStore()

onMounted(async () => {
  try {
    await recetasStore.loadRecetas()
  } catch (error) {
    console.error("Error cargando recetas:", error)
  }
})
</script>

<template>
  <ion-page>
    <SiteHeader />

    <ion-content :fullscreen="true">

      <div class="hero-slider">
        <div class="slider-images">
          <div class="slide" :style="{ backgroundImage: `url(${img1})` }"></div>
          <div class="slide" :style="{ backgroundImage: `url(${img2})` }"></div>
          <div class="slide" :style="{ backgroundImage: `url(${img3})` }"></div>
        </div>

        <div class="slider-overlay"></div>

        <div class="hero-content ion-text-center">
          <h1 class="hero-title">
            Bienvenido a <br> <span class="highlight">Recetario</span>
          </h1>
          <p class="hero-subtitle">
            Descubre, guarda y comparte tus platos favoritos.
          </p>
           <ion-button
             color="success"
             shape="round"
             router-link="/recetas"
             class="cta-button"
           >
             VER RECETAS
             <ion-icon slot="end" :icon="arrowForward"></ion-icon>
           </ion-button>
        </div>
      </div>

      <ion-grid class="main-grid">

        <ion-row class="ion-justify-content-center">
          <ion-col size="12">
            <div class="section-header">
              <h3>
                <ion-icon :icon="restaurantOutline" style="vertical-align: -2px"></ion-icon>
                Nuestras Recetas
              </h3>
              <p class="section-desc">Platos únicos que despertarán tus sentidos</p>
            </div>
          </ion-col>
        </ion-row>

        <ion-row v-if="recetasStore.recetas.length > 0">
          <ion-col
            size="12"
            size-md="6"
            v-for="receta in recetasStore.recetas.slice(0, 3)"
            :key="receta.id"
          >
            <ion-card class="recipe-card" router-link="/recetas">
              <div class="card-img-wrapper">
                <img
                  :src="receta.image || img1"
                  :alt="receta.titulo"
                />
                <div class="card-overlay">
                  <ion-card-title class="overlay-title">{{ receta.titulo }}</ion-card-title>
                </div>
              </div>

              <ion-card-content>
                <p class="recipe-desc">
                  {{ receta.descripcion || 'Una deliciosa receta esperando a ser descubierta.' }}
                </p>
                <div class="card-footer">
                   <ion-text color="success" class="see-more">
                     Leer más <ion-icon :icon="arrowForward"></ion-icon>
                   </ion-text>
                </div>
              </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>

        <ion-row v-else>
          <ion-col size="12">
            <ion-card class="empty-card ion-text-center ion-padding">
              <h3>⏳ Cargando recetas...</h3>
              <p>O tal vez aún no hay ninguna.</p>
            </ion-card>
          </ion-col>
        </ion-row>

      </ion-grid>

      <SiteFooter />

    </ion-content>
  </ion-page>
</template>

<style scoped>
/* --- HERO SLIDER --- */
.hero-slider {
  position: relative;
  height: 55vh; /* Un poco más alto para impactar */
  min-height: 400px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  /* El borde curvo inferior */
  border-bottom-left-radius: 40px;
  border-bottom-right-radius: 40px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
  background: #333; /* Fondo por si no carga img */
}

.slider-images {
  position: absolute;
  top: 0; left: 0; width: 300%; height: 100%;
  display: flex;
  animation: slide-left 18s infinite ease-in-out; /* Animación más suave */
}

.slide {
  width: 100vw; height: 100%;
  background-size: cover;
  background-position: center;
}

.slider-overlay {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  /* Degradado para que se lea el texto blanco */
  background: linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 100%);
}

.hero-content {
  position: relative; z-index: 2; color: white; width: 85%;
  text-shadow: 0 2px 10px rgba(0,0,0,0.3);
}

.hero-title {
  font-size: 2.8rem; font-weight: 800; line-height: 1.1; margin-bottom: 10px;
}

.highlight {
  /* Subrayado verde estilo moderno */
  border-bottom: 4px solid #2dd36f;
}

.hero-subtitle {
  font-size: 1.1rem; opacity: 0.95; margin-bottom: 25px;
}

.cta-button {
  --padding-start: 30px;
  --padding-end: 30px;
  font-weight: 700;
  letter-spacing: 0.5px;
  transform: scale(1.1); /* Botón un poco más grande */
}

@keyframes slide-left {
  0%, 28% { transform: translateX(0); }
  33%, 61% { transform: translateX(-100vw); }
  66%, 95% { transform: translateX(-200vw); }
  100% { transform: translateX(0); }
}

/* --- MAIN CONTENT --- */
.main-grid {
  margin-top: -10px;
  padding-bottom: 40px;
  z-index: 3;
  position: relative;
}

.section-header {
  background: white;
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
  margin: 0 10px 20px 10px;
  text-align: center;
}

.section-header h3 {
  font-weight: 700; color: #333; margin: 0; font-size: 1.4rem;
}
.section-desc {
  color: #666; font-size: 0.9rem; margin-top: 5px;
}

/* --- RECIPE CARDS --- */
.recipe-card {
  border-radius: 20px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.08);
  overflow: hidden;
  background: white;
  margin-bottom: 20px;
  transition: transform 0.2s;
}

.recipe-card:active {
  transform: scale(0.98);
}

.card-img-wrapper {
  height: 200px;
  position: relative;
}

.card-img-wrapper img {
  width: 100%; height: 100%; object-fit: cover;
}

/* Título sobre la imagen (estilo moderno) */
.card-overlay {
  position: absolute; bottom: 0; left: 0; width: 100%;
  background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
  padding: 40px 15px 15px;
}

.overlay-title {
  color: white; font-weight: 700; font-size: 1.2rem;
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
}

.recipe-desc {
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
  overflow: hidden; font-size: 0.95rem; color: #555; line-height: 1.4;
  margin-bottom: 15px;
}

.card-footer {
  display: flex; justify-content: flex-end;
}

.see-more {
  font-weight: 700; font-size: 0.9rem; display: flex; align-items: center; gap: 5px;
  text-transform: uppercase; letter-spacing: 0.5px;
}
</style>