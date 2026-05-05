import { ServiceResponseT } from "../../types/common";
import { HomeDataT } from "../../types/home";

export interface IHomeService {
  getHomeData(
    userId?: string | number,
    gender?: string
  ): Promise<ServiceResponseT<HomeDataT>>;
}
