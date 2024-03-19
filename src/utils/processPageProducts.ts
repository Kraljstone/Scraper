import { ElementHandle, Page } from 'puppeteer';
import { getProductInfo } from '../api/getProductInfo';
import { Product } from '../types/product.interface';
import { getProductDetails } from '../api/getProductDetails';

interface AllProducts {
  [key: string]: Product[];
}

export async function processPageProducts(
  page: Page,
  url: string,
  allProducts: AllProducts
): Promise<void> {
  try {
    await page.goto(url, { waitUntil: 'load' });

    const categoryNameResult: string | null = await getProductInfo(
      page,
      '.wt-display-block.wt-text-left-xs.wt-text-center-md.wt-mb-xs-2.wt-text-heading'
    );

    const categoryName: string = categoryNameResult ?? '';

    const productHandles: ElementHandle<HTMLElement>[] = await page.$$(
      '.wt-grid.wt-grid--block.wt-pl-xs-0.tab-reorder-container > li'
    );

    const products: (Product | null)[] = await Promise.all(
      productHandles
        .slice(0, 10)
        .map(async (productHandle: ElementHandle<HTMLElement>) => {
          const productTitle: string | null = await getProductInfo(
            page,
            productHandle,
            '.wt-text-caption.v2-listing-card__title.wt-text-truncate'
          );
          const productPrice: string | null = await getProductInfo(
            page,
            productHandle,
            '.currency-value'
          );
          const productSymbol: string | null = await getProductInfo(
            page,
            productHandle,
            '.currency-symbol'
          );
          const productImg: string | null = await getProductInfo(
            page,
            productHandle,
            '.height-placeholder > img',
            'src'
          );

          const productUrl: string | null = await getProductInfo(
            page,
            productHandle,
            '.listing-link.wt-display-inline-block',
            'href'
          );

          if (
            productTitle &&
            productPrice &&
            productSymbol &&
            productImg &&
            productUrl
          ) {
            const productDesc = await getProductDetails(page, productUrl);
            if (productDesc !== null) {
              return {
                title: productTitle.trim(),
                price: `${productSymbol}${productPrice}`,
                img: productImg,
                url: productUrl,
                desc: productDesc,
              };
            } else {
              console.error(
                `Failed to fetch details for product: ${productUrl}`
              );
              return null;
            }
          } else {
            return null;
          }
        })
    );

    const validProducts: Product[] = products.filter(
      (product): product is Product => product !== null
    );

    if (categoryName && validProducts.length > 0) {
      if (!allProducts[categoryName]) {
        allProducts[categoryName] = [];
      }
      allProducts[categoryName].push(...validProducts);
    }
  } catch (error) {
    console.error(`Error processing page ${url}:`, error);
  }
}
