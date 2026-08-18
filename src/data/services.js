/* ==========================================================================
   Service pages.
   --------------------------------------------------------------------------
   `slug` maps to /services/<slug>/ and mirrors the live URL architecture.
   Copy marked  // verbatim  was taken from the live site and must not be
   reworded; see CONTENT-NOTES.md for the audit trail.
   ========================================================================== */

export const services = [
  {
    slug: 'transportation',
    index: '01',
    label: 'Transportation',
    title: 'Transportation',
    eyebrow: 'Asset-based carrier',
    summary:
      'Reliable, efficient and professional transportation across 48 states of the United States.',
    intro: [
      // verbatim
      'GA Logistics provides reliable, efficient, and professional transportation services across 48 states of the United States.',
      // verbatim
      'We have a fleet of well-maintained trucks and experienced drivers to ensure that goods are delivered safely, on time, and in perfect condition.',
    ],
    points: [
      { title: '48 states', text: 'Nationwide coverage across the continental United States.' },
      { title: 'Own fleet', text: 'Asset-based capacity with full operational control over every load.' },
      { title: 'Maintained equipment', text: 'Well-maintained trucks serviced in our own repair shop.' },
      { title: 'Experienced drivers', text: 'Drivers supported by dispatchers who know the lanes.' },
    ],
    specs: [
      { k: 'Coverage', v: '48 states' },
      { k: 'Fleet', v: '±200 power units' },
      { k: 'Model', v: 'Asset-based' },
      { k: 'Dispatch', v: '24/7' },
    ],
    media: { hero: 'transportation-hero', gallery: ['transportation-1', 'transportation-2'] },
  },
  {
    slug: 'dispatching',
    index: '02',
    label: 'Dispatching',
    title: 'Truck Dispatching Services',
    eyebrow: '24/7, multilingual',
    summary:
      'Load planning, route optimization and real-time tracking from dispatchers with years in the industry.',
    intro: [
      // verbatim
      'GA Logistics offers a wide range of dispatching services, including load planning, route optimization, and real-time tracking.',
      // verbatim
      'Each team has its own team leader, and our dispatchers have years of experience in the industry and work closely with drivers to ensure timely deliveries.',
    ],
    points: [
      { title: 'Load planning', text: 'Freight matched to equipment, hours and home time.' },
      { title: 'Route optimization', text: 'Lanes planned around fuel, tolls and delivery windows.' },
      { title: 'Real-time tracking', text: 'Live visibility on every load, start to finish.' },
      { title: 'Team leaders', text: 'Each dispatch team runs under its own team leader.' },
    ],
    specs: [
      { k: 'Availability', v: '24 / 7' },
      { k: 'Languages', v: 'Multiple' },
      { k: 'Equipment', v: 'Dry van · Flatbed · Step deck · Reefer' },
      { k: 'Structure', v: 'Team leader per desk' },
    ],
    media: { hero: 'dispatching-hero', gallery: ['dispatching-1', 'dispatching-2'] },
  },
  {
    slug: 'port-to-destination-logistics',
    index: '03',
    label: 'Port-to-Destination Logistics',
    title: 'Port-to-Destination Logistics',
    eyebrow: 'Drayage & container transport',
    summary: 'Container transport, drayage and freight delivery from ports nationwide.',
    intro: [
      // verbatim
      'GA Logistics LLC provides container transport, drayage and freight delivery from ports nationwide.',
    ],
    points: [
      { title: 'Container transport', text: 'Containers moved from the terminal to the door.' },
      { title: 'Drayage', text: 'Short-haul port moves handled by our own equipment.' },
      { title: 'Nationwide ports', text: 'Coverage from ports across the country.' },
      { title: 'Final delivery', text: 'One carrier from the port to the final destination.' },
    ],
    specs: [
      { k: 'Service', v: 'Drayage & container transport' },
      { k: 'Origin', v: 'Ports nationwide' },
      { k: 'Handoffs', v: 'None — single carrier' },
      { k: 'Dispatch', v: '24/7' },
    ],
    media: { hero: 'port-hero', gallery: ['port-1', 'port-2'] },
  },
  {
    slug: 'trailer-rental',
    index: '04',
    label: 'Trailer Rental',
    title: 'Trailer Rental & Sale',
    eyebrow: 'Semi, dry van & flatbed',
    summary: 'Dry vans, flatbeds, step decks and reefer trailers available for rent.',
    intro: [
      // verbatim
      'We have a variety of trailers available for rent, including Dry vans, Flatbeds, Step deck and Reefer trailers.',
    ],
    points: [
      { title: 'Dry vans', text: '53-foot dry vans ready to work.' },
      { title: 'Flatbeds', text: 'Open-deck equipment for oversized and industrial freight.' },
      { title: 'Step decks', text: 'Drop-deck trailers for taller loads.' },
      { title: 'Reefers', text: 'Temperature-controlled trailers for sensitive freight.' },
    ],
    specs: [
      { k: 'Equipment', v: 'Dry van · Flatbed · Step deck · Reefer' },
      { k: 'Terms', v: 'Rental & sale' },
      { k: 'Yards', v: 'Cliffwood, NJ · Indianapolis, IN' },
      { k: 'Support', v: 'In-house repair shop' },
    ],
    media: { hero: 'trailer-hero', gallery: ['trailer-1', 'trailer-2'] },
  },
  {
    slug: 'parking',
    index: '05',
    label: 'Cargo Pick-up & Parking',
    title: 'Cargo Pick-up & Trailer Parking',
    eyebrow: 'Secured yards',
    summary: 'Parking space for trucks and trailers in Cliffwood, NJ and Indianapolis, IN.',
    intro: [
      // verbatim
      'GA Logistics provides parking space for trucks and trailers.',
      // verbatim
      'We understand the importance of safe and secure truck parking.',
    ],
    points: [
      { title: 'Cliffwood, NJ', text: 'Yard space on the East Coast, minutes from the port lanes.' },
      { title: 'Indianapolis, IN', text: 'Midwest yard for cross-country staging.' },
      { title: 'Trucks & trailers', text: 'Room for power units and trailers alike.' },
      { title: 'Cargo pick-up', text: 'Freight collected and staged for the next leg.' },
    ],
    specs: [
      { k: 'Locations', v: 'Cliffwood, NJ · Indianapolis, IN' },
      { k: 'Space for', v: 'Trucks & trailers' },
      { k: 'Priority', v: 'Safe and secure' },
      { k: 'Access', v: 'Coordinated with dispatch' },
    ],
    media: { hero: 'parking-hero', gallery: ['parking-1', 'parking-2'] },
  },
  {
    slug: 'car-carrier-dispatch',
    index: '06',
    label: 'Car Carrier Dispatch',
    title: 'Car Carrier Dispatch',
    eyebrow: 'Auto transport desk',
    summary: 'A dedicated dispatch desk for car haulers.',
    intro: [
      'GA Logistics LLC provides car carrier dispatch as part of its dispatching services.',
    ],
    points: [
      { title: 'Dedicated desk', text: 'Dispatchers who work car-hauling lanes daily.' },
      { title: 'Load planning', text: 'Multi-unit loads planned around pickup and delivery windows.' },
      { title: 'Real-time tracking', text: 'Live status on every vehicle on the deck.' },
      { title: 'Paperwork', text: 'Rate confirmations and documents handled by the desk.' },
    ],
    specs: [
      { k: 'Service', v: 'Car carrier dispatch' },
      { k: 'Availability', v: '24 / 7' },
      { k: 'Languages', v: 'Multiple' },
      { k: 'Structure', v: 'Team leader per desk' },
    ],
    media: { hero: 'carcarrier-hero', gallery: ['carcarrier-1', 'carcarrier-2'] },
  },
  {
    slug: 'shop',
    index: '07',
    label: 'Shop',
    title: 'Truck & Trailer Repair Shop',
    eyebrow: 'In-house maintenance',
    summary: 'A shop built around the needs of truck owners, equipped to keep equipment in top condition.',
    intro: [
      // verbatim
      'Our shop caters to the needs of truck owners and is equipped with state-of-the-art tools and equipment to ensure trucks are well-maintained and in top condition.',
    ],
    points: [
      { title: 'Truck repair', text: 'Diagnostics and repair for power units.' },
      { title: 'Trailer repair', text: 'Maintenance across dry van, flatbed, step deck and reefer.' },
      { title: 'Modern tooling', text: 'State-of-the-art tools and equipment on site.' },
      { title: 'Owner-operators welcome', text: 'Built around what truck owners actually need.' },
    ],
    specs: [
      { k: 'Serves', v: 'Trucks & trailers' },
      { k: 'Equipment', v: 'State-of-the-art tooling' },
      { k: 'Located', v: 'Cliffwood, NJ' },
      { k: 'For', v: 'Fleets & owner-operators' },
    ],
    media: { hero: 'shop-hero', gallery: ['shop-1', 'shop-2'] },
  },
  {
    slug: 'truck-dispatching-courses',
    index: '08',
    label: 'Truck Dispatching Courses',
    title: 'Truck Dispatching Courses',
    eyebrow: 'Training',
    summary:
      'A three-week course covering load planning, route optimization and safety regulations.',
    intro: [
      // verbatim
      'We offer truck dispatching courses to help people learn the skills needed to become a successful dispatcher.',
      // verbatim
      'The course covers topics such as load planning, route optimization, and safety regulations.',
    ],
    points: [
      { title: 'Dry van', text: 'The course mainly covers 53-foot dry van dispatching.' },
      { title: 'Flatbed & step deck', text: 'Open-deck freight, securement and permits.' },
      { title: 'Reefer', text: 'Temperature-controlled loads and their paperwork.' },
      { title: 'Led by a team leader', text: 'Taught by Ani Kapanadze, an experienced dispatcher and team leader at GA Logistics LLC.' },
    ],
    specs: [
      { k: 'Duration', v: '3 weeks' },
      { k: 'Schedule', v: '2 meetings per week' },
      { k: 'Covers', v: 'Dry van · Flatbed · Step deck · Reefer' },
      { k: 'Trainer', v: 'Ani Kapanadze' },
    ],
    media: { hero: 'courses-hero', gallery: ['courses-1', 'courses-2'] },
  },
];

export const serviceGroups = [
  'Transportation & Dispatching',
  'Cargo Pick-up & Trailer Parking',
  'Trailer Rental & Sale',
  'Car Carrier Dispatch',
  'Truck & Trailer Repair Shop',
];

export const getService = (slug) => services.find((service) => service.slug === slug);
