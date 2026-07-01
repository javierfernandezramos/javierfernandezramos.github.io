import Redis from 'ioredis';
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

const REDIS_URL = process.env.KV_REDIS_URL;

function useLocalDb(): boolean {
  return !REDIS_URL;
}

// Cliente Redis singleton (solo se crea si hay URL)
let redisClient: Redis | null = null;
function getRedis(): Redis {
  if (!redisClient) {
    redisClient = new Redis(REDIS_URL!, {
      // Necesario para Upstash / Redis.io TLS
      tls: REDIS_URL!.startsWith('rediss://') ? {} : undefined,
      lazyConnect: false,
      maxRetriesPerRequest: 3,
    });
  }
  return redisClient;
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
      const redis = getRedis();
      const ids = await redis.smembers('invoices');
      if (!ids || ids.length === 0) return [];

      const pipeline = redis.pipeline();
      ids.forEach(id => pipeline.get(`invoice:${id}`));
      const results = await pipeline.exec();

      return (results ?? [])
        .map(([err, val]) => (err || !val ? null : JSON.parse(val as string)))
        .filter((inv): inv is Invoice => inv !== null);
    } catch (error) {
      console.error('Error fetching invoices from Redis:', error);
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
      const redis = getRedis();
      const val = await redis.get(`invoice:${docNumber}`);
      return val ? JSON.parse(val) : null;
    } catch (error) {
      console.error(`Error fetching invoice ${docNumber} from Redis:`, error);
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
      const redis = getRedis();
      await redis.set(`invoice:${docNumber}`, JSON.stringify(invoice));
      await redis.sadd('invoices', docNumber);
    } catch (error) {
      console.error(`Error saving invoice ${docNumber} to Redis:`, error);
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
      const redis = getRedis();
      await redis.del(`invoice:${docNumber}`);
      await redis.srem('invoices', docNumber);
    } catch (error) {
      console.error(`Error deleting invoice ${docNumber} from Redis:`, error);
      throw error;
    }
  }
}
