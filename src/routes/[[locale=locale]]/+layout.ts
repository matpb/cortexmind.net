import type { LayoutLoad } from './$types';

export const load: LayoutLoad = ({ params }) => ({ locale: params.locale === 'fr' ? 'fr' : 'en' });
