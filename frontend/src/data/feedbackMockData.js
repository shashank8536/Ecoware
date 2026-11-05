export const feedbackCategories = [
  'Garbage Collection',
  'Collection Timeliness',
  'Sanitation Worker Behaviour',
  'Complaint Resolution',
  'Overall Service',
  'Other',
]

export const ratingLabels = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent']

export const initialFeedbackHistory = [
  {
    id: 'FB-2088',
    rating: 4,
    category: 'Garbage Collection',
    subject: 'Morning collection is consistent this month',
    description:
      'The truck has been arriving on time for the past three weeks in our lane. Staff empty the bins neatly.',
    submittedOn: '2026-01-26',
    response: {
      text: 'Thank you for the appreciation. We will continue monitoring on-time performance in your ward.',
      respondedOn: '2026-01-27',
    },
  },
  {
    id: 'FB-2081',
    rating: 2,
    category: 'Sanitation Worker Behaviour',
    subject: 'Bins left uncovered after pickup',
    description:
      'Lids were left open and some waste spilled on the road while loading. Requesting staff to secure bins properly.',
    submittedOn: '2026-01-18',
    response: null,
  },
  {
    id: 'FB-2073',
    rating: 3,
    category: 'Collection Timeliness',
    subject: 'Saturday pickup delayed by hours',
    description:
      'The Saturday round reached our street around noon instead of the morning slot mentioned in the schedule.',
    submittedOn: '2026-01-10',
    response: {
      text: 'Route 8-B has been rescheduled from next Saturday. Expect the truck between 7 and 9 AM.',
      respondedOn: '2026-01-12',
    },
  },
]
