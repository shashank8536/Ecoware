export const scheduleLocation = {
  ward: 'Ward 8',
  locality: 'Lotus Avenue (sample locality)',
}

export const weeklySchedule = [
  { id: 'wed-wet', day: 3, category: 'Wet Waste', time: '07:00 – 08:00 AM' },
  { id: 'mon-household', day: 1, category: 'Household Waste', time: '07:00 – 08:30 AM' },
  { id: 'tue-plastic', day: 2, category: 'Dry / Plastic Waste', time: '07:30 – 08:30 AM' },
  { id: 'fri-household', day: 5, category: 'Household Waste', time: '07:00 – 08:30 AM' },
  { id: 'sat-construction', day: 6, category: 'Construction Waste', time: '08:00 – 10:00 AM' },
  { id: 'sun-household', day: 0, category: 'Household Waste', time: '07:00 – 08:30 AM' },
]

export const scheduleAnnouncements = [
  {
    id: 'ann-1',
    title: 'Republic Day holiday — collection shifted',
    description:
      'Due to the public holiday, Monday collections in Ward 8 will run one day early. Keep bins ready by Sunday 6 PM.',
    publishedOn: '2026-01-23',
    type: 'Important',
  },
  {
    id: 'ann-2',
    title: 'Special weekend cleaning drive',
    description:
      'A special sanitation drive will cover Lotus Avenue and Green Park this Saturday from 6 AM. Park your vehicles off the main road.',
    publishedOn: '2026-01-20',
    type: 'Information',
  },
  {
    id: 'ann-3',
    title: 'Truck maintenance — possible delays',
    description:
      'Two collection trucks are under maintenance. Dry / Plastic Waste pickups may be delayed by 1–2 hours this week.',
    publishedOn: '2026-01-16',
    type: 'Important',
  },
  {
    id: 'ann-4',
    title: 'New segregation guidelines effective',
    description:
      'Households are requested to separate wet and dry waste at source. Feedback kiosks available at the ward office.',
    publishedOn: '2026-01-10',
    type: 'Information',
  },
]
