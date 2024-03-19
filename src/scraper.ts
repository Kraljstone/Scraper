import fs from 'fs';
import { Cluster } from 'puppeteer-cluster';
import { Product } from './types/product.interface';
import { processPageProducts } from './utils/processPageProducts';
import { handleTaskError } from './utils/handleTaskError';
import puppeteerExtra from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteerExtra.use(StealthPlugin());

export async function initializeCluster(): Promise<Cluster> {
  return await Cluster.launch({
    puppeteer: puppeteerExtra,
    concurrency: Cluster.CONCURRENCY_PAGE,
    maxConcurrency: 100,
    puppeteerOptions: {
      userDataDir: './tmp',
    },
  });
}

const urls: string[] = [
  'https://www.etsy.com/c/jewelry?ref=homepage_shop_by_category_card',
  'https://www.etsy.com/c/home-and-living?ref=homepage_shop_by_category_card',
  'https://www.etsy.com/c/art-and-collectibles?ref=homepage_shop_by_category_card',
  'https://www.etsy.com/c/clothing?ref=homepage_shop_by_category_card',
  'https://www.etsy.com/c/baby?ref=homepage_shop_by_category_card',
];

crawlAndSaveProducts(urls);

async function crawlAndSaveProducts(urls: string[]): Promise<void> {
  const cluster: Cluster = await initializeCluster();

  cluster.on('taskError', handleTaskError);

  const allProducts: Record<string, Product[]> = {};

  try {
    for (const url of urls) {
      await cluster.queue(url);
    }

    await cluster.task(
      async ({ page, data: url }: { page: any; data: string }) => {
        await processPageProducts(page, url, allProducts);
      }
    );

    await cluster.idle();
    await cluster.close();

    fs.writeFile(
      'products.json',
      JSON.stringify(allProducts, null, 2),
      (err: NodeJS.ErrnoException | null) => {
        if (err) throw err;
        console.log('Products saved to products.json');
      }
    );
  } catch (error: any) {
    console.error('An error occurred:', error);
  }
}
