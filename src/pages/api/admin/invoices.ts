import type { APIRoute } from 'astro';
import { isAuthenticated } from '../../../lib/auth';
import { deleteInvoice, saveInvoice } from '../../../lib/kv';

export const prerender = false;

// GET no es estrictamente necesario aquí ya que cargamos las facturas
// directamente en la parte del servidor de las páginas .astro (SSR),
// lo cual es más rápido. Pero implementamos POST (para guardar) y DELETE (para borrar).

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!isAuthenticated(cookies)) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });
  }

  try {
    const data = await request.json();
    if (!data.docNumber) {
      return new Response(JSON.stringify({ error: 'Número de documento requerido' }), { status: 400 });
    }

    await saveInvoice(data);
    return new Response(JSON.stringify({ success: true }));
  } catch (error) {
    console.error('Error saving invoice via API:', error);
    return new Response(JSON.stringify({ error: 'Error interno del servidor' }), { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ request, cookies }) => {
  if (!isAuthenticated(cookies)) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });
  }

  try {
    const { docNumber } = await request.json();
    if (!docNumber) {
      return new Response(JSON.stringify({ error: 'Número de documento requerido' }), { status: 400 });
    }

    await deleteInvoice(docNumber);
    return new Response(JSON.stringify({ success: true }));
  } catch (error) {
    console.error('Error deleting invoice via API:', error);
    return new Response(JSON.stringify({ error: 'Error interno del servidor' }), { status: 500 });
  }
};
