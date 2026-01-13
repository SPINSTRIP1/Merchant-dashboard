import { SERVER_URL } from "@/constants";
import api from "@/lib/api/axios-client";
import { CompleteKycFormData } from "../compliance/_schemas";

export async function createMerchantKyc(data: CompleteKycFormData) {
  try {
    const response = await api.post(SERVER_URL + "/kyc/merchant", data);
    return response.data;
  } catch (error) {
    console.log(error);
    throw new Error((error as Error).message);
  }
}
