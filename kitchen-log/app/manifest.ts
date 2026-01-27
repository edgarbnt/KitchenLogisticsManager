import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Kitchen Logistics Manager',
        short_name: 'KitchenLog',
        description: 'Gérez votre cuisine intelligemment',
        start_url: '/',
        display: 'standalone',
        background_color: '#f8fafc',
        theme_color: '#10b981',
        icons: [
            {
                src: '/icon-192.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/icon-512.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    };
}