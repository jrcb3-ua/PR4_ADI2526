import {pb} from '../config/pb'

async function getItems() {
   return await pb.collection("lista").getFullList()
}

async function getItem(id) {
    return await pb.collection("lista").getOne(id)
}

async function addItem(nombre) {
    const datos = {
        nombre: nombre,
        comprado: false, 
        usuario: pb.authStore.record.id
    }
    return await pb.collection("lista").create(datos)
}

async function updateComprado(id, comprado) {
    return await pb.collection("lista").update(id, {comprado: comprado})
}

async function updateItem(id, nombre) {
    return await pb.collection("lista").update(id, {nombre: nombre})
}

async function deleteItem(id) {
    await pb.collection("lista").delete(id)
}



export {getItems, getItem,  addItem, updateItem, updateComprado, deleteItem}