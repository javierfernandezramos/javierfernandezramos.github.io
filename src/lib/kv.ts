import { kv } from '@vercel/kv';
import fs from 'fs/promises';
import path from 'path';

// Interfaz para representar una factura
export interface Invoice {
  docType: string;
  docNumber: string;
  docDate: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  conceptName: string;
  fotosEditadas: string;
  fotosReveladas: string;
  fotosTotal: string;
  priceTotal: string;
  taxIva: string;
  taxIrpf: string;
  paymentMethodSelect: string;
  paymentMethod: string;
  updatedAt?: string;
}

// Ruta del archivo de base de datos local en desarrollo
const LOCAL_DB_PATH = path.resolve(process.cwd(), 'src/data/invoices_db.json');

function useLocalDb(): boolean {
  const hasKv = !!(import.meta.env.KV_REST_API_URL || process.env.KV_REST_API_URL);
  return !hasKv;
}

// Inicializar el archivo local si no existe
async function initLocalDb() {
  try {
    await fs.access(LOCAL_DB_PATH);
  } catch {
    await fs.mkdir(path.dirname(LOCAL_DB_PATH), { recursive: true });
    await fs.writeFile(LOCAL_DB_PATH, JSON.stringify({}, null, 2), 'utf-8');
  }
}

// --- Métodos de Base de Datos ---

export async function getInvoices(): Promise<Invoice[]> {
  if (useLocalDb()) {
    await initLocalDb();
    const content = await fs.readFile(LOCAL_DB_PATH, 'utf-8');
    const db = JSON.parse(content);
    return Object.values(db);
  } else {
    try {
      const ids = await kv.smembers('invoices');
      if (!ids || ids.length === 0) return [];
      
      const keys = ids.map(id => `invoice:${id}`);
      const invoices = await kv.mget<Invoice[]>(...keys);
      return invoices.filter((inv): inv is Invoice => inv !== null);
    } catch (error) {
      console.error('Error fetching invoices from Vercel KV:', error);
      return [];
    }
  }
}

export async function getInvoice(docNumber: string): Promise<Invoice | null> {
  if (useLocalDb()) {
    await initLocalDb();
    const content = await fs.readFile(LOCAL_DB_PATH, 'utf-8');
    const db = JSON.parse(content);
    return db[docNumber] || null;
  } else {
    try {
      return await kv.get<Invoice>(`invoice:${docNumber}`);
    } catch (error) {
      console.error(`Error fetching invoice ${docNumber} from Vercel KV:`, error);
      return null;
    }
  }
}

export async function saveInvoice(invoice: Invoice): Promise<void> {
  const docNumber = invoice.docNumber;
  invoice.updatedAt = new Date().toISOString();

  if (useLocalDb()) {
    await initLocalDb();
    const content = await fs.readFile(LOCAL_DB_PATH, 'utf-8');
    const db = JSON.parse(content);
    db[docNumber] = invoice;
    await fs.writeFile(LOCAL_DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
  } else {
    try {
      await kv.set(`invoice:${docNumber}`, invoice);
      await kv.sadd('invoices', docNumber);
    } catch (error) {
      console.error(`Error saving invoice ${docNumber} to Vercel KV:`, error);
      throw error;
    }
  }
}

export async function deleteInvoice(docNumber: string): Promise<void> {
  if (useLocalDb()) {
    await initLocalDb();
    const content = await fs.readFile(LOCAL_DB_PATH, 'utf-8');
    const db = JSON.parse(content);
    if (db[docNumber]) {
      delete db[docNumber];
      await fs.writeFile(LOCAL_DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
    }
  } else {
    try {
      await kv.del(`invoice:${docNumber}`);
      await kv.srem('invoices', docNumber);
    } catch (error) {
      console.error(`Error deleting invoice ${docNumber} from Vercel KV:`, error);
      throw error;
    }
  }
}
