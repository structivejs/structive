import { raiseError } from "../utils";

export function getCustomTagName(component: HTMLElement): string {
  if (component.tagName.includes('-')) {
    return component.tagName.toLowerCase();
  } else if (component.getAttribute('is')?.includes('-')) {
    return component.getAttribute('is')!.toLowerCase();
  } else {
    raiseError({
      code: 'CE-001',
      message: 'Custom tag name not found',
      context: { where: 'ComponentEngine.customTagName.get' },
      docsUrl: './docs/error-codes.md#ce',
    });
  }

}