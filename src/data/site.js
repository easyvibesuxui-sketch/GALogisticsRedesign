/* ==========================================================================
   Site-wide content & configuration.
   --------------------------------------------------------------------------
   All copy lives in /src/data so the redesign never hard-codes text into
   markup. Replacing a string here updates every page that uses it.
   ========================================================================== */

export const site = {
  name: 'GA Logistics LLC',
  shortName: 'GA Logistics',
  tagline: 'Trailer rental, Dispatching & Trucking services in USA',
  description:
    'GA Logistics LLC offers trailer rental, dispatching, truck repair, parking and CDL driver jobs across the USA.',
  url: 'https://galogisticsllc.com',
  locale: 'en_US',
};

export const contact = {
  address: {
    street: '357 County Rd',
    city: 'Cliffwood',
    state: 'NJ',
    zip: '07721',
    country: 'USA',
    get full() {
      return `${this.street}, ${this.city}, ${this.state}, ${this.zip}, ${this.country}`;
    },
  },
  phone: { label: '+1 717 340 2181', href: 'tel:+17173402181' },
  emails: [
    { label: 'Info@galogisticsllc.com', href: 'mailto:Info@galogisticsllc.com', role: 'General' },
    { label: 'Dispatch@galogisticsllc.com', href: 'mailto:Dispatch@galogisticsllc.com', role: 'Dispatch' },
    { label: 'hr@galogisticsllc.com', href: 'mailto:hr@galogisticsllc.com', role: 'Drivers & HR' },
  ],
  yards: [
    { city: 'Cliffwood', state: 'NJ' },
    { city: 'Indianapolis', state: 'IN' },
  ],
  hours: '24 / 7 dispatch',
};

/* Set this to a form-handling endpoint (Formspree, Netlify Forms, your own
   API…) to make the contact form submit for real. While it is empty the form
   degrades to a pre-filled email, so the page is never a dead end. */
export const formEndpoint = '';

export const social = [
  { label: 'Facebook', href: 'https://www.facebook.com/GALOGISTICSLLC/' },
  { label: 'Instagram', href: 'https://www.instagram.com/galogisticsllc/' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/ga-logistics-llc' },
];

/* --------------------------------------------------------------------------
   Navigation — mirrors the live site's URL architecture 1:1.
   -------------------------------------------------------------------------- */

export const nav = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about-us/' },
  {
    label: 'Our Services',
    href: '/our-services/',
    children: [
      { label: 'Transportation', href: '/services/transportation/' },
      { label: 'Dispatching', href: '/services/dispatching/' },
      { label: 'Port-to-Destination Logistics', href: '/services/port-to-destination-logistics/' },
      { label: 'Trailer Rental', href: '/services/trailer-rental/' },
      { label: 'Cargo Pick-up & Parking', href: '/services/parking/' },
      { label: 'Car Carrier Dispatch', href: '/services/car-carrier-dispatch/' },
      { label: 'Shop', href: '/services/shop/' },
      { label: 'Truck Dispatching Courses', href: '/services/truck-dispatching-courses/' },
    ],
  },
  { label: 'Our Team', href: '/our-team/' },
  { label: 'Gallery', href: '/gallery/' },
  { label: 'Contact Us', href: '/contact-us/' },
];

export const cta = {
  primary: { label: 'Contact Us', href: '/contact-us/' },
  secondary: { label: 'Our Services', href: '/our-services/' },
};

/* --------------------------------------------------------------------------
   Numbers used across the site (counters animate to `value`).
   -------------------------------------------------------------------------- */

export const stats = [
  { value: 10, suffix: '', label: 'Years serving customers within the USA' },
  { value: 200, suffix: '', label: 'Power units in the fleet' },
  { value: 48, suffix: '', label: 'States of America covered' },
  { value: 24, suffix: '/7', label: 'Dispatching, in multiple languages' },
];

export const footerNote =
  '© ' + new Date().getFullYear() + ' GA Logistics LLC. All rights reserved.';
