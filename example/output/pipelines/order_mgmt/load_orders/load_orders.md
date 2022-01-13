`data classification: PII`
        `triggers: file_arrival`

# pipeline pipeline:order_mgmt.load_orders

- [General](#general)
- [Dependencies](#dependencies)
- [Dependants](#dependants)

# General <a name="general"></a>
Loads orders from raw order system. Performs the following calculation on order value:
  ```order_value = order_qty * order_line_item_value```


# Dependencies Lineage <a name="dependencies"></a>

![image](./dependencies.png)
- [datastore - raw_orders](https://github.com/datayoga-io/lineage/blob/master/example/output//datastores/raw_orders/raw_orders.md)
- [pipeline - ELT.load_raw_orders](https://github.com/datayoga-io/lineage/blob/master/example/output//pipelines/ELT/load_raw_orders/load_raw_orders.md)
- [file - exported_orders](https://github.com/datayoga-io/lineage/blob/master/example/output//files/exported_orders/exported_orders.md)
- [file - customers](https://github.com/datayoga-io/lineage/blob/master/example/output//files/customers/customers.md)

# Dependants Lineage <a name="dependants"></a>

![image](./dependants.png)
- [datastore - orders](https://github.com/datayoga-io/lineage/blob/master/example/output//datastores/orders/orders.md)

# Direct Sources


# Targets


