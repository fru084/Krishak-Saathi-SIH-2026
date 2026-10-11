/**
 * Curated, hand-written diagnoses for four common Indian crop diseases.
 * Used two ways:
 *  - lib/api.ts seeds its in-memory mock "database" from this list
 *  - app/api/diagnose/route.ts matches a real Plant.id disease name against
 *    this list so a live API result still ships with a full, reviewed
 *    treatment plan instead of whatever sparse text the API returns
 */

import type { DiagnosisResult } from './types'

export const CURATED_DIAGNOSES: DiagnosisResult[] = [
  {
    id: 'dx-1001',
    crop: 'Tomato',
    disease: 'Early Blight',
    scientificName: 'Alternaria solani',
    confidence: 94,
    severity: 'High',
    imageUrl: '/scans/tomato-early-blight.png',
    overview:
      'Early blight is a fungal disease that starts on the lower, older leaves and moves upward. Dark brown spots with concentric rings appear, ringed by a yellow halo. Left untreated it defoliates the plant and the exposed fruit scalds in the sun.',
    symptoms: [
      'Brown spots with concentric "target" rings on older leaves',
      'Yellow halo around each spot',
      'Leaves drying from the bottom of the plant upward',
      'Dark sunken lesions near the fruit stem',
    ],
    treatment: {
      organic: [
        {
          step: 1,
          title: 'Remove infected leaves',
          detail:
            'Pluck and burn all spotted lower leaves. Do not leave them between the rows or on the bund.',
        },
        {
          step: 2,
          title: 'Spray neem oil',
          detail:
            'Spray in the evening, covering the underside of the leaves. Repeat every 7 days for 3 weeks.',
          input: 'Neem oil 5 ml + 1 g soap per litre of water',
        },
        {
          step: 3,
          title: 'Apply Trichoderma to the soil',
          detail:
            'Mix with farmyard manure and apply near the root zone to suppress soil-borne spores.',
          input: 'Trichoderma viride 5 kg per acre',
        },
        {
          step: 4,
          title: 'Mulch the base',
          detail:
            'A 5 cm straw mulch stops rain splash from carrying spores back onto the leaves.',
        },
      ],
      chemical: [
        {
          step: 1,
          title: 'First spray — Mancozeb',
          detail:
            'Cover the whole canopy. Avoid spraying if rain is expected within 4 hours.',
          input: 'Mancozeb 75% WP, 2.5 g per litre',
        },
        {
          step: 2,
          title: 'Second spray after 10 days',
          detail:
            'Rotate the molecule so the fungus does not build resistance.',
          input: 'Chlorothalonil 75% WP, 2 g per litre',
        },
        {
          step: 3,
          title: 'Third spray if spots continue',
          detail: 'Only if fresh spots appear on new growth after 10 more days.',
          input: 'Azoxystrobin 23% SC, 1 ml per litre',
        },
      ],
      safetyNote:
        'Wear a mask and full sleeves while spraying. Keep a 7 day gap between the last spray and harvest.',
    },
    prevention: [
      'Rotate tomato with a non-solanaceous crop for at least 2 seasons',
      'Space plants for airflow and stake them off the ground',
      'Irrigate at the base — avoid overhead watering in the evening',
      'Choose resistant varieties such as Arka Rakshak where available',
    ],
    similarCases: [
      {
        id: 'sc-1',
        village: 'Karadi',
        crop: 'Tomato',
        disease: 'Early Blight',
        distanceKm: 4,
        outcome: 'Controlled in 18 days with neem + mancozeb rotation',
      },
      {
        id: 'sc-2',
        village: 'Sultanpur',
        crop: 'Tomato',
        disease: 'Early Blight',
        distanceKm: 11,
        outcome: 'Lost 20% yield — treatment started too late',
      },
    ],
    createdAt: '2026-08-21T06:40:00.000Z',
    savedOffline: true,
  },
  {
    id: 'dx-1002',
    crop: 'Rice',
    disease: 'Rice Blast',
    scientificName: 'Magnaporthe oryzae',
    confidence: 88,
    severity: 'Medium',
    imageUrl: '/scans/rice-blast.png',
    overview:
      'Blast shows up as grey, spindle-shaped lesions with brown borders. High humidity with cool nights makes it spread fast, and infection at the neck stage can empty the panicle completely.',
    symptoms: [
      'Diamond or spindle shaped lesions with grey centres',
      'Lesions joining together and killing the leaf tip',
      'Blackened node just below the panicle',
      'Partly filled or chaffy grain',
    ],
    treatment: {
      organic: [
        {
          step: 1,
          title: 'Drain and dry the field',
          detail:
            'Let the field dry for 2–3 days to break the humidity the fungus needs.',
        },
        {
          step: 2,
          title: 'Spray Pseudomonas',
          detail: 'Spray at dusk on two occasions, 10 days apart.',
          input: 'Pseudomonas fluorescens 5 g per litre',
        },
        {
          step: 3,
          title: 'Stop extra nitrogen',
          detail:
            'Hold back the next urea dose — soft, nitrogen-rich leaves invite blast.',
        },
      ],
      chemical: [
        {
          step: 1,
          title: 'Tricyclazole spray',
          detail: 'Target the neck region at the boot leaf stage.',
          input: 'Tricyclazole 75% WP, 0.6 g per litre',
        },
        {
          step: 2,
          title: 'Follow-up spray',
          detail: 'Repeat once after 12 days if fresh lesions appear.',
          input: 'Isoprothiolane 40% EC, 1.5 ml per litre',
        },
      ],
      safetyNote:
        'Do not spray against the wind. Rinse the sprayer tank away from any water channel.',
    },
    prevention: [
      'Treat seed before sowing and use certified seed',
      'Keep balanced nitrogen — split the dose instead of one heavy application',
      'Avoid dense transplanting; keep 20 x 15 cm spacing',
      'Remove weed hosts on the bunds',
    ],
    similarCases: [
      {
        id: 'sc-3',
        village: 'Bhilwada',
        crop: 'Rice',
        disease: 'Rice Blast',
        distanceKm: 7,
        outcome: 'Recovered fully after field drying + tricyclazole',
      },
    ],
    createdAt: '2026-08-18T11:05:00.000Z',
    savedOffline: true,
  },
  {
    id: 'dx-1003',
    crop: 'Wheat',
    disease: 'Yellow Stripe Rust',
    scientificName: 'Puccinia striiformis',
    confidence: 91,
    severity: 'Medium',
    imageUrl: '/scans/wheat-rust.png',
    overview:
      'Yellow rust forms powdery orange-yellow pustules in stripes along the veins. It thrives in cool, moist weather and can cut grain weight sharply if it reaches the flag leaf.',
    symptoms: [
      'Bright yellow pustules in stripes along the leaf veins',
      'Yellow powder on hands and clothes when you touch the crop',
      'Early drying of the flag leaf',
      'Shrivelled, light grain',
    ],
    treatment: {
      organic: [
        {
          step: 1,
          title: 'Scout and mark hotspots',
          detail:
            'Rust starts in patches. Mark them and check every third day.',
        },
        {
          step: 2,
          title: 'Spray cow-urine and neem extract',
          detail: 'Useful only at the very first patch stage, not as a cure.',
          input: '1 part cow urine to 10 parts water',
        },
      ],
      chemical: [
        {
          step: 1,
          title: 'Propiconazole spray',
          detail: 'Spray the marked patch plus a 10 m buffer around it.',
          input: 'Propiconazole 25% EC, 1 ml per litre',
        },
        {
          step: 2,
          title: 'Whole-field spray if it spreads',
          detail: 'Repeat after 15 days only if new pustules keep appearing.',
          input: 'Tebuconazole 25.9% EC, 1 ml per litre',
        },
      ],
      safetyNote:
        'Spray after 4 pm to protect pollinators and reduce evaporation loss.',
    },
    prevention: [
      'Sow rust-resistant varieties recommended for your zone',
      'Do not sow too early or too late in the window',
      'Destroy volunteer wheat plants that carry rust between seasons',
      'Report the first rust patch to your Krishi Vigyan Kendra',
    ],
    similarCases: [
      {
        id: 'sc-4',
        village: 'Rampur',
        crop: 'Wheat',
        disease: 'Yellow Stripe Rust',
        distanceKm: 15,
        outcome: 'Contained with a single propiconazole spray',
      },
    ],
    createdAt: '2026-07-30T05:20:00.000Z',
    savedOffline: false,
  },
  {
    id: 'dx-1004',
    crop: 'Cotton',
    disease: 'Leaf Curl Virus',
    scientificName: 'Cotton leaf curl virus (CLCuV)',
    confidence: 79,
    severity: 'Low',
    imageUrl: '/scans/cotton-leaf-curl.png',
    overview:
      'Leaf curl is a whitefly-transmitted virus. There is no spray that cures the virus itself, so control depends on managing the whitefly and removing infected plants early.',
    symptoms: [
      'Upward or downward curling of the leaf margins',
      'Thickened, darkened veins on the underside',
      'Small leafy outgrowths on the veins',
      'Stunted plants with fewer bolls',
    ],
    treatment: {
      organic: [
        {
          step: 1,
          title: 'Uproot severely affected plants',
          detail: 'Remove them from the field so whiteflies cannot pick up the virus.',
        },
        {
          step: 2,
          title: 'Install yellow sticky traps',
          detail: 'Place just above the canopy and replace when covered.',
          input: '10 traps per acre',
        },
        {
          step: 3,
          title: 'Spray neem-based formulation',
          detail: 'Focus on the underside of leaves where whiteflies rest.',
          input: 'Azadirachtin 1500 ppm, 3 ml per litre',
        },
      ],
      chemical: [
        {
          step: 1,
          title: 'Whitefly knockdown',
          detail: 'Only if whitefly count crosses 6 adults per leaf.',
          input: 'Diafenthiuron 50% WP, 1.2 g per litre',
        },
      ],
      safetyNote:
        'Do not repeat the same insecticide twice in a row — whiteflies develop resistance quickly.',
    },
    prevention: [
      'Sow tolerant hybrids and avoid late sowing',
      'Keep the field and bunds free of weed hosts',
      'Grow a maize or sorghum barrier row on the windward side',
      'Monitor whitefly weekly from the third week after sowing',
    ],
    similarCases: [
      {
        id: 'sc-5',
        village: 'Nandgaon',
        crop: 'Cotton',
        disease: 'Leaf Curl Virus',
        distanceKm: 9,
        outcome: 'Stopped spreading after roguing + sticky traps',
      },
    ],
    createdAt: '2026-07-12T09:15:00.000Z',
    savedOffline: false,
  },
  {
    id: 'dx-1005',
    crop: 'Onion',
    disease: 'Purple Blotch',
    scientificName: 'Alternaria porri',
    confidence: 87,
    severity: 'Medium',
    imageUrl: '',
    overview:
      'Purple blotch starts as small white flecks on the leaf that grow into purple-brown patches with concentric rings. Warm, humid weather after rain spreads it fast, and it can girdle and collapse the leaf if untreated.',
    symptoms: [
      'Small white sunken flecks that enlarge into purple-brown patches',
      'Concentric rings inside older patches',
      'Leaf tips yellowing and drooping over',
      'Neck rot in stored bulbs from infected tops',
    ],
    treatment: {
      organic: [
        {
          step: 1,
          title: 'Remove infected leaf tips',
          detail: 'Cut and destroy the collapsed leaf tips before spraying, so treatment reaches healthy tissue.',
        },
        {
          step: 2,
          title: 'Spray Trichoderma-based bio-fungicide',
          detail: 'Apply in the evening, repeat every 10 days during humid spells.',
          input: 'Trichoderma viride 5 g per litre',
        },
        {
          step: 3,
          title: 'Improve field drainage',
          detail: 'Standing water after irrigation extends leaf wetness — level the field and avoid flood irrigation.',
        },
      ],
      chemical: [
        {
          step: 1,
          title: 'Mancozeb spray',
          detail: 'Cover the whole canopy at first sign of white flecks.',
          input: 'Mancozeb 75% WP, 2.5 g per litre',
        },
        {
          step: 2,
          title: 'Follow-up with a systemic fungicide',
          detail: 'Rotate to prevent resistance if fresh patches appear after 10 days.',
          input: 'Propiconazole 25% EC, 1 ml per litre',
        },
      ],
      safetyNote:
        'Stop spraying at least 10 days before harvest — residue on bulbs affects storage quality.',
    },
    prevention: [
      'Use disease-free sets or treated seed',
      'Rotate onion with a non-allium crop for one season',
      'Avoid overhead irrigation in the evening',
      'Space bulbs for airflow between rows',
    ],
    similarCases: [
      {
        id: 'sc-6',
        village: 'Lasalgaon',
        crop: 'Onion',
        disease: 'Purple Blotch',
        distanceKm: 6,
        outcome: 'Controlled with mancozeb rotation, minimal yield loss',
      },
    ],
    createdAt: '2026-08-05T07:30:00.000Z',
    savedOffline: true,
  },
  {
    id: 'dx-1006',
    crop: 'Chilli',
    disease: 'Anthracnose (Fruit Rot)',
    scientificName: 'Colletotrichum capsici',
    confidence: 82,
    severity: 'High',
    imageUrl: '',
    overview:
      'Anthracnose shows up as sunken, circular dark spots on ripening fruit, often with rings of tiny black dots. It spreads quickly in warm, wet weather and can wipe out a large share of the harvest if the first infected fruit are not removed.',
    symptoms: [
      'Sunken circular spots on ripe or ripening fruit',
      'Concentric rings of small black fungal dots inside the spot',
      'Fruit shrivelling and dropping early',
      'Dark lesions occasionally on stems and leaves too',
    ],
    treatment: {
      organic: [
        {
          step: 1,
          title: 'Pick and destroy infected fruit immediately',
          detail: 'Do not leave dropped fruit in the field — it keeps spreading spores.',
        },
        {
          step: 2,
          title: 'Spray neem-based formulation',
          detail: 'Cover fruit clusters thoroughly, repeat every 7 days in wet weather.',
          input: 'Neem oil 3 ml per litre',
        },
      ],
      chemical: [
        {
          step: 1,
          title: 'Carbendazim or copper oxychloride spray',
          detail: 'Start at first fruit set as a preventive measure, not just after spots appear.',
          input: 'Copper oxychloride 50% WP, 3 g per litre',
        },
        {
          step: 2,
          title: 'Follow-up spray after 10 days',
          detail: 'Rotate the fungicide group if the field stays wet for more than a week.',
          input: 'Azoxystrobin 23% SC, 1 ml per litre',
        },
      ],
      safetyNote:
        'Keep a 7 day gap between the last spray and picking fruit for market.',
    },
    prevention: [
      'Use certified disease-free seed',
      'Stake plants to keep fruit off the wet soil',
      'Avoid overhead irrigation during flowering and fruiting',
      'Remove and destroy crop debris after harvest',
    ],
    similarCases: [
      {
        id: 'sc-7',
        village: 'Byadgi',
        crop: 'Chilli',
        disease: 'Anthracnose (Fruit Rot)',
        distanceKm: 12,
        outcome: 'Lost 15% of fruit before spotting it — copper spray stopped further spread',
      },
    ],
    createdAt: '2026-08-14T10:00:00.000Z',
    savedOffline: true,
  },
]
