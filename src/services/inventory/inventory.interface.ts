import { CreateInventoryParams, ListInventoriesParams, ListInventoryResultT } from "../../types/inventory";
import { ServiceResponseT } from "../../types/common";

export interface IAdminInventoryService {
  listInventories(params: ListInventoriesParams): Promise<ServiceResponseT<ListInventoryResultT>>;
  createInventory(params: CreateInventoryParams & { createdById?: number }): Promise<ServiceResponseT<null>>;
}
