import type { Metadata } from 'next';
import recipes from '@/data/recipes.json';
import RecipeClient from './RecipeClient';

export function generateStaticParams() {
  return recipes.map(r => ({ slug: r.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const r = recipes.find(x => x.slug === params.slug);
  return {
    title: r ? `${r.title} — Recipe — Fresh House` : 'Recipe — Fresh House',
    description: r?.description?.slice(0, 160) || 'Recipe ideas with every ingredient ready to add to your basket.',
  };
}

export default function Page({ params }: { params: { slug: string } }) {
  return <RecipeClient slug={params.slug} />;
}
