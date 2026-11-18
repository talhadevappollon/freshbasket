<?php

namespace App\Support;

use App\Models\StoreSetting;

/**
 * The home page banners the admin panel edits (Admin → Homepage Banners), kept as one JSON value in
 * store_settings. Until something is saved, the website's original banners are used.
 *
 *  hero      the slider at the top: one entry per slide
 *  promo     the green "Order groceries & more" banner under the slider (desktop)
 *  showcase  the tall pictures beside Fresh Fruits, Fresh Vegetables and Premium Nuts & Dry Fruits (large screens)
 *  tiles     the first tile of the Family Membership, Bundle boxes and Gift Baskets rows (an icon until a picture is set)
 */
class HomeBanners
{
    public const KEY = 'home_banners';

    public const SHOWCASE = [
        'fruits' => 'Fresh Fruits',
        'vegetables' => 'Fresh Vegetables',
        'nuts' => 'Premium Nuts & Dry Fruits',
    ];

    public const TILES = [
        'membership' => 'Family Membership Plans row',
        'bundles' => 'Bundle boxes row',
        'gifts' => 'Gift Baskets row',
    ];

    public static function defaults(): array
    {
        return [
            'hero' => [
                [
                    'image' => '/banners/coming-soon-bag-2496.webp',
                    'image_mobile' => '/banners/coming-soon-bag-1248.webp',
                    'alt' => 'Fresh House is coming soon: a paper bag overflowing with fresh vegetables and fruit.',
                    'link' => '',
                ],
                [
                    'image' => '/banners/coming-soon-karachi-2496.webp',
                    'image_mobile' => '/banners/coming-soon-karachi-1248.webp',
                    'alt' => 'Fresh House, the house of freshness, is coming soon to Karachi. Fresher choices closer to you.',
                    'link' => '',
                ],
                [
                    'image' => '/banners/wrapped-with-love-2496.webp',
                    'image_mobile' => '/banners/wrapped-with-love-1248.webp',
                    'alt' => 'Fresh House: wrapped with love. A gold-embossed green gift box carrying the Fresh House logo.',
                    'link' => '',
                ],
            ],
            'promo' => [
                'title' => 'Order groceries & more for same-day delivery',
                'text' => 'Fresh fruit, vegetables, dry fruits and pantry staples across Karachi.',
                'button_label' => 'Order today',
                'button_link' => '#bestsellers',
            ],
            'showcase' => [
                'fruits' => ['image' => '/home/banner-fruits.webp', 'alt' => "Fresh fruits, nature's best delivered fresh", 'link' => '/category/fruits'],
                'vegetables' => ['image' => '/home/banner-vegetables.webp', 'alt' => 'Fresh vegetables handpicked daily for your family', 'link' => '/category/vegetables'],
                'nuts' => ['image' => '/home/banner-nuts.webp', 'alt' => 'Premium nuts, healthy snacking starts here', 'link' => '/category/karachi-nuts-and-dates'],
            ],
            'tiles' => [
                'membership' => ['label' => 'Membership', 'image' => '', 'link' => '/membership-plans'],
                'bundles' => ['label' => 'Offers & Bundles', 'image' => '', 'link' => '/bundle-boxes'],
                'gifts' => ['label' => 'Gift Baskets', 'image' => '', 'link' => '/gift-baskets'],
            ],
        ];
    }

    /** The banners the website shows: what was saved, with the originals filling any gap. */
    public static function get(): array
    {
        $defaults = self::defaults();
        $saved = json_decode((string) StoreSetting::get(self::KEY, ''), true);
        if (! is_array($saved)) {
            return $defaults;
        }

        $showcase = [];
        foreach ($defaults['showcase'] as $key => $original) {
            $showcase[$key] = array_merge($original, array_filter((array) ($saved['showcase'][$key] ?? []), fn ($v) => $v !== null && $v !== ''));
        }
        $tiles = [];
        foreach ($defaults['tiles'] as $key => $original) {
            $tiles[$key] = array_merge($original, array_filter((array) ($saved['tiles'][$key] ?? []), fn ($v) => $v !== null && $v !== ''));
        }

        return [
            'hero' => is_array($saved['hero'] ?? null) ? array_values($saved['hero']) : $defaults['hero'],
            'promo' => array_merge($defaults['promo'], array_filter((array) ($saved['promo'] ?? []), fn ($v) => $v !== null && $v !== '')),
            'showcase' => $showcase,
            'tiles' => $tiles,
        ];
    }

    public static function save(array $banners): void
    {
        StoreSetting::set(self::KEY, json_encode($banners, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE), 'homepage');
    }
}
