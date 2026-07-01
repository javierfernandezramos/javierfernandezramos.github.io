import type { APIRoute } from 'astro';
import fs from 'fs/promises';
import path from 'path';

export const prerender = false;

// Aseguramos que esta API solo funciona en entorno de desarrollo local (PC)
function checkLocalOnly() {
  if (!import.meta.env.DEV) {
    throw new Error('No autorizado en producción');
  }
}

// Helper para forzar a Astro a recargar las colecciones de contenido en caliente
async function triggerContentReload() {
  try {
    const configPath = path.resolve(process.cwd(), 'astro.config.mjs');
    let content = await fs.readFile(configPath, 'utf-8');
    content = content.replace(/\/\/ Sync timestamp: .*/g, '').trim();
    const newContent = `${content}\n\n// Sync timestamp: ${Date.now()}\n`;
    await fs.writeFile(configPath, newContent, 'utf-8');
  } catch (e) {
    console.error('No se pudo reiniciar el servidor actualizando astro.config.mjs:', e);
  }
}

const ARTICLES_DIR = path.resolve(process.cwd(), 'src/content/articulos');

// Utilidades para parsear y stringificar frontmatter sin librerías externas
function parseMarkdown(fileContent: string) {
  const parts = fileContent.split('---');
  if (parts.length < 3) return { data: {} as any, body: fileContent };
  const yamlText = parts[1];
  const body = parts.slice(2).join('---').trim();
  
  const data: any = {};
  const lines = yamlText.split('\n');
  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;
    const key = line.slice(0, colonIndex).trim();
    let value = line.slice(colonIndex + 1).trim();
    
    // Quitar comillas externas
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    } else if (value.startsWith("'") && value.endsWith("'")) {
      value = value.slice(1, -1);
    }
    
    // Parsear arrays de tags
    if (value.startsWith('[') && value.endsWith(']')) {
      try {
        data[key] = JSON.parse(value.replace(/'/g, '"'));
      } catch {
        data[key] = value.slice(1, -1).split(',').map(s => s.trim().replace(/^["']|["']$/g, ''));
      }
    } else {
      data[key] = value;
    }
  }
  return { data, body };
}

function stringifyMarkdown(data: any, body: string) {
  let yaml = '---\n';
  yaml += `title: ${JSON.stringify(data.title)}\n`;
  yaml += `description: ${JSON.stringify(data.description)}\n`;
  yaml += `pubDate: ${data.pubDate}\n`;
  if (data.image) {
    yaml += `image: ${JSON.stringify(data.image)}\n`;
  } else {
    yaml += `image: "../../assets/Fotos/hero-image.webp"\n`;
  }
  if (data.tags) {
    // Si es un array
    if (Array.isArray(data.tags)) {
      yaml += `tags: ${JSON.stringify(data.tags)}\n`;
    } else if (typeof data.tags === 'string') {
      const parsedTags = data.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
      yaml += `tags: ${JSON.stringify(parsedTags)}\n`;
    }
  }
  yaml += '---\n\n';
  yaml += body;
  return yaml;
}

// GET: Listar todos los artículos con sus metadatos
export const GET: APIRoute = async ({ request }) => {
  try {
    checkLocalOnly();

    const url = new URL(request.url);
    const sync = url.searchParams.get('sync');
    if (sync === 'true') {
      await triggerContentReload();
    }
    
    await fs.mkdir(ARTICLES_DIR, { recursive: true });
    const files = await fs.readdir(ARTICLES_DIR);
    const mdFiles = files.filter(f => f.endsWith('.md'));
    
    const articles = [];
    for (const filename of mdFiles) {
      const filepath = path.join(ARTICLES_DIR, filename);
      const content = await fs.readFile(filepath, 'utf-8');
      const { data, body } = parseMarkdown(content);
      articles.push({
        filename,
        slug: filename.replace('.md', ''),
        title: data.title || filename,
        description: data.description || '',
        pubDate: data.pubDate || '',
        image: data.image || '',
        tags: data.tags || [],
        body
      });
    }

    // Ordenar por fecha de publicación (más reciente primero)
    articles.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

    return new Response(JSON.stringify(articles), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};

// POST: Crear o modificar un artículo
export const POST: APIRoute = async ({ request }) => {
  try {
    checkLocalOnly();
    
    const { filename, title, description, pubDate, image, tags, body } = await request.json();
    
    if (!filename) {
      return new Response(JSON.stringify({ error: 'Nombre de archivo requerido' }), { status: 400 });
    }

    // Asegurar extensión .md
    let targetFilename = filename;
    if (!targetFilename.endsWith('.md')) {
      targetFilename += '.md';
    }

    const filepath = path.join(ARTICLES_DIR, targetFilename);
    
    // Crear el contenido markdown
    const mdContent = stringifyMarkdown({
      title,
      description,
      pubDate,
      image,
      tags
    }, body);

    await fs.mkdir(ARTICLES_DIR, { recursive: true });
    await fs.writeFile(filepath, mdContent, 'utf-8');
    await triggerContentReload();

    return new Response(JSON.stringify({ success: true, filename: targetFilename }));
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};

// DELETE: Borrar un artículo
export const DELETE: APIRoute = async ({ request }) => {
  try {
    checkLocalOnly();
    
    const { filename } = await request.json();
    if (!filename) {
      return new Response(JSON.stringify({ error: 'Nombre de archivo requerido' }), { status: 400 });
    }

    const filepath = path.join(ARTICLES_DIR, filename);
    await fs.unlink(filepath);
    await triggerContentReload();

    return new Response(JSON.stringify({ success: true }));
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
