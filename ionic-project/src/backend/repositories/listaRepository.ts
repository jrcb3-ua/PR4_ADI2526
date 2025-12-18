import { pb } from '../config/pb'

/**
 * Modelo de una receta (coincide con PocketBase)
 */
export interface Receta {
  id?: string
  titulo: string
  descripcion?: string
  ingredientes: string
  preparacion?: string
  categoria?: string
  image?: string
  autors: string[]
}

/**
 * Obtener todas las recetas
 */
async function getItems(): Promise<Receta[]> {
  return await pb.collection('recetas').getFullList<Receta>({
    sort: '-created'
  })
}

/**
 * Obtener una receta por ID
 */
async function getItem(id: string): Promise<Receta> {
  return await pb.collection('recetas').getOne<Receta>(id)
}

/**
 * Crear una nueva receta
 */
async function addItem(
  titulo: string,
  descripcion: string,
  ingredientes: string,
  preparacion: string,
  categoria: string,
  image: string = ''
): Promise<Receta> {

  const datos: Receta = {
    titulo,
    descripcion: descripcion || '',
    ingredientes,
    preparacion: preparacion || '',
    categoria: categoria || '',
    image: image || 'https://via.placeholder.com/400x300?text=Receta+Sin+Imagen',
    autors: [pb.authStore.record!.id]
  }

  console.log('📤 Enviando datos:', datos)

  return await pb.collection('recetas').create<Receta>(datos)
}

/**
 * ⚠️ NO recomendado para recetas
 * (solo mantenido por compatibilidad)
 */
async function updateComprado(
  id: string,
  comprado: boolean
): Promise<Receta> {
  return await pb.collection('recetas').update<Receta>(id, { comprado })
}

/**
 * Actualizar una receta
 */
async function updateItem(
  id: string,
  titulo: string,
  descripcion: string,
  ingredientes: string,
  preparacion: string,
  image?: string
): Promise<Receta> {

  return await pb.collection('recetas').update<Receta>(id, {
    titulo,
    descripcion,
    ingredientes,
    preparacion,
    image: image || undefined // mantiene la actual
  })
}

/**
 * Eliminar una receta
 */
async function deleteItem(id: string): Promise<void> {
  await pb.collection('recetas').delete(id)
}

export {
  getItems,
  getItem,
  addItem,
  updateItem,
  updateComprado,
  deleteItem
}
