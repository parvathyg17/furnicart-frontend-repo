

import api from "../../services/api";



export const getAddressesAPI = async () => {

  const res = await api.get("address/");

  return res.data;
};



export const addAddressAPI = async (data) => {

  const res = await api.post(
    "address/",
    data
  );

  return res.data;
};



export const updateAddressAPI = async ({
  id,
  data,
}) => {

  const res = await api.put(
    `address/${id}/`,
    data
  );

  return res.data;
};



export const deleteAddressAPI = async (id) => {

  const res = await api.delete(
    `address/${id}/`
  );

  return res.data;
};



export const setDefaultAddressAPI = async (id) => {

  const res = await api.patch(
    `address/${id}/set-default/`
  );

  return res.data;
};