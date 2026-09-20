// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import react from '@astrojs/react';
import mermaid from 'astro-mermaid';

// https://astro.build/config
export default defineConfig({
	integrations: [
		mermaid(),
		starlight({
			title: "Programmation web 2",
			defaultLocale: "root",
			locales: {
				root: {
					label: 'Français',
					lang: 'fr',
				}
			},
			customCss: [
				'./src/styles/custom.css',
				'./src/styles/global.css',
			],
			lastUpdated: true,
			sidebar: [
				{
					label: 'Notes de cours',
					items: [
						{ label: 'Développement côté serveur', items: [
							{ label: 'Introduction', slug: 'cours/01-introduction' },
							{ label: 'Programmation en PHP', slug: 'cours/02-prog-base-php' },
							{ label: 'Notions avancées de PHP', slug: 'cours/03-prog-avancee-php' },
							{ label: 'Page dynamique', slug: 'cours/03-page-dynamique' },
							{ label: 'Formulaire', slug: 'cours/04-formulaire' },
							// { label: 'Superglobales', slug: 'cours/05-superglobals' },
							{ label: 'Préservation de session et données', slug: 'cours/05-preservation' },
							// { label: 'Programmation orientée objet', slug: 'cours/08-poo' },
							// { label: 'MVC', slug: 'cours/10-mvc' },
						] },
					]
				},
				{
					label: 'Exercices',
					items: [
						{ label: 'Premiers pas avec PHP', slug: 'exercices/01-introduction' },
						{ label: 'Les fonctions en PHP', slug: 'exercices/02-fonctions' },
						{ label: 'Création de site web en PHP', slug: 'exercices/03-navigation' },
						{ label: 'Utilisation de formulaires', slug: 'exercices/04-formulaires' },
						{ label: 'Session et accès BD en PHP ', slug: 'exercices/05-donnees' },
					]
				},
				{
					label: 'Travaux',
					items: [
						{ label: "01. Outil Dex", slug: 'tps/01-outil-dex' },
					]
				},
				{
					label: 'Guides',
					items: [{
						autogenerate: { directory: 'guides' },
					}]
				},
				{
					label: 'Reference',
					items: [{
						autogenerate: { directory: 'reference' },
					}]
				},
			],
		}),
		react(),
	]
});
