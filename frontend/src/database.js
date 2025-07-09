let data = [
  { id: 1, name: "Item 1" },
  { id: 2, name: "Item 2" },
];

export const getData = () => data;

export const addItem = (item) => {
  const newItem = { id: Date.now(), ...item };
  data.push(newItem);
  return newItem;
};

export const deleteItem = (id) => {
  data = data.filter((item) => item.id !== id);
};

export const updateItem = (id, updated) => {
  data = data.map((item) => (item.id === id ? { ...item, ...updated } : item));
};
