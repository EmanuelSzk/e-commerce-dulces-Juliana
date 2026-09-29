// Datos de contacto que se muestran en el pie y en el botón de WhatsApp.
// Los vacíos no se muestran en ningún lado.
export const storeContact: {
  whatsapp?: string; // formato internacional sin signos, ej. "5493764123456"
  whatsappLabel?: string; // cómo se muestra, ej. "376 412-3456"
  email?: string;
  instagram?: string; // usuario sin @
} = {};

// Identificación de quien vende, para los textos legales.
export const storeLegal = {
  name: "Dulces Juliana",
  legalName: "Dulces Juliana",
  taxId: undefined as string | undefined, // CUIT, si corresponde
};

// Marcador del mapa de la home (Av. Rademacher 5458, Posadas; verificado en
// OpenStreetMap). No se deriva de la dirección de Configuración: si el local
// se muda, hay que actualizar estas coordenadas a mano.
export const storeLocation = { lat: -27.3989243, lng: -55.8982353 };

export function whatsappLink(message?: string) {
  if (!storeContact.whatsapp) return null;
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${storeContact.whatsapp}${text}`;
}
