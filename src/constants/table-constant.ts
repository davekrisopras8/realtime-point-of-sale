export const HEADER_TABLE_TABLE = [
  'No',
  'Name',
  'Capacity',
  'Status',
  'Action',
];

export const STATUS_TABLE_LIST = [
  {
    value: 'Available',
    label: 'Available',
  },
  {
    value: 'Unavailable',
    label: 'Unavailable',
  },
  {
    value: 'Reserved',
    label: 'Reserved',
  },
];

export const INITIAL_TABLE = {
  name: '',
  description: '',
  capacity: '',
  status: '',
};

export const INITIAL_STATE_TABLE = {
  status: 'idle',
  errors: {
    id: [],
    name: [],
    description: [],
    capacity: [],
    status: [],
    _form: [],
  },
};
