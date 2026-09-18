// Datos de contacto que se muestran en el pie. Los vacíos no se muestran.
export const storeContact: {
  whatsapp?: string;
  email?: string;
  instagram?: string;
} = {};

// Marcador del mapa de la home (Av. Rademacher 5458, Posadas; verificado en
// OpenStreetMap). No se deriva de la dirección de Configuración: si el local
// se muda, hay que actualizar estas coordenadas a mano.
export const storeLocation = { lat: -27.3989243, lng: -55.8982353 };
