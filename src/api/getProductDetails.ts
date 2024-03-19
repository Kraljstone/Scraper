import { Page } from 'puppeteer';
import { getProductInfo } from './getProductInfo';

export async function getProductDetails(
  page: Page,
  productUrl: string
): Promise<string | null> {
  let productDesc: string | null = null;
  const urlObj = new URL(productUrl);
  const productPage = await page.browser().newPage();

  try {
    await productPage.goto(urlObj.origin + urlObj.pathname, {
      waitUntil: 'domcontentloaded',
    });
    const elementHandle = await productPage.$(
      '.wt-content-toggle__body.wt-content-toggle__body--truncated-02.wt-content-toggle__body--truncated > p'
    );

    if (elementHandle) {
      await productPage.waitForSelector(
        '.wt-content-toggle__body.wt-content-toggle__body--truncated-02.wt-content-toggle__body--truncated > p',
        { timeout: 5000 }
      );
      productDesc = await getProductInfo(
        productPage,
        '.wt-content-toggle__body.wt-content-toggle__body--truncated-02.wt-content-toggle__body--truncated > p'
      );
    } else {
      console.log('Element with the specified selector does not exist.');
    }
  } catch (error) {
    console.error(`Error navigating to product page ${productUrl}:`, error);
  } finally {
    await productPage.close();
  }

  return productDesc;
}
