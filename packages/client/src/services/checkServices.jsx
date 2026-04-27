import api from "./api";
const API_URL = "/api/checks/";

const getChecks = async () => {
  const response = await api.get(API_URL);
  return response.data;
};

const createCheck = async (checkData) => {
  const response = await api.post(API_URL, checkData);
  return response.data;
};

const deleteCheck = async (checkId) => {
  const response = await api.delete(`${API_URL}${checkId}`);
  return response.data;
};

const checkService = {
  getChecks,
  createCheck,
  deleteCheck,
};

export default checkService;
 