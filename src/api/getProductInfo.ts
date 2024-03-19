import { Page, ElementHandle } from 'puppeteer';

export const getProductInfo = async (
  page: Page,
  productHandleOrSelector: ElementHandle<HTMLElement> | string,
  selectorOrAttribute?: string,
  attribute?: string
): Promise<string | null> => {
  try {
    if (typeof productHandleOrSelector === 'string') {
      const selector: string = productHandleOrSelector;
      const attr: string | undefined = selectorOrAttribute;
      return await page.evaluate(
        (sel: string, attr?: string) => {
          const element = document.querySelector(sel);
          return element
            ? attr
              ? element.getAttribute(attr)
              : element.textContent
            : null;
        },
        selector,
        attr
      );
    } else {
      const productHandle: ElementHandle<HTMLElement> = productHandleOrSelector;
      const selector: string = selectorOrAttribute || '';
      return await page.evaluate(
        (el: HTMLElement, sel: string, attr?: string) => {
          const element = el.querySelector(sel);
          return element
            ? attr
              ? element.getAttribute(attr)
              : element.textContent
            : null;
        },
        productHandle,
        selector,
        attribute
      );
    }
  } catch (error) {
    console.error('Error while fetching product info:', error);
    return null;
  }
};
