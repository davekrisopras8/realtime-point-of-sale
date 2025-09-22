export const HEADER_TABLE_ORDER = [
  "No",
  "Order ID",
  "Customer Name",
  "Table",
  "Status",
  "Action",
];

export const INITIAL_ORDER = {
  customer_name: "",
  table_id: "",
  status: "",
};

export const INITIAL_STATE_ORDER = {
  status: "idle",
  errors: {
    customer_name: [],
    table_id: [],
    status: [],
    _form: [],
  },
};

export const STATUS_CREATE_ORDER = [
  {
    value: "Reserved",
    label: "Reserved",
  },
  {
    value: "Process",
    label: "Process",
  },
];

export const HEADER_TABLE_DETAIL_ORDER = [
  "No",
  "Menu",
  "Total",
  "Status",
  "Action",
];

export const FILTER_MENU = [
  {
    value: "",
    label: "All",
  },
  {
    value: "Appetizers",
    label: "Appetizers",
  },
  {
    value: "Soups",
    label: "Soups",
  },
  {
    value: "Salads",
    label: "Salads",
  },
  {
    value: "Main Course",
    label: "Main Course",
  },
  {
    value: "Desserts",
    label: "Desserts",
  },
  {
    value: "Beverages",
    label: "Beverages",
  },
];
